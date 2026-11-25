import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, exhaustMap, filter, of, startWith, switchMap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { CampusesService } from '../../../core/data/campuses.service';
import { FixedRoutesService, NewFixedRoute } from '../../../core/data/fixed-routes.service';
import { PostalCodeLookup, PostalCodeService } from '../../../core/data/postal-code.service';
import { FixedRouteDirection } from '../../../core/models/fixed-route';
import { FormField } from '../../../shared/ui/form-field/form-field';
import { WeekdayPicker } from '../../../shared/ui/weekday-picker/weekday-picker';
import { isPostalCode, postalCode } from '../../../shared/validators/postal-code';
import { trimmedMinLength, trimmedRequired } from '../../../shared/validators/trimmed';
import { weekdaysCount } from '../../../shared/validators/weekdays-count';

// Os campos que já têm regra própria, pelo nome do controle no formulário.
type ValidatedField =
  | 'campusId'
  | 'postalCode'
  | 'neighborhood'
  | 'meetingPoint'
  | 'weekdays'
  | 'departureTime'
  | 'seats';

// Abaixo de 1, acima de 4 ou número quebrado: a mesma frase para as três regras (CA7).
const SEATS_RANGE_MESSAGE = 'Uma rota tem de 1 a 4 vagas';

// O texto de cada erro, por campo e pela chave que o validador devolve: o mesmo erro tem frases
// diferentes em campos diferentes (o "vazio" do Bairro não é o do Ponto de encontro).
const ERROR_MESSAGES: Record<ValidatedField, Record<string, string>> = {
  campusId: {
    required: 'Uma das pontas precisa ser um campus da UTFPR',
  },
  postalCode: {
    postalCode: 'O CEP tem 8 números',
  },
  neighborhood: {
    trimmedRequired: 'Informe o bairro da outra ponta',
    trimmedMinLength: 'O bairro precisa ter pelo menos 3 letras',
  },
  meetingPoint: {
    trimmedRequired: 'Descreva o ponto de encontro',
    trimmedMinLength: 'Descreva o ponto de encontro com pelo menos 5 caracteres',
  },
  weekdays: {
    tooFewWeekdays: 'Escolha pelo menos um dia da semana',
    tooManyWeekdays: 'Uma rota tem no máximo 5 dias',
  },
  departureTime: {
    required: 'Informe o horário de saída',
  },
  seats: {
    required: 'Informe quantas vagas o carro oferece',
    min: SEATS_RANGE_MESSAGE,
    max: SEATS_RANGE_MESSAGE,
    pattern: SEATS_RANGE_MESSAGE,
  },
};

// A busca do CEP na tela: o que o Service devolve, ou a falha da busca, que a tela traduz (CA8).
type PostalCodeLookupState = PostalCodeLookup | { status: 'failed' };

// Os avisos da busca do CEP. Não são erro de validação: não marcam o campo nem desligam o botão,
// porque o CEP é só uma ajuda para preencher o Bairro (CA8).
const POSTAL_CODE_NOTICES: Record<'not-found' | 'failed', string> = {
  'not-found': 'Não achamos este CEP. Digite o bairro.',
  failed: 'Não deu para buscar o CEP agora. Digite o bairro.',
};

@Component({
  selector: 'app-route-form',
  imports: [ReactiveFormsModule, FormField, WeekdayPicker],
  templateUrl: './route-form.html',
  host: { class: 'mx-auto flex w-full max-w-md flex-col gap-6' },
})
export class RouteForm {
  protected readonly campuses = toSignal(inject(CampusesService).list(), { initialValue: [] });

  private readonly postalCodes = inject(PostalCodeService);

  private readonly auth = inject(AuthService);

  private readonly fixedRoutes = inject(FixedRoutesService);

  private readonly router = inject(Router);

  private readonly formBuilder = inject(FormBuilder).nonNullable;

  // O formulário nasce a cada vez que a tela abre e some quando ela fecha: o que foi digitado não
  // é guardado em lugar nenhum (CA17, spec "Abandono no meio").
  // Os campos obrigatórios começam vazios, então o botão nasce desligado (CA1).
  protected readonly form = this.formBuilder.group({
    campusId: ['', Validators.required],
    direction: this.formBuilder.control<FixedRouteDirection>('to_campus'),
    // Opcional, mas, se preenchido, com o formato de CEP (CA8).
    postalCode: ['', postalCode],
    // Os espaços das pontas não contam (CA3 e CA4).
    neighborhood: ['', [trimmedRequired, trimmedMinLength(3)]],
    meetingPoint: ['', [trimmedRequired, trimmedMinLength(5)]],
    // Os dias marcados, pelo número ISO; nenhum ao abrir (CA5).
    weekdays: this.formBuilder.control<number[]>([], weekdaysCount(1, 5)),
    departureTime: ['', Validators.required],
    // De 1 a 4, e só número inteiro: o padrão recusa o 2,5 (CA7).
    seats: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(4), Validators.pattern(/^\d+$/)],
    ],
  });

  // O limite do Bairro (CA3), que vale também para o bairro que vem do ViaCEP (CA8).
  protected readonly neighborhoodMaxLength = 60;

  // O CEP digitado, como signal: o formulário reativo só o entrega como Observable.
  private readonly postalCodeValue = toSignal(this.form.controls.postalCode.valueChanges, {
    initialValue: this.form.controls.postalCode.value,
  });

  // Só o CEP completo, com os 8 números, é buscado; vazio ou incompleto, não (CA8).
  private readonly postalCodeToLookUp = computed(() => {
    const value = this.postalCodeValue();
    return isPostalCode(value) ? value : undefined;
  });

  // A busca sai assim que o CEP fica completo, sem esperar a pessoa sair do campo. Um CEP novo
  // cancela a busca do anterior (`switchMap`), e o CEP incompleto apaga o resultado da busca.
  // A falha da busca vira `failed` (CA8; architecture.md §2.1, assíncrono ↔ reativo).
  private readonly postalCodeLookup = toSignal(
    toObservable(this.postalCodeToLookUp).pipe(
      switchMap((value) =>
        value === undefined
          ? of(undefined)
          : this.postalCodes
              .lookup(value)
              .pipe(catchError(() => of<PostalCodeLookupState>({ status: 'failed' }))),
      ),
    ),
  );

  // O aviso da busca que não achou o bairro, ligado ao campo CEP (CA8).
  protected readonly postalCodeLookupNotice = computed(() => {
    const lookup = this.postalCodeLookup();
    return lookup && lookup.status !== 'found' ? POSTAL_CODE_NOTICES[lookup.status] : undefined;
  });

  // Cada toque em "Publicar rota" vira um envio; o resultado volta como signal (architecture.md
  // §2.1). O `exhaustMap` não cancela um envio em andamento: cancelar não desfaz a rota já gravada.
  private readonly submission = signal<NewFixedRoute | undefined>(undefined);

  // Todo envio começa sem resultado: assim o `submitting` vale desde o toque.
  private readonly publication = toSignal(
    toObservable(this.submission).pipe(
      filter((route) => route !== undefined),
      exhaustMap((route) => this.fixedRoutes.publish(route).pipe(startWith(undefined))),
    ),
  );

  // Do toque até a tela da rota abrir, o botão mostra "Publicando…" e fica bloqueado (CA10). A rota
  // publicada continua bloqueando: a navegação até a tela dela ainda está em andamento, e um toque
  // nesse meio-tempo gravaria uma segunda rota.
  protected readonly submitting = computed(() => {
    const publication = this.publication();
    return (
      this.submission() !== undefined &&
      (publication === undefined || publication.status === 'published')
    );
  });

  constructor() {
    // O bairro achado pelo CEP vai para o campo Bairro, que continua editável (CA8, ID13). Cortado
    // no limite do campo, para não ligar o erro sem mensagem do `maxlength`. O campo fica alterado,
    // mas não tocado: o aviso do Bairro, se houver, só aparece quando a pessoa sai dele.
    effect(() => {
      const lookup = this.postalCodeLookup();
      if (lookup?.status === 'found') {
        const neighborhood = this.form.controls.neighborhood;
        neighborhood.setValue(lookup.neighborhood.slice(0, this.neighborhoodMaxLength));
        neighborhood.markAsDirty();
      }
    });

    // Gravada a rota, a tela dela abre com o aviso "Rota publicada" (CA9). O `publicada` da URL é o
    // que diferencia quem chega pelo envio de quem abre o endereço da rota direto.
    effect(() => {
      const publication = this.publication();
      if (publication?.status === 'published') {
        this.router.navigate(['/rotas', publication.route.id], { queryParams: { publicada: 1 } });
      }
    });
  }

  // O que vai para o envio são os campos da rota, com a pessoa da sessão como motorista. O CEP fica
  // de fora: ele só ajuda a achar o bairro e não é gravado (CA8).
  protected submit(): void {
    const { campusId, direction, neighborhood, meetingPoint, weekdays, departureTime, seats } =
      this.form.getRawValue();
    // O botão só liga com o formulário válido, e a regra das vagas já recusou o campo vazio (CA7).
    if (seats === null) {
      return;
    }
    this.submission.set({
      driverId: this.auth.currentUserId(),
      campusId,
      direction,
      neighborhood,
      meetingPoint,
      weekdays,
      departureTime,
      seats,
    });
  }

  // O aviso do campo só aparece depois que a pessoa sai dele, e um erro por vez.
  protected errorOf(field: ValidatedField): string | undefined {
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) {
      return undefined;
    }
    const [error] = Object.keys(control.errors);
    return ERROR_MESSAGES[field][error];
  }
}

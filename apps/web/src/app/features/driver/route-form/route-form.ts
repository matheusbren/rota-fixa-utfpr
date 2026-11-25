import { Component, computed, effect, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { CampusesService } from '../../../core/data/campuses.service';
import { PostalCodeLookup, PostalCodeService } from '../../../core/data/postal-code.service';
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

  private readonly formBuilder = inject(FormBuilder).nonNullable;

  // O formulário nasce a cada vez que a tela abre e some quando ela fecha: o que foi digitado não
  // é guardado em lugar nenhum (CA17, spec "Abandono no meio").
  // Os campos obrigatórios começam vazios, então o botão nasce desligado (CA1).
  protected readonly form = this.formBuilder.group({
    campusId: ['', Validators.required],
    direction: 'to_campus',
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

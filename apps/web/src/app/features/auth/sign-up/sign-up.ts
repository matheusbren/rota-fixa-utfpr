import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { exhaustMap, filter, map, startWith } from 'rxjs';
import { AuthService, SignUpData } from '../../../core/auth/auth.service';
import { Banner } from '../../../shared/ui/banner/banner';
import { FormField } from '../../../shared/ui/form-field/form-field';
import { institutionalEmail } from '../../../shared/validators/institutional-email';
import { password } from '../../../shared/validators/password';

// O texto de cada erro de validação, pela chave que o validador devolve.
const ERROR_MESSAGES: Record<string, string> = {
  institutionalEmail: 'Use o seu e-mail da UTFPR',
  passwordLength: 'A senha precisa ter 8 caracteres ou mais',
  passwordLetterAndNumber: 'A senha precisa ter letra e número',
};

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterLink, FormField, Banner],
  templateUrl: './sign-up.html',
  host: { class: 'mx-auto flex w-full max-w-md flex-col gap-6' },
})
export class SignUp {
  private readonly auth = inject(AuthService);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    fullName: '',
    email: ['', institutionalEmail],
    password: ['', password],
  });

  // Cada confirmação vira um envio; o resultado volta como signal (architecture.md §2.1).
  // O `exhaustMap` não cancela um envio em andamento: cancelar não desfaz a conta já gravada.
  private readonly submission = signal<SignUpData | undefined>(undefined);

  // Todo envio começa sem resultado, inclusive a nova tentativa depois de `failed` (CA9):
  // assim o `submitting` também vale para ela.
  protected readonly result = toSignal(
    toObservable(this.submission).pipe(
      filter((data) => data !== undefined),
      exhaustMap((data) => this.auth.signUp(data).pipe(startWith(undefined))),
    ),
  );

  // A conta está sendo gravada do envio até o resultado chegar: o botão fica bloqueado (CA8).
  protected readonly submitting = computed(
    () => this.submission() !== undefined && this.result() === undefined,
  );

  protected submit(): void {
    this.submission.set(this.form.getRawValue());
  }

  // Cada toque em "Reenviar e-mail de verificação" soma um pedido: um contador, e não um
  // booleano, para cada toque virar um novo reenvio. A tela não limita os reenvios; o limite
  // só chega com o Supabase Auth (spec, "Fora de escopo").
  private readonly resendRequests = signal(0);

  protected readonly resent = toSignal(
    toObservable(this.resendRequests).pipe(
      filter((count) => count > 0),
      // O reenvio vai para o e-mail do envio que deu `pending`: a tela já o tem.
      map(() => this.submission()?.email),
      filter((email) => email !== undefined),
      exhaustMap((email) => this.auth.resendVerification(email)),
      map(() => true),
    ),
    { initialValue: false },
  );

  protected resend(): void {
    this.resendRequests.update((count) => count + 1);
  }

  // O aviso do campo só aparece depois que a pessoa sai dele.
  protected errorOf(control: AbstractControl): string | undefined {
    if (!control.touched || !control.errors) {
      return undefined;
    }
    const [error] = Object.keys(control.errors);
    return ERROR_MESSAGES[error];
  }
}

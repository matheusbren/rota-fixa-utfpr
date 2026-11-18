import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { exhaustMap, filter } from 'rxjs';
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
  imports: [ReactiveFormsModule, FormField, Banner],
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

  protected readonly result = toSignal(
    toObservable(this.submission).pipe(
      filter((data) => data !== undefined),
      exhaustMap((data) => this.auth.signUp(data)),
    ),
  );

  protected submit(): void {
    this.submission.set(this.form.getRawValue());
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

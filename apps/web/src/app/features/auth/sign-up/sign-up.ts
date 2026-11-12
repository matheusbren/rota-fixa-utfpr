import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { exhaustMap, filter } from 'rxjs';
import { AuthService, SignUpData } from '../../../core/auth/auth.service';
import { Banner } from '../../../shared/ui/banner/banner';
import { FormField } from '../../../shared/ui/form-field/form-field';

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
    email: '',
    password: '',
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
}

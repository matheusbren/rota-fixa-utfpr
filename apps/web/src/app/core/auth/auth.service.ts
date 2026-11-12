import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { UsersService } from '../data/users.service';

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
}

export type SignUpResult = 'created';

// Maiúsculas e espaços nas pontas não distinguem um e-mail de outro.
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Service()
export class AuthService {
  private readonly users = inject(UsersService);

  // Toda conta nasce passageiro (`member`) e pendente até o e-mail ser verificado.
  signUp({ fullName, email, password }: SignUpData): Observable<SignUpResult> {
    return this.users
      .create(
        { fullName, email: normalizeEmail(email), role: 'member', emailVerified: false },
        password,
      )
      .pipe(map((): SignUpResult => 'created'));
  }
}

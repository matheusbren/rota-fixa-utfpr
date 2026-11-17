import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { normalizeEmail } from '../../shared/validators/institutional-email';
import { UsersService } from '../data/users.service';

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
}

export type SignUpResult = 'created';

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

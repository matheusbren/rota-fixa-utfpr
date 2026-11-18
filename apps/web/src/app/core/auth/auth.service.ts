import { Service, inject } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { normalizeEmail } from '../../shared/validators/institutional-email';
import { UsersService } from '../data/users.service';

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
}

export type SignUpResult = 'created' | 'active';

@Service()
export class AuthService {
  private readonly users = inject(UsersService);

  // Antes de gravar, procura o e-mail: se ele já tem conta ativa, nenhuma outra é criada (CA6).
  // Toda conta nasce passageiro (`member`) e pendente até o e-mail ser verificado.
  signUp({ fullName, email, password }: SignUpData): Observable<SignUpResult> {
    const normalizedEmail = normalizeEmail(email);
    return this.users.findByEmail(normalizedEmail).pipe(
      switchMap((existing) =>
        // TODO #1: a conta pendente (`emailVerified: false`) ainda não é tratada e segue para
        // a gravação; o CA7 (Tarefa 7) a trata.
        existing?.emailVerified
          ? of<SignUpResult>('active')
          : this.users
              .create(
                { fullName, email: normalizedEmail, role: 'member', emailVerified: false },
                password,
              )
              .pipe(map((): SignUpResult => 'created')),
      ),
    );
  }
}

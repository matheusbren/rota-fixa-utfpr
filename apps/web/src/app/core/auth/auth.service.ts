import { Service, inject } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { normalizeEmail } from '../../shared/validators/institutional-email';
import { UsersService } from '../data/users.service';

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
}

export type SignUpResult = 'created' | 'active' | 'pending';

@Service()
export class AuthService {
  private readonly users = inject(UsersService);

  // Antes de gravar, procura o e-mail: se ele já tem conta, ativa (CA6) ou pendente de
  // verificação (CA7), nenhuma outra é criada.
  // Toda conta nasce passageiro (`member`) e pendente até o e-mail ser verificado.
  signUp({ fullName, email, password }: SignUpData): Observable<SignUpResult> {
    const normalizedEmail = normalizeEmail(email);
    return this.users.findByEmail(normalizedEmail).pipe(
      switchMap((existing) => {
        if (existing) {
          return of<SignUpResult>(existing.emailVerified ? 'active' : 'pending');
        }
        return this.users
          .create(
            { fullName, email: normalizedEmail, role: 'member', emailVerified: false },
            password,
          )
          .pipe(map((): SignUpResult => 'created'));
      }),
    );
  }

  // O tipo já recebe o e-mail da conta pendente, para a troca da E3 não mexer na tela
  // (architecture.md §2.1). A função da E2 não declara o parâmetro porque não o usa.
  // TODO #20: na E2 nenhum e-mail é enviado (spec, "Assume que"), então o reenvio só devolve
  // sucesso. Com o Supabase Auth, ele pede o reenvio de verdade para esse e-mail, normalizado
  // como no `signUp` (a tela entrega o que a pessoa digitou).
  readonly resendVerification: (email: string) => Observable<void> = () => of(undefined);
}

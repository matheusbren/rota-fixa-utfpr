import { Service, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { normalizeEmail } from '../../shared/validators/institutional-email';
import { UsersService } from '../data/users.service';

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
}

export type SignUpResult = 'created' | 'active' | 'pending' | 'failed';

@Service()
export class AuthService {
  private readonly users = inject(UsersService);

  // TODO #2: sem entrar e sair, a pessoa da sessão é sempre a pessoa de exemplo gravada em `users`
  // no db.json: é ela quem publica as rotas e de quem são as "Minhas rotas" (spec da US04, "Assume
  // que"). A sessão real nasce com a US02, que passa a trocar este id ao entrar e ao sair.
  private readonly userId = signal('sample-user');

  // Só o AuthService troca a pessoa da sessão; as telas apenas a leem (architecture.md §2.1).
  readonly currentUserId = this.userId.asReadonly();

  // Antes de gravar, procura o e-mail: se ele já tem conta, ativa (CA6) ou pendente de
  // verificação (CA7), nenhuma outra é criada.
  // Toda conta nasce passageiro (`member`) e pendente até o e-mail ser verificado.
  // Sem conexão ou com erro do servidor, na busca ou na gravação, o resultado é um só:
  // `failed` (CA9). A tela não recebe o erro técnico.
  // TODO #20: na E2 o cadastro é simulado na coleção `users` do db.json e nenhum e-mail é
  // enviado: a conta só deixa de ser pendente quando alguém edita o `emailVerified` no db.json
  // (spec, "Assume que"). Na E3 o cadastro vira Supabase Auth, com a verificação de e-mail de
  // verdade (architecture.md §2.1).
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
      catchError(() => of<SignUpResult>('failed')),
    );
  }

  // O tipo já recebe o e-mail da conta pendente, para a troca da E3 não mexer na tela
  // (architecture.md §2.1). A função da E2 não declara o parâmetro porque não o usa.
  // TODO #20: na E2 nenhum e-mail é enviado (spec, "Assume que"), então o reenvio só devolve
  // sucesso. Com o Supabase Auth, ele pede o reenvio de verdade para esse e-mail, normalizado
  // como no `signUp` (a tela entrega o que a pessoa digitou).
  readonly resendVerification: (email: string) => Observable<void> = () => of(undefined);
}

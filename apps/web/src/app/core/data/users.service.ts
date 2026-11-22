import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';

// O formato da coleção `users` no db.json (E2): o modelo mais a senha em texto.
// TODO #20: o campo `password` só existe na simulação da E2 (spec, "Assume que"). Na E3 a senha
// fica com o Supabase Auth, e a tabela `users` não tem essa coluna (architecture.md §5.2).
interface UserRecord extends User {
  password: string;
}

// Mapeador (architecture.md §2.1): a resposta do servidor vira o modelo, sem a senha.
function toUser({ id, email, fullName, role, emailVerified, createdAt }: UserRecord): User {
  return { id, email, fullName, role, emailVerified, createdAt };
}

@Service()
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/users`;

  // O json-server compara o e-mail com igualdade exata: quem chama já o manda normalizado.
  findByEmail(email: string): Observable<User | undefined> {
    return this.http
      .get<UserRecord[]>(this.url, { params: { email } })
      .pipe(map((records) => records.map(toUser).at(0)));
  }

  // TODO #20: a senha é gravada em texto no db.json, o que só vale para os dados fictícios de
  // desenvolvimento (architecture.md §2.1). Na E3 o cadastro é do Supabase Auth, e a senha deixa
  // de passar por este Service.
  create(user: Omit<User, 'id' | 'createdAt'>, password: string): Observable<User> {
    const record: Omit<UserRecord, 'id'> = {
      ...user,
      password,
      createdAt: new Date().toISOString(),
    };
    return this.http.post<UserRecord>(this.url, record).pipe(map(toUser));
  }
}

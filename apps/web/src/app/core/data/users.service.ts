import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';

// O formato da coleção `users` no db.json (E2): o modelo mais a senha em texto.
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

  create(user: Omit<User, 'id' | 'createdAt'>, password: string): Observable<User> {
    const record: Omit<UserRecord, 'id'> = {
      ...user,
      password,
      createdAt: new Date().toISOString(),
    };
    return this.http.post<UserRecord>(this.url, record).pipe(map(toUser));
  }
}

import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Campus } from '../models/campus';

// Mapeador (architecture.md §2.1): a resposta do servidor vira o modelo. Na E2 o db.json já usa
// os nomes do modelo; na E3 é aqui que o formato do Supabase é traduzido.
function toCampus({ id, name, city }: Campus): Campus {
  return { id, name, city };
}

@Service()
export class CampusesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/campuses`;

  list(): Observable<Campus[]> {
    return this.http.get<Campus[]>(this.url).pipe(map((records) => records.map(toCampus)));
  }
}

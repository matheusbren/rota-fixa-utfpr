import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

// A resposta do ViaCEP, só com o que a tela usa. O CEP que não existe volta como
// `{ "erro": "true" }`, sem os outros campos.
interface ViaCepResponse {
  bairro?: string;
  erro?: string;
}

// O que a busca do CEP devolve: o bairro achado, ou `not-found` (CA8).
export type PostalCodeLookup = { status: 'found'; neighborhood: string } | { status: 'not-found' };

// Mapeador (architecture.md §2.1): a resposta do ViaCEP vira o resultado da busca. CEP de cidade
// inteira volta com o bairro vazio: para a tela, é o mesmo que não achar.
function toPostalCodeLookup({ bairro, erro }: ViaCepResponse): PostalCodeLookup {
  return erro || !bairro ? { status: 'not-found' } : { status: 'found', neighborhood: bairro };
}

@Service()
export class PostalCodeService {
  private readonly http = inject(HttpClient);
  // API pública e fixa, igual em todo ambiente: por isso o endereço mora aqui, e não no
  // `environment` (architecture.md §5.3).
  private readonly url = 'https://viacep.com.br/ws';

  // O ViaCEP recebe só os 8 números, sem o traço. Sem conexão ou com o ViaCEP fora do ar, a falha
  // chega como erro do Observable, e quem chama a traduz (CA8).
  lookup(postalCode: string): Observable<PostalCodeLookup> {
    const digits = postalCode.replace('-', '');
    return this.http
      .get<ViaCepResponse>(`${this.url}/${digits}/json/`)
      .pipe(map(toPostalCodeLookup));
  }
}

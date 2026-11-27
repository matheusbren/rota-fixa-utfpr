import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let auth: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  // Nenhuma requisição pode sobrar sem ter sido conferida pelo teste.
  afterEach(() => httpTesting.verify());

  // Antes de gravar, o cadastro procura o e-mail (CA6). Aqui o servidor responde que não
  // achou conta nenhuma, para o cadastro seguir até a gravação.
  function answerEmailSearchWithNoAccount(): void {
    httpTesting
      .expectOne(
        (request) => request.method === 'GET' && request.url === `${environment.apiUrl}/users`,
      )
      .flush([]);
  }

  // US04, CA9: sem entrar e sair, quem publica é a pessoa de exemplo gravada em `users` no
  // db.json (spec, "Assume que"). A tela só lê o id: quem o troca, com a sessão da US02, é o
  // próprio AuthService (architecture.md §2.1, estado compartilhado).
  it('entrega, só para leitura, o id da pessoa de exemplo do db.json', () => {
    expect(auth.currentUserId()).toBe('sample-user');
    expect(auth.currentUserId).not.toHaveProperty('set');
  });

  // CA3: o e-mail é gravado normalizado. Chama o service direto porque o
  // <input type="email"> da tela já tira os espaços sozinho e esconderia a falta do trim().
  it('grava o e-mail sem os espaços das pontas e em minúsculas', () => {
    auth
      .signUp({
        fullName: 'Ana Souza',
        email: '  Ana.Souza@ALUNOS.UTFPR.edu.br ',
        password: 'carona2026',
      })
      .subscribe();
    answerEmailSearchWithNoAccount();

    const request = httpTesting.expectOne(`${environment.apiUrl}/users`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toMatchObject({ email: 'ana.souza@alunos.utfpr.edu.br' });
  });

  // CA6: a busca do e-mail repetido também sai normalizada. O json-server compara com
  // igualdade exata, e a conta foi gravada normalizada: sem isso, a busca não a acharia.
  it('procura a conta pelo e-mail sem os espaços das pontas e em minúsculas', () => {
    auth
      .signUp({
        fullName: 'Ana Souza',
        email: '  Ana.Souza@ALUNOS.UTFPR.edu.br ',
        password: 'carona2026',
      })
      .subscribe();

    const search = httpTesting.expectOne(
      `${environment.apiUrl}/users?email=ana.souza@alunos.utfpr.edu.br`,
    );
    expect(search.request.method).toBe('GET');
  });
});

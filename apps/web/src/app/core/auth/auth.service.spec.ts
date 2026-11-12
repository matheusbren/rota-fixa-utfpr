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

    const request = httpTesting.expectOne(`${environment.apiUrl}/users`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toMatchObject({ email: 'ana.souza@alunos.utfpr.edu.br' });
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PostalCodeLookup, PostalCodeService } from './postal-code.service';

// O endereço do ViaCEP para um CEP, só com os 8 números, como a API pede.
function viaCepUrl(digits: string): string {
  return `https://viacep.com.br/ws/${digits}/json/`;
}

describe('PostalCodeService', () => {
  let postalCodes: PostalCodeService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    postalCodes = TestBed.inject(PostalCodeService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  // Nenhuma requisição pode sobrar sem ter sido conferida pelo teste. Nenhum teste chama a
  // internet: o teste faz o papel do ViaCEP.
  afterEach(() => httpTesting.verify());

  // Busca o CEP e guarda o que a busca devolveu.
  function lookUp(value: string): { result?: PostalCodeLookup; failed: boolean } {
    const outcome: { result?: PostalCodeLookup; failed: boolean } = { failed: false };
    postalCodes.lookup(value).subscribe({
      next: (result) => (outcome.result = result),
      error: () => (outcome.failed = true),
    });
    return outcome;
  }

  // CA8: com ou sem o traço, o ViaCEP recebe só os números e devolve o bairro.
  it.each(['85010-000', '85010000'])('busca %j no ViaCEP e devolve o bairro', (value) => {
    const outcome = lookUp(value);

    httpTesting.expectOne({ method: 'GET', url: viaCepUrl('85010000') }).flush({
      cep: '85010-000',
      logradouro: 'Rua XV de Novembro',
      bairro: 'Centro',
      localidade: 'Guarapuava',
      uf: 'PR',
    });

    expect(outcome.result).toEqual({ status: 'found', neighborhood: 'Centro' });
  });

  // CA8: o CEP que não existe volta do ViaCEP como `{ "erro": "true" }`.
  it('devolve not-found quando o ViaCEP não conhece o CEP', () => {
    const outcome = lookUp('99999-999');

    httpTesting.expectOne(viaCepUrl('99999999')).flush({ erro: 'true' });

    expect(outcome.result).toEqual({ status: 'not-found' });
  });

  // CEP de cidade inteira não tem bairro: para a tela, é o mesmo que não achar.
  it('devolve not-found quando o CEP não tem bairro', () => {
    const outcome = lookUp('85010-000');

    httpTesting.expectOne(viaCepUrl('85010000')).flush({
      cep: '85010-000',
      logradouro: '',
      bairro: '',
      localidade: 'Guarapuava',
      uf: 'PR',
    });

    expect(outcome.result).toEqual({ status: 'not-found' });
  });

  // CA8: sem conexão ou com o ViaCEP fora do ar, a falha chega como erro, e a tela a traduz.
  it.each([
    ['sem conexão', { status: 0, statusText: '' }],
    ['com o ViaCEP fora do ar', { status: 503, statusText: 'Service Unavailable' }],
  ])('repassa a falha da busca %s como erro', (_, failure) => {
    const outcome = lookUp('85010-000');

    const request = httpTesting.expectOne(viaCepUrl('85010000'));
    if (failure.status === 0) {
      request.error(new ProgressEvent('error'));
    } else {
      request.flush('', failure);
    }

    expect(outcome).toEqual({ failed: true });
  });
});

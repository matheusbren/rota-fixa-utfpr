import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../../../../environments/environment';
import { routes } from '../../../app.routes';

// Os 13 câmpus da UTFPR, como o servidor os devolve.
const CAMPUS_NAMES = [
  'Apucarana',
  'Campo Mourão',
  'Cornélio Procópio',
  'Curitiba',
  'Dois Vizinhos',
  'Francisco Beltrão',
  'Guarapuava',
  'Londrina',
  'Medianeira',
  'Pato Branco',
  'Ponta Grossa',
  'Santa Helena',
  'Toledo',
];
const CAMPUSES = CAMPUS_NAMES.map((name, index) => ({ id: `${index + 1}`, name, city: name }));

// O que a tela mostra nos oito campos; nos grupos (Sentido e Dias da semana), as opções marcadas.
interface FormState {
  campus: string;
  direction: string[];
  postalCode: string;
  neighborhood: string;
  meetingPoint: string;
  weekdays: string[];
  departureTime: string;
  seats: string;
}

// O formulário como ele abre: nada escolhido, a não ser o sentido "Vou para o campus" (CA1).
const BLANK_FORM: FormState = {
  campus: '',
  direction: ['Vou para o campus'],
  postalCode: '',
  neighborhood: '',
  meetingPoint: '',
  weekdays: [],
  departureTime: '',
  seats: '',
};

// Gravar é qualquer requisição que não seja leitura.
function isWrite(request: HttpRequest<unknown>): boolean {
  return request.method !== 'GET';
}

describe('RouteForm', () => {
  let harness: RouterTestingHarness;
  let httpTesting: HttpTestingController;
  let page: HTMLElement;

  // O app inteiro, com a casca e o menu: a tela é aberta pelo menu, como a pessoa faz (CA1).
  async function openApp(): Promise<void> {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create('/criar-conta');
    page = harness.fixture.nativeElement as HTMLElement;
  }

  beforeEach(openApp);

  // Nenhuma requisição pode sobrar sem ter sido conferida pelo teste.
  afterEach(() => httpTesting.verify());

  async function tap(element: HTMLElement | null | undefined): Promise<void> {
    expect(element).toBeTruthy();
    element?.click();
    await harness.fixture.whenStable();
  }

  function menuLink(label: string): HTMLAnchorElement | undefined {
    return Array.from(page.querySelectorAll<HTMLAnchorElement>('app-side-nav a')).find(
      (link) => link.textContent?.trim() === label,
    );
  }

  // Abre "Publicar uma rota fixa" pelo menu. A tela pede os câmpus ao abrir, e o teste faz o
  // papel do servidor.
  async function openFromMenu(): Promise<void> {
    await tap(menuLink('Publicar uma rota fixa'));
    httpTesting.expectOne({ method: 'GET', url: `${environment.apiUrl}/campuses` }).flush(CAMPUSES);
    await harness.fixture.whenStable();
  }

  // O campo é achado pelo rótulo, como a pessoa o enxerga na tela.
  function field<T extends HTMLElement>(label: string, type: new () => T): T {
    const control = Array.from(page.querySelectorAll<HTMLLabelElement>('main label')).find(
      (element) => element.textContent?.trim() === label,
    )?.control;
    expect(control, `campo "${label}"`).toBeInstanceOf(type);
    return control as T;
  }

  // Sentido e Dias da semana são grupos de opções: o grupo é achado pela legenda, e cada opção
  // pelo próprio rótulo.
  function choices(legend: string): HTMLLabelElement[] {
    const group = Array.from(page.querySelectorAll('main fieldset')).find(
      (element) => element.querySelector('legend')?.textContent?.trim() === legend,
    );
    expect(group, `grupo "${legend}"`).toBeDefined();
    return Array.from(group?.querySelectorAll('label') ?? []);
  }

  function choiceLabels(legend: string): string[] {
    return choices(legend).map((label) => label.textContent?.trim() ?? '');
  }

  function checkedChoices(legend: string): string[] {
    return choices(legend)
      .filter((label) => (label.control as HTMLInputElement | null)?.checked)
      .map((label) => label.textContent?.trim() ?? '');
  }

  function choice(legend: string, label: string): HTMLInputElement | null | undefined {
    return choices(legend).find((element) => element.textContent?.trim() === label)?.control as
      HTMLInputElement | null | undefined;
  }

  function formState(): FormState {
    return {
      campus: field('Campus', HTMLSelectElement).value,
      direction: checkedChoices('Sentido'),
      postalCode: field('CEP do bairro (opcional)', HTMLInputElement).value,
      neighborhood: field('Bairro', HTMLInputElement).value,
      meetingPoint: field('Ponto de encontro', HTMLInputElement).value,
      weekdays: checkedChoices('Dias da semana'),
      departureTime: field('Horário de saída', HTMLInputElement).value,
      seats: field('Vagas', HTMLInputElement).value,
    };
  }

  // As opções de câmpus, sem a que só pede para escolher.
  function campusOptions(): string[] {
    return Array.from(field('Campus', HTMLSelectElement).options)
      .filter((option) => option.value !== '')
      .map((option) => option.text.trim());
  }

  function submitButton(): HTMLButtonElement | undefined {
    return Array.from(page.querySelectorAll<HTMLButtonElement>('main button')).find(
      (element) => element.textContent?.trim() === 'Publicar rota',
    );
  }

  // Nenhum campo marcado como inválido e nenhum aviso do formulário.
  function expectNoMessages(): void {
    expect(page.querySelectorAll('main [aria-invalid="true"]')).toHaveLength(0);
    expect(page.querySelector('main [role="alert"]')).toBeNull();
  }

  async function chooseCampus(name: string): Promise<void> {
    const select = field('Campus', HTMLSelectElement);
    const option = Array.from(select.options).find((element) => element.text.trim() === name);
    expect(option, `câmpus "${name}"`).toBeDefined();
    select.value = option?.value ?? '';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
  }

  async function fillIn(label: string, value: string): Promise<void> {
    const input = field(label, HTMLInputElement);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();
  }

  async function leave(label: string): Promise<void> {
    field(label, HTMLInputElement).dispatchEvent(new Event('blur'));
    await harness.fixture.whenStable();
  }

  // Fechar a aba apaga o app da memória; só o que estivesse guardado no navegador
  // (localStorage, sessionStorage) passaria para a próxima vez. Por isso a aba fechada é o
  // TestBed desmontado, e a aba nova, outro TestBed, no mesmo navegador de teste.
  async function closeTabAndReopen(): Promise<void> {
    harness.fixture.destroy();
    httpTesting.verify();
    TestBed.resetTestingModule();
    await openApp();
  }

  // CA1
  it('abre pelo menu com os oito campos, os 13 câmpus, nenhuma mensagem e o botão desligado', async () => {
    await openFromMenu();

    expect(TestBed.inject(Router).url).toBe('/minhas-rotas/nova');
    expect(page.querySelector('main h1')?.textContent?.trim()).toBe('Publicar uma rota fixa');
    expect(formState()).toEqual(BLANK_FORM);
    expect(campusOptions()).toEqual(CAMPUS_NAMES);
    expect(choiceLabels('Sentido')).toEqual(['Vou para o campus', 'Volto do campus']);
    expect(choiceLabels('Dias da semana')).toEqual([
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ]);
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" desligado').toBe(true);
  });

  // CA17
  it.each([
    ['pelo menu', () => tap(menuLink('Criar conta'))],
    ['fechando a aba', closeTabAndReopen],
  ])(
    'volta em branco, sem mensagens e sem gravar nada, depois de sair %s no meio do preenchimento',
    async (_, leaveScreen) => {
      await openFromMenu();
      await chooseCampus('Guarapuava');
      await tap(choice('Sentido', 'Volto do campus'));
      await fillIn('Bairro', 'Centro');
      await tap(choice('Dias da semana', 'Quarta'));
      await leave('Ponto de encontro');
      expect(formState()).not.toEqual(BLANK_FORM);

      await leaveScreen();
      expect(page.querySelector('main h1')?.textContent?.trim()).not.toBe('Publicar uma rota fixa');
      await openFromMenu();

      expect(formState()).toEqual(BLANK_FORM);
      expectNoMessages();
      httpTesting.expectNone(isWrite);
    },
  );
});

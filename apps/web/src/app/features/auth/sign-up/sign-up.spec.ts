import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { SignUp } from './sign-up';

describe('SignUp', () => {
  let fixture: ComponentFixture<SignUp>;
  let httpTesting: HttpTestingController;
  let page: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SignUp);
    page = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  // Nenhuma requisição pode sobrar sem ter sido conferida pelo teste.
  afterEach(() => httpTesting.verify());

  // O campo é achado pelo rótulo, como a pessoa o enxerga na tela.
  function field(label: string): HTMLInputElement {
    const control = Array.from(page.querySelectorAll('label')).find(
      (element) => element.textContent?.trim() === label,
    )?.control;
    expect(control, `campo "${label}"`).toBeInstanceOf(HTMLInputElement);
    return control as HTMLInputElement;
  }

  function button(label: string): HTMLButtonElement | undefined {
    return Array.from(page.querySelectorAll('button')).find(
      (element) => element.textContent?.trim() === label,
    );
  }

  async function fillIn(label: string, value: string): Promise<void> {
    const input = field(label);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function tap(element: HTMLElement | undefined): Promise<void> {
    expect(element).toBeDefined();
    element?.click();
    await fixture.whenStable();
  }

  async function leave(label: string): Promise<void> {
    field(label).dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  // O texto que o campo anuncia como descrição (aria-describedby): é o aviso ligado a ele.
  function description(label: string): string {
    const ids = field(label).getAttribute('aria-describedby')?.split(' ') ?? [];
    return ids.map((id) => page.querySelector(`[id="${id}"]`)?.textContent?.trim() ?? '').join(' ');
  }

  // CA3
  it('grava a conta como pendente e avisa que falta verificar o e-mail', async () => {
    await fillIn('Nome completo', 'Ana Souza');
    await fillIn('E-mail institucional', '  Ana.Souza@ALUNOS.UTFPR.edu.br ');
    await fillIn('Senha', 'carona2026');
    await tap(button('Criar conta'));

    const request = httpTesting.expectOne(`${environment.apiUrl}/users`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      fullName: 'Ana Souza',
      email: 'ana.souza@alunos.utfpr.edu.br',
      password: 'carona2026',
      role: 'member',
      emailVerified: false,
      createdAt: expect.any(String),
    });

    request.flush({ id: 'a1b2', ...request.request.body });
    await fixture.whenStable();

    expect(page.querySelector('[role="status"]')?.textContent).toContain(
      'falta verificar o e-mail',
    );
  });

  // CA4
  it.each(['ana@gmail.com', 'ana@utfpr.edu.br.exemplo.com'])(
    'recusa %s ao sair do campo, desabilita o botão e não grava nada',
    async (email) => {
      await fillIn('Nome completo', 'Ana Souza');
      await fillIn('E-mail institucional', email);
      await fillIn('Senha', 'carona2026');
      expect(page.textContent).not.toContain('Use o seu e-mail da UTFPR');

      await leave('E-mail institucional');

      expect(description('E-mail institucional')).toBe('Use o seu e-mail da UTFPR');
      expect(button('Criar conta')?.disabled).toBe(true);

      await tap(button('Criar conta'));
      httpTesting.expectNone(`${environment.apiUrl}/users`);
    },
  );

  // CA4: maiúsculas não contam. O espaço do fim o próprio <input type="email"> já tira;
  // quem prova que o validador o ignora é o institutional-email.spec.ts.
  it('aceita Ana@UTFPR.edu.br com espaço no fim', async () => {
    await fillIn('Nome completo', 'Ana Souza');
    await fillIn('E-mail institucional', 'Ana@UTFPR.edu.br ');
    await fillIn('Senha', 'carona2026');
    await leave('E-mail institucional');

    expect(page.textContent).not.toContain('Use o seu e-mail da UTFPR');
    expect(button('Criar conta')?.disabled).toBe(false);

    await tap(button('Criar conta'));
    const request = httpTesting.expectOne(`${environment.apiUrl}/users`);
    expect(request.request.body).toMatchObject({ email: 'ana@utfpr.edu.br' });
  });
});

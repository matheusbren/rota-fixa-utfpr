import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AppShell } from './app-shell';

// O core não importa de features/: as telas do palco são de mentira, só para o teste.
@Component({ selector: 'app-fake-sign-up', template: '<h1>Tela de cadastro</h1>' })
class FakeSignUp {}

@Component({ selector: 'app-fake-other-page', template: '<h1>Outra tela</h1>' })
class FakeOtherPage {}

const routes: Routes = [
  {
    path: '',
    component: AppShell,
    children: [
      { path: 'criar-conta', component: FakeSignUp },
      { path: 'outra-tela', component: FakeOtherPage },
    ],
  },
];

describe('AppShell', () => {
  let harness: RouterTestingHarness;
  let router: Router;
  let page: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    // Começa fora do cadastro, para que ir até ele (ou não ir) apareça no palco.
    harness = await RouterTestingHarness.create('/outra-tela');
    router = TestBed.inject(Router);
    page = harness.fixture.nativeElement as HTMLElement;
  });

  // O jsdom não aplica CSS. No drawer do DaisyUI, quem mostra a gaveta é o checkbox
  // `.drawer-toggle` marcado, então é ele que diz se a gaveta está aberta.
  function drawerIsOpen(): boolean {
    return page.querySelector<HTMLInputElement>('.drawer-toggle')?.checked ?? false;
  }

  function menuButton(): HTMLElement | null {
    return page.querySelector<HTMLElement>('app-top-bar button[aria-label="Abrir menu"]');
  }

  function drawerLink(label: string): HTMLAnchorElement | undefined {
    return Array.from(page.querySelectorAll<HTMLAnchorElement>('.drawer-side app-side-nav a')).find(
      (link) => link.textContent?.trim() === label,
    );
  }

  function overlay(): HTMLElement | null {
    return page.querySelector<HTMLElement>('.drawer-side .drawer-overlay');
  }

  function stageTitle(): string | undefined {
    return page.querySelector('main h1')?.textContent?.trim();
  }

  // O jsdom não anda pelo Tab: a primeira parada é o primeiro elemento focável
  // (tabIndex 0 ou mais) na ordem do documento.
  function firstTabStop(): HTMLElement | undefined {
    return Array.from(
      page.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]'),
    ).find((element) => element.tabIndex >= 0 && !element.hasAttribute('disabled'));
  }

  async function tap(element: HTMLElement | null | undefined): Promise<void> {
    expect(element).toBeTruthy();
    element?.click();
    await harness.fixture.whenStable();
  }

  // CA2, primeira parte
  it('abre a gaveta com o link "Criar conta" ao tocar no ☰ do cabeçalho', async () => {
    expect(drawerIsOpen()).toBe(false);

    await tap(menuButton());

    expect(drawerIsOpen()).toBe(true);
    expect(drawerLink('Criar conta')).toBeDefined();
  });

  // CA2, segunda parte
  it('fecha a gaveta e mostra a tela de cadastro ao tocar no link "Criar conta"', async () => {
    await tap(menuButton());
    await tap(drawerLink('Criar conta'));

    expect(drawerIsOpen()).toBe(false);
    expect(router.url).toBe('/criar-conta');
    expect(stageTitle()).toBe('Tela de cadastro');
  });

  // CA2, terceira parte
  it('fecha a gaveta sem mudar de tela ao tocar fora dela', async () => {
    await tap(menuButton());
    await tap(overlay());

    expect(drawerIsOpen()).toBe(false);
    expect(router.url).toBe('/outra-tela');
    expect(stageTitle()).toBe('Outra tela');

    // O overlay desmarca o checkbox por conta própria; o ☰ precisa continuar abrindo depois.
    await tap(menuButton());
    expect(drawerIsOpen()).toBe(true);
  });

  // Decisão do plan.md ("Estado da gaveta"): a tecla Esc também fecha a gaveta.
  it('fecha a gaveta sem mudar de tela ao apertar Esc', async () => {
    await tap(menuButton());

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await harness.fixture.whenStable();

    expect(drawerIsOpen()).toBe(false);
    expect(router.url).toBe('/outra-tela');
    expect(stageTitle()).toBe('Outra tela');
  });

  // PRD §7 (navegação por teclado): o ☰ é o controle da gaveta. O checkbox do DaisyUI
  // fica invisível, então não pode receber o Tab nem ser lido como "Fechar menu".
  it('leva o primeiro Tab ao ☰, sem parar no checkbox escondido da gaveta', () => {
    const drawerToggle = page.querySelector<HTMLInputElement>('.drawer-toggle');

    expect(firstTabStop()).toBe(menuButton());
    expect(drawerToggle?.getAttribute('aria-hidden')).toBe('true');
  });
});

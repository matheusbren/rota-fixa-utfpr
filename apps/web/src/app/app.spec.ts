import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

// `b` vem depois de `a` no documento, e nenhum dos dois está dentro do outro.
function comesAfter(a: Element, b: Element): boolean {
  return a.compareDocumentPosition(b) === Node.DOCUMENT_POSITION_FOLLOWING;
}

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  // CA1
  it.each(['/', '/criar-conta', '/endereco-que-nao-existe'])(
    'mostra a tela de cadastro no palco central, entre o cabeçalho e o rodapé, ao abrir %s',
    async (url) => {
      const fixture = TestBed.createComponent(App);
      const router = TestBed.inject(Router);

      await router.navigateByUrl(url);
      await fixture.whenStable();

      const page = fixture.nativeElement as HTMLElement;
      const topBar = page.querySelector('app-top-bar');
      const main = page.querySelector('main');
      const footer = page.querySelector('app-footer');

      expect(router.url).toBe('/criar-conta');
      expect(topBar).not.toBeNull();
      expect(main).not.toBeNull();
      expect(footer).not.toBeNull();
      expect(main?.querySelector('app-sign-up h1')?.textContent).toContain('Criar conta');
      expect(comesAfter(topBar as Element, main as Element)).toBe(true);
      expect(comesAfter(main as Element, footer as Element)).toBe(true);
    },
  );
});

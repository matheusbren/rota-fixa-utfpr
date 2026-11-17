import { FormControl, ValidationErrors } from '@angular/forms';
import { institutionalEmail } from './institutional-email';

// O validador é chamado direto, num FormControl do teste: na tela, o <input type="email">
// tira os espaços das pontas sozinho e esconderia um validador que não os ignora.
describe('institutionalEmail', () => {
  function errorsFor(email: string): ValidationErrors | null {
    return new FormControl(email, { nonNullable: true, validators: institutionalEmail }).errors;
  }

  // CA4: maiúsculas e espaços nas pontas não contam.
  it.each([
    'ana@alunos.utfpr.edu.br',
    'ana@utfpr.edu.br',
    'Ana@UTFPR.edu.br ',
    '  ANA@ALUNOS.UTFPR.EDU.BR',
  ])('aceita %j', (email) => {
    expect(errorsFor(email)).toBeNull();
  });

  // CA4: só os dois domínios, nada parecido.
  it.each([
    'ana@gmail.com',
    'ana@utfpr.edu.br.exemplo.com',
    'ana@exemplo.utfpr.edu.br',
    'ana.utfpr.edu.br',
    '',
  ])('recusa %j', (email) => {
    expect(errorsFor(email)).toEqual({ institutionalEmail: true });
  });
});

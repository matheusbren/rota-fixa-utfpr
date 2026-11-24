import { FormControl, ValidationErrors } from '@angular/forms';
import { password } from './password';

describe('password', () => {
  function errorsFor(value: string): ValidationErrors | null {
    return new FormControl(value, { nonNullable: true, validators: password }).errors;
  }

  // CA5: 8 caracteres ou mais, com letra e número. Letra acentuada também é letra.
  it.each(['carona26', 'carona2026', 'Carona 2026!', 'ãé-2026!'])('aceita %j', (value) => {
    expect(errorsFor(value)).toBeNull();
  });

  // CA5: "A senha precisa ter 8 caracteres ou mais".
  it.each(['car2026', 'a1'])('recusa %j por ter menos de 8 caracteres', (value) => {
    expect(errorsFor(value)).toEqual({ passwordLength: true });
  });

  // CA5: "A senha precisa ter letra e número".
  it.each(['caronautfpr', '20262026', '!@#$%&*()'])(
    'recusa %j por não ter letra e número',
    (value) => {
      expect(errorsFor(value)).toEqual({ passwordLetterAndNumber: true });
    },
  );

  // Curta e sem letra ou sem número ao mesmo tempo: aponta só o tamanho, um requisito por vez.
  it.each(['abc', '123', ''])(
    'recusa %j só pelo tamanho quando falta também letra ou número',
    (value) => {
      expect(errorsFor(value)).toEqual({ passwordLength: true });
    },
  );
});

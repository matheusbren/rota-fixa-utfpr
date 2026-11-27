import { FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { trimmedMinLength, trimmedRequired } from './trimmed';

// Os validadores são chamados direto, num FormControl do teste, como os outros desta pasta.
function errorsFor(value: string, validator: ValidatorFn): ValidationErrors | null {
  return new FormControl(value, { nonNullable: true, validators: validator }).errors;
}

describe('trimmedRequired', () => {
  // CA3 e CA4: sobra texto depois de tirar os espaços das pontas.
  it.each(['a', 'Centro', '  Centro  '])('aceita %j', (value) => {
    expect(errorsFor(value, trimmedRequired)).toBeNull();
  });

  // CA3 e CA4: vazio ou só com espaços.
  it.each(['', ' ', '   '])('recusa %j', (value) => {
    expect(errorsFor(value, trimmedRequired)).toEqual({ trimmedRequired: true });
  });
});

describe('trimmedMinLength', () => {
  // CA3: 3 caracteres ou mais, sem contar os espaços das pontas.
  it.each(['Cen', '  Cen  ', 'Centro'])('com 3, aceita %j', (value) => {
    expect(errorsFor(value, trimmedMinLength(3))).toBeNull();
  });

  // CA3: os espaços das pontas não contam, então "  Ce  " tem 2.
  it.each(['C', 'Ce', '  Ce  '])('com 3, recusa %j', (value) => {
    expect(errorsFor(value, trimmedMinLength(3))).toEqual({ trimmedMinLength: true });
  });

  // CA4: o tamanho mínimo é o que a tela pede.
  it('com 5, recusa 4 caracteres e aceita 5', () => {
    expect(errorsFor('Praç', trimmedMinLength(5))).toEqual({ trimmedMinLength: true });
    expect(errorsFor('Praça', trimmedMinLength(5))).toBeNull();
  });

  // Vazio ou só com espaços fica com o `trimmedRequired`: um erro por vez.
  it.each(['', '   '])('não aponta nada em %j', (value) => {
    expect(errorsFor(value, trimmedMinLength(3))).toBeNull();
  });
});

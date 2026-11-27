import { FormControl, ValidationErrors } from '@angular/forms';
import { isPostalCode, postalCode } from './postal-code';

// O validador é chamado direto, num FormControl do teste, como os outros desta pasta.
function errorsFor(value: string): ValidationErrors | null {
  return new FormControl(value, { nonNullable: true, validators: postalCode }).errors;
}

describe('postalCode', () => {
  // CA8: os 8 números, com ou sem o traço. O CEP é opcional, então vazio também passa.
  it.each(['', '85010-000', '85010000'])('aceita %j', (value) => {
    expect(errorsFor(value)).toBeNull();
  });

  // CA8: números de menos ou de mais, letra, espaço e traço fora do lugar não são CEP.
  it.each(['8501', '8501000', '850100001', '85010-0a0', '85010 000', '8501-0000'])(
    'recusa %j',
    (value) => {
      expect(errorsFor(value)).toEqual({ postalCode: true });
    },
  );
});

describe('isPostalCode', () => {
  // CA8: é o que dispara a busca, então o CEP vazio não é CEP.
  it.each([
    ['85010-000', true],
    ['85010000', true],
    ['', false],
    ['8501000', false],
  ])('com %j, responde %s', (value, expected) => {
    expect(isPostalCode(value)).toBe(expected);
  });
});

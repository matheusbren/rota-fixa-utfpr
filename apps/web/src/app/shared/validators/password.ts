import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const MIN_LENGTH = 8;

// `\p{L}` é qualquer letra, inclusive acentuada (`ç`, `ã`); `\d` é um algarismo de 0 a 9.
const LETTER = /\p{L}/u;
const DIGIT = /\d/;

// CA5: 8 caracteres ou mais, com pelo menos uma letra e um número. Aponta um requisito por vez,
// e o tamanho vem primeiro: uma senha curta e sem número (ou vazia) recebe só `passwordLength`.
export const password: ValidatorFn = (
  control: AbstractControl<string>,
): ValidationErrors | null => {
  const value = control.value;
  if (value.length < MIN_LENGTH) {
    return { passwordLength: true };
  }
  return LETTER.test(value) && DIGIT.test(value) ? null : { passwordLetterAndNumber: true };
};

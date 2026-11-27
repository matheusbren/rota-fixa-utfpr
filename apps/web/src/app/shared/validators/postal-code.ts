import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// O formato do CEP: os 8 números, com ou sem o traço depois do quinto (CA8).
const POSTAL_CODE_FORMAT = /^\d{5}-?\d{3}$/;

// CA8: o CEP completo, que já pode ser buscado. O vazio não é CEP.
export function isPostalCode(value: string): boolean {
  return POSTAL_CODE_FORMAT.test(value);
}

// CA8: o CEP é opcional, então o campo vazio passa; preenchido, precisa ter o formato de CEP.
export const postalCode: ValidatorFn = (
  control: AbstractControl<string>,
): ValidationErrors | null =>
  control.value === '' || isPostalCode(control.value) ? null : { postalCode: true };

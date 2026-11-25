import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Os espaços das pontas não contam: um campo só com espaços está vazio.

// CA3 e CA4: o campo precisa ter texto além dos espaços das pontas.
export const trimmedRequired: ValidatorFn = (
  control: AbstractControl<string>,
): ValidationErrors | null => (control.value.trim() === '' ? { trimmedRequired: true } : null);

// CA3 e CA4: pelo menos `minLength` caracteres, sem contar os espaços das pontas. O campo vazio
// (ou só com espaços) não é apontado aqui, e sim pelo `trimmedRequired`: um erro por vez.
export function trimmedMinLength(minLength: number): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const length = control.value.trim().length;
    return length > 0 && length < minLength ? { trimmedMinLength: true } : null;
  };
}

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// CA5: de `min` a `max` dias marcados. O valor é a lista de dias pelo número ISO (1 = segunda),
// como o `weekdays` da rota (architecture.md §5.1). Poucos dias e dias demais são erros diferentes,
// porque a tela tem uma frase para cada um.
export function weekdaysCount(min: number, max: number): ValidatorFn {
  return (control: AbstractControl<readonly number[]>): ValidationErrors | null => {
    const count = control.value.length;
    if (count < min) {
      return { tooFewWeekdays: true };
    }
    return count > max ? { tooManyWeekdays: true } : null;
  };
}

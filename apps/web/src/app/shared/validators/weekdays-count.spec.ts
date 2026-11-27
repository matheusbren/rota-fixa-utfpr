import { FormControl, ValidationErrors } from '@angular/forms';
import { weekdaysCount } from './weekdays-count';

// O validador é chamado direto, num FormControl do teste, como os outros desta pasta. O valor é a
// lista de dias marcados, pelo número ISO (1 = segunda).
describe('weekdaysCount', () => {
  function errorsFor(weekdays: number[]): ValidationErrors | null {
    return new FormControl(weekdays, { nonNullable: true, validators: weekdaysCount(1, 5) }).errors;
  }

  // CA5: de 1 a 5 dias.
  it.each([[[1]], [[1, 3, 5]], [[1, 2, 3, 4, 5]]])('com 1 a 5, aceita %j', (weekdays) => {
    expect(errorsFor(weekdays)).toBeNull();
  });

  // CA5: nenhum dia.
  it('com 1 a 5, recusa nenhum dia', () => {
    expect(errorsFor([])).toEqual({ tooFewWeekdays: true });
  });

  // CA5: o sexto dia.
  it('com 1 a 5, recusa seis dias', () => {
    expect(errorsFor([1, 2, 3, 4, 5, 6])).toEqual({ tooManyWeekdays: true });
  });
});

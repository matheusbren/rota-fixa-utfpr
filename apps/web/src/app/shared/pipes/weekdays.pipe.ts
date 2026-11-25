import { Pipe, PipeTransform } from '@angular/core';

// O nome curto de cada dia, pelo número ISO (1 = segunda … 7 = domingo), como o `weekdays` da
// rota (architecture.md §5.1).
const SHORT_NAMES: Record<number, string> = {
  1: 'seg',
  2: 'ter',
  3: 'qua',
  4: 'qui',
  5: 'sex',
  6: 'sáb',
  7: 'dom',
};

// A lista em português: vírgula entre os dias e "e" antes do último ("seg, qua e sex").
const LIST_FORMAT = new Intl.ListFormat('pt-BR', { type: 'conjunction' });

// `[1, 3, 5]` → "seg, qua e sex": os dias por extenso curto e em ordem, seja qual for a ordem da
// lista (CA13).
@Pipe({ name: 'weekdays' })
export class WeekdaysPipe implements PipeTransform {
  transform(weekdays: readonly number[]): string {
    const ordered = [...weekdays].sort((a, b) => a - b);
    return LIST_FORMAT.format(ordered.map((day) => SHORT_NAMES[day]));
  }
}

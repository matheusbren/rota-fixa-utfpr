import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// Segunda a sábado, pelo número do dia no padrão ISO (1 = segunda), como o `weekdays` da rota
// (architecture.md §5.1).
const WEEKDAYS = [
  { isoDay: 1, label: 'Segunda' },
  { isoDay: 2, label: 'Terça' },
  { isoDay: 3, label: 'Quarta' },
  { isoDay: 4, label: 'Quinta' },
  { isoDay: 5, label: 'Sexta' },
  { isoDay: 6, label: 'Sábado' },
];

// Uma caixa de marcar por dia. É um campo do formulário reativo (`formControlName`), e o valor é a
// lista dos dias marcados, em ordem: `[1, 3, 5]` é segunda, quarta e sexta.
@Component({
  selector: 'app-weekday-picker',
  templateUrl: './weekday-picker.html',
  host: { class: 'flex flex-col gap-1' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => WeekdayPicker), multi: true },
  ],
})
export class WeekdayPicker implements ControlValueAccessor {
  protected readonly weekdays = WEEKDAYS;

  protected readonly selected = signal<readonly number[]>([]);

  private onChange: (weekdays: number[]) => void = () => undefined;

  private onTouched: () => void = () => undefined;

  writeValue(weekdays: readonly number[] | null): void {
    this.selected.set(weekdays ?? []);
  }

  registerOnChange(onChange: (weekdays: number[]) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  // Cada toque numa caixa já conta como campo tocado: o aviso dos dias não espera a pessoa sair do
  // grupo (CA5).
  protected toggle(isoDay: number): void {
    const selected = this.selected();
    const weekdays = selected.includes(isoDay)
      ? selected.filter((day) => day !== isoDay)
      : [...selected, isoDay].sort((a, b) => a - b);
    this.selected.set(weekdays);
    this.onChange(weekdays);
    this.onTouched();
  }
}

import { Component, input, model } from '@angular/core';

// Uma opção do seletor: o valor que o pai recebe e o texto que a pessoa lê.
export interface SegmentedOption<T> {
  value: T;
  label: string;
}

// Uma fileira de botões em que só um fica escolhido, como "Esta semana" | "4 semanas". O pai liga
// o valor escolhido com `[(value)]` (ID12); quem dá nome ao grupo é o `aria-label` que o pai põe
// no elemento.
@Component({
  selector: 'app-segmented-control',
  templateUrl: './segmented-control.html',
  host: { role: 'group', class: 'join w-full' },
})
export class SegmentedControl<T> {
  readonly options = input.required<readonly SegmentedOption<T>[]>();

  readonly value = model.required<T>();
}

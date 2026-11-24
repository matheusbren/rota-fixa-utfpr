import { Component, input } from '@angular/core';

// Rótulo de um campo de formulário. O controle entra por projeção, para continuar
// ligado ao formulário reativo da página.
@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.html',
  host: { class: 'flex flex-col gap-1' },
})
export class FormField {
  readonly label = input.required<string>();
  // O `id` do controle projetado: liga o rótulo a ele.
  readonly controlId = input.required<string>();
}

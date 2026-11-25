import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CampusesService } from '../../../core/data/campuses.service';
import { FormField } from '../../../shared/ui/form-field/form-field';

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

@Component({
  selector: 'app-route-form',
  imports: [ReactiveFormsModule, FormField],
  templateUrl: './route-form.html',
  host: { class: 'mx-auto flex w-full max-w-md flex-col gap-6' },
})
export class RouteForm {
  protected readonly campuses = toSignal(inject(CampusesService).list(), { initialValue: [] });

  protected readonly weekdays = WEEKDAYS;

  private readonly formBuilder = inject(FormBuilder).nonNullable;

  // O formulário nasce a cada vez que a tela abre e some quando ela fecha: o que foi digitado não
  // é guardado em lugar nenhum (CA17, spec "Abandono no meio").
  // Os campos obrigatórios começam vazios, então o botão nasce desligado (CA1).
  protected readonly form = this.formBuilder.group({
    campusId: ['', Validators.required],
    direction: 'to_campus',
    postalCode: '',
    neighborhood: ['', Validators.required],
    meetingPoint: ['', Validators.required],
    // Uma caixa por dia, pelo número ISO, todas desmarcadas.
    weekdays: this.formBuilder.group({
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
    }),
    departureTime: ['', Validators.required],
    seats: [null as number | null, Validators.required],
  });
}

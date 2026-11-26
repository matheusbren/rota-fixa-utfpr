import { I18nPluralPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Campus } from '../../../../core/models/campus';
import { FixedRoute } from '../../../../core/models/fixed-route';
import { WeekdaysPipe } from '../../../../shared/pipes/weekdays.pipe';

// O cartão de uma rota ativa em "Minhas rotas": o sentido, os dias, o horário e as vagas (CA16).
// Não injeta nada: recebe a rota e o campus dela, e avisa o toque, para a página abrir a tela da
// rota (ID14).
@Component({
  selector: 'app-route-card',
  imports: [I18nPluralPipe, WeekdaysPipe],
  templateUrl: './route-card.html',
  host: { class: 'block' },
})
export class RouteCard {
  readonly route = input.required<FixedRoute>();

  // A rota só guarda o id do campus, e o sentido mostra o nome dele.
  readonly campus = input.required<Campus>();

  // O toque no cartão, com o id da rota. O nome não é o de um evento nativo (`select`), que o
  // elemento também dispara (lint `no-output-native`).
  readonly routeSelect = output<string>();

  // "1 vaga" no singular e "3 vagas" no plural, como na tela da rota (CA13).
  protected readonly seatsLabels = { '=1': '1 vaga', other: '# vagas' };
}

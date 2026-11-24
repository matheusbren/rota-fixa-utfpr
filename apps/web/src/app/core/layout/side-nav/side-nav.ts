import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-side-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-nav.html',
  host: { class: 'block min-h-full w-72 bg-neutral p-4 text-neutral-content' },
})
export class SideNav {
  readonly links = input.required<NavLink[]>();
  readonly linkSelect = output<void>();
}

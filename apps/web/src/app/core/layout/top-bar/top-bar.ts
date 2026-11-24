import { Component, output } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.html',
})
export class TopBar {
  readonly menuOpen = output<void>();
}

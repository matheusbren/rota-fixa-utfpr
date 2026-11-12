import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../footer/footer';
import { TopBar } from '../top-bar/top-bar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TopBar, Footer],
  templateUrl: './app-shell.html',
})
export class AppShell {}

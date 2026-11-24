import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../footer/footer';
import { NavLink, SideNav } from '../side-nav/side-nav';
import { TopBar } from '../top-bar/top-bar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TopBar, Footer, SideNav],
  templateUrl: './app-shell.html',
  host: { '(document:keydown.escape)': 'closeDrawer()' },
})
export class AppShell {
  // Cada história acrescenta o link da própria tela quando ela existir.
  protected readonly navLinks: NavLink[] = [{ label: 'Criar conta', path: '/criar-conta' }];

  protected readonly drawerOpen = signal(false);

  protected openDrawer(): void {
    this.drawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}

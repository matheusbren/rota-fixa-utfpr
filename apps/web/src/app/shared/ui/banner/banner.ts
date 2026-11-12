import { Component } from '@angular/core';

// Aviso de sucesso em destaque. O texto entra por projeção; `role="status"` faz o leitor
// de tela anunciá-lo sem tirar o foco de onde a pessoa está.
@Component({
  selector: 'app-banner',
  templateUrl: './banner.html',
  host: {
    role: 'status',
    class: 'block rounded-md border border-success bg-success-soft p-4 text-body text-success',
  },
})
export class Banner {}

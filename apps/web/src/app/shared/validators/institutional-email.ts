import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Os dois domínios da UTFPR, com o `@`: o texto depois do último `@` tem de ser exatamente um
// deles, e nada parecido (`ana@utfpr.edu.br.exemplo.com` não passa).
const INSTITUTIONAL_DOMAINS = ['@alunos.utfpr.edu.br', '@utfpr.edu.br'];

// Maiúsculas e espaços nas pontas não distinguem um e-mail de outro.
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// CA4: só aceita e-mail da UTFPR. Campo vazio também é recusado, porque não termina em domínio
// nenhum.
export const institutionalEmail: ValidatorFn = (
  control: AbstractControl<string>,
): ValidationErrors | null => {
  const email = normalizeEmail(control.value);
  return INSTITUTIONAL_DOMAINS.some((domain) => email.endsWith(domain))
    ? null
    : { institutionalEmail: true };
};

/**
 * Botão "Acessar" das páginas públicas: se este navegador já tem uma sessão válida (por exemplo, aberta em outra aba),
 * entra direto na área de membros, sem pedir o login de novo.
 * A decisão é do servidor (/api/auth/verify-access confere o cookie da sessão e o acesso pago). O navegador não lê token
 * nenhum: se a resposta não for "allowed", abre o login normal.
 */
export async function tryEnterMemberArea(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/verify-access', { cache: 'no-store', credentials: 'same-origin' });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    if (data?.allowed === true) {
      window.location.assign('/color-master-produto');
      return true;
    }
  } catch {
    /* sem rede ou erro: segue para o login normal */
  }
  return false;
}

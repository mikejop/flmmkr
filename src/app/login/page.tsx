import { redirect } from 'next/navigation';

// Rota com CSP por nonce: precisa de renderização dinâmica (o nonce muda a cada requisição).
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  redirect('/?login=true');
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { SITE_CONFIG } from '@/config/siteConfig';

export const metadata: Metadata = {
  title: 'Política de Privacidade | FLMMKR',
  description: 'Saiba como a FLMMKR coleta, utiliza, armazena e protege os seus dados pessoais em conformidade com a LGPD.',
  alternates: {
    canonical: '/privacidade',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacidadePage() {
  const lastUpdated = '05 de Outubro de 2026';

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased selection:bg-[#0071e3]/20 selection:text-[#0071e3]">
      {/* Header com Navegação */}
      <header className="sticky top-0 z-50 bg-[#f5f5f7]/80 backdrop-blur-xl border-b border-neutral-200/80">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-[#0071e3] transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Voltar para o Início</span>
          </Link>
          <span className="text-xs font-black tracking-widest text-[#0071e3] uppercase">
            FLMMKR · Jurídico
          </span>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-10">
        {/* Título e Badge */}
        <div className="space-y-3 border-b border-neutral-300 pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0071e3] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>LGPD Compliance · Lei nº 13.709/2018</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#1d1d1f]">
            Política de Privacidade
          </h1>
          <p className="text-sm text-neutral-500 font-medium">
            Última atualização: {lastUpdated}
          </p>
        </div>

        {/* Resumo e Compromisso */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-[#1d1d1f] flex items-center gap-2">
            <Lock size={18} className="text-[#0071e3]" />
            <span>Nosso Compromisso com a sua Privacidade</span>
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            A <strong>FLMMKR</strong> (marca sob responsabilidade de Michael Oliveira) valoriza a transparência, a segurança e a integridade de seus dados. Esta Política de Privacidade descreve como tratamos as informações pessoais coletadas quando você visita nosso site (<Link href="https://flmmkr.site" className="text-[#0071e3] underline">https://flmmkr.site</Link>), adquire nossos cursos, utiliza nossa área de membros ou interage com nossas ferramentas.
          </p>
        </div>

        {/* Seções Detalhadas */}
        <div className="space-y-8 text-sm text-neutral-700 leading-relaxed">
          {/* Seção 1 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              1. Informações que Coletamos
            </h3>
            <p>
              Coletamos informações fornecidas diretamente por você e dados gerados durante o uso da nossa plataforma:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li><strong>Dados Cadastrais:</strong> Nome completo, endereço de e-mail, número de telefone/WhatsApp e CPF (para emissão de nota fiscal e processamento seguro no gateway de pagamento).</li>
              <li><strong>Dados de Acesso à Área do Aluno:</strong> Senha criptografada, foto de perfil (avatar), nickname escolhido para a comunidade de comentários e registros de aulas concluídas.</li>
              <li><strong>Dados Técnicos &amp; Navegação:</strong> Endereço IP aproximado, dados anônimos de telemetria de tráfego, tipo de navegador, sistema operacional e identificador determinístico de hardware para controle de sessão única e proteção contra pirataria de cursos.</li>
            </ul>
          </section>

          {/* Seção 2 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              2. Finalidade do Tratamento de Dados
            </h3>
            <p>Utilizamos os seus dados pessoais exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li>Liberar e gerenciar seu acesso imediato aos treinamentos e ferramentas interativas.</li>
              <li>Processar pagamentos através de instituições autorizadas pelo Banco Central (Asaas).</li>
              <li>Prestar suporte ao aluno via e-mail e canais oficiais de atendimento.</li>
              <li>Notificar sobre menções de outros alunos em comentários ou atualizações pedagógicas no curso.</li>
              <li>Garantir a segurança técnica da plataforma, prevenir acessos simultâneos não autorizados e cumprir obrigações fiscais legais.</li>
            </ul>
          </section>

          {/* Seção 3 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              3. Compartilhamento de Dados com Terceiros
            </h3>
            <p>
              <strong>Não vendemos nem comercializamos dados de alunos com terceiros.</strong> O compartilhamento ocorre apenas com prestadores de serviços de infraestrutura essenciais para o funcionamento do ecossistema:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li><strong>Gateway de Pagamento (Asaas):</strong> Para processamento de Pix, Boleto e Cartão de Crédito com criptografia ponta a ponta.</li>
              <li><strong>Infraestrutura de Banco de Dados (Supabase / PostgreSQL):</strong> Hospedagem segura de dados sob normas rigorosas de criptografia e SOC2.</li>
              <li><strong>Hospedagem &amp; CDN (Vercel):</strong> Distribuição global ultrarrápida do site e aplicação de segurança contra ataques DDoS.</li>
              <li><strong>Analytics (Google Analytics &amp; Microsoft Bing):</strong> Métricas estatísticas de tráfego anônimas para aperfeiçoamento da experiência do usuário.</li>
            </ul>
          </section>

          {/* Seção 4 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              4. Cookies e Tecnologias de Monitoramento
            </h3>
            <p>
              Utilizamos cookies essenciais para manter sua sessão de aluno conectada, lembrar seu progresso de leitura nas aulas e mensurar o desempenho das páginas. Você pode gerenciar ou desativar os cookies nas preferências do seu navegador a qualquer momento.
            </p>
          </section>

          {/* Seção 5 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              5. Seus Direitos (LGPD - Art. 18)
            </h3>
            <p>
              De acordo com a Lei Geral de Proteção de Dados, você tem o direito de solicitar a qualquer momento:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li>Confirmação da existência de tratamento dos seus dados.</li>
              <li>Acesso e correção de dados incompletos ou inexatos.</li>
              <li>Exclusão definitiva de dados desnecessários ou revogação de consentimento, ressalvadas as obrigações fiscais legais de guarda de notas fiscais.</li>
            </ul>
          </section>

          {/* Seção 6 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              6. Contato com o Encarregado de Dados (DPO)
            </h3>
            <p>
              Para esclarecer dúvidas sobre esta Política de Privacidade ou exercer seus direitos de titular de dados, entre em contato diretamente pelo nosso canal oficial de atendimento:
            </p>
            <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200 space-y-1">
              <p><strong>E-mail:</strong> <a href="mailto:contato@flmmkr.site" className="text-[#0071e3] underline">contato@flmmkr.site</a></p>
              <p><strong>Endereço:</strong> Rua Simões Magro, 127, São Paulo - SP, Brasil</p>
              <p><strong>Responsável:</strong> Michael Oliveira · FLMMKR Treinamentos Audiovisuais</p>
            </div>
          </section>
        </div>

        {/* Rodapé Interno */}
        <div className="pt-8 border-t border-neutral-300 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500">
          <span>© {new Date().getFullYear()} FLMMKR. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link href="/termos" className="hover:text-neutral-900 transition-colors underline">
              Termos de Uso
            </Link>
            <Link href="/cursos" className="hover:text-neutral-900 transition-colors underline">
              Ver Cursos
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

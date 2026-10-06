import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Termos de Uso | FLMMKR',
  description: 'Conheça os Termos de Uso e Condições Gerais dos treinamentos, produtos e serviços da FLMMKR.',
  alternates: {
    canonical: '/termos',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermosPage() {
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
            <FileText size={14} />
            <span>Contrato de Licença &amp; Prestação de Serviços</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#1d1d1f]">
            Termos de Uso
          </h1>
          <p className="text-sm text-neutral-500 font-medium">
            Última atualização: {lastUpdated}
          </p>
        </div>

        {/* Resumo */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-[#1d1d1f] flex items-center gap-2">
            <BookOpen size={18} className="text-[#0071e3]" />
            <span>Visão Geral do Contrato de Treinamento</span>
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Bem-vindo à <strong>FLMMKR</strong>. Ao adquirir nossos cursos ou utilizar nosso ambiente digital de aprendizado (<Link href="https://flmmkr.site" className="text-[#0071e3] underline">https://flmmkr.site</Link>), você concorda integralmente com estes Termos de Uso. Recomendamos a leitura cuidadosa deste documento.
          </p>
        </div>

        {/* Seções Detalhadas */}
        <div className="space-y-8 text-sm text-neutral-700 leading-relaxed">
          {/* Seção 1 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              1. Objeto e Licença de Uso
            </h3>
            <p>
              A FLMMKR concede ao aluno uma <strong>licença pessoal, individual, intransferível e não exclusiva</strong> de acesso aos treinamentos digitais contratados (incluindo aulas em vídeo, material didático de apoio, planilhas, arquivos de projeto e footages de prática comercial).
            </p>
            <p>
              A licença não transfere propriedade intelectual. É expressamente proibida a reprodução, download não autorizado, rateio de conta, redistribuição, retransmissão ou comercialização do conteúdo do curso.
            </p>
          </section>

          {/* Seção 2 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              2. Cadastro e Proteção de Conta
            </h3>
            <p>
              O acesso à plataforma é individual por aluno. O sistema da FLMMKR conta com monitoramento ativo contra acessos simultâneos. Caso o mesmo login seja detectado em múltiplos dispositivos simultaneamente, a sessão anterior será desconectada automaticamente em favor do dispositivo mais recente.
            </p>
            <p>
              O aluno é o único responsável pela guarda e sigilo da sua senha de acesso.
            </p>
          </section>

          {/* Seção 3 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              3. Regras de Convivência na Comunidade e Comentários
            </h3>
            <p>
              O campo de comentários nas aulas destina-se a tirar dúvidas técnicas, trocar feedbacks construtivos e debater os temas pedagógicos do audiovisual. Ao participar, o aluno concorda com as seguintes regras:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li>Não é permitida a inserção de links externos comerciais ou de autopromoção sem autorização prévia.</li>
              <li>É estimulada a colaboração e a menção de colegas através de seus `@nicknames`.</li>
              <li>Comentários contendo ofensas, discriminação ou condutas inapropriadas serão removidos e o usuário estará sujeito à suspensão da conta.</li>
            </ul>
          </section>

          {/* Seção 4 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              4. Garantia e Direito de Arrependimento (7 Dias)
            </h3>
            <p>
              Em total conformidade com o <strong>Artigo 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990)</strong>, você tem o direito incondicional de solicitar o cancelamento da sua compra e o reembolso integral de 100% do valor pago no prazo de até <strong>7 (sete) dias corridos</strong> a contar da confirmação do pagamento.
            </p>
            <p>
              Para solicitar o reembolso dentro do prazo de garantia, basta enviar um e-mail para <a href="mailto:contato@flmmkr.com.br" className="text-[#0071e3] underline">contato@flmmkr.com.br</a> com o número do seu pedido.
            </p>
          </section>

          {/* Seção 5 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              5. Período de Acesso e Atualizações
            </h3>
            <p>
              O acesso ao treinamento contratado é garantido pelo período informado na página de oferta do respectivo produto (geralmente acesso vitalício ou de 1 ano, conforme o plano adquirido). A FLMMKR se reserva o direito de realizar melhorias, atualizações de aulas e ajustes técnicos para manter o treinamento compatível com as versões mais recentes dos softwares abordados (ex: DaVinci Resolve).
            </p>
          </section>

          {/* Seção 6 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              6. Foro de Eleição
            </h3>
            <p>
              Fica eleito o Foro da Comarca de domicílio do consumidor ou a comarca da sede da empresa para dirimir eventuais controvérsias decorrentes destes Termos de Uso, com renúncia expressa a qualquer outro.
            </p>
          </section>
        </div>

        {/* Rodapé Interno */}
        <div className="pt-8 border-t border-neutral-300 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500">
          <span>© {new Date().getFullYear()} FLMMKR. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="hover:text-neutral-900 transition-colors underline">
              Política de Privacidade
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

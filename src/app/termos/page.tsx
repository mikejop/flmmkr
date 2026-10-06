import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, ShieldCheck, BookOpen, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Termos de Uso e Política de Privacidade | FLMMKR',
  description: 'Termos de Uso e Política de Privacidade da plataforma FLMMKR em total conformidade com a LGPD e CDC.',
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
            FLMMKR · Jurídico &amp; LGPD
          </span>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-10">
        {/* Título e Badge */}
        <div className="space-y-3 border-b border-neutral-300 pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0071e3] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>LGPD Compliance · Código de Defesa do Consumidor</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#1d1d1f]">
            Termos de Uso e Política de Privacidade
          </h1>
          <p className="text-sm text-neutral-500 font-medium">
            Última atualização: {lastUpdated}
          </p>
        </div>

        {/* Resumo */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-[#1d1d1f] flex items-center gap-2">
            <BookOpen size={18} className="text-[#0071e3]" />
            <span>Visão Geral do Contrato e Proteção de Dados</span>
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Estes Termos de Uso e Política de Privacidade (“Termos”) regulam o acesso e a utilização da plataforma digital de educação audiovisual (“Plataforma”), bem como a aquisição dos produtos e serviços digitais nela oferecidos. Ao marcar a opção “Li e aceito os Termos de Uso e a Política de Privacidade” no momento da compra ou cadastro, o usuário declara ter lido, compreendido e concordado integralmente com as condições abaixo.
          </p>
        </div>

        {/* Seções Detalhadas */}
        <div className="space-y-8 text-sm text-neutral-700 leading-relaxed">
          {/* Seção 1 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              1. Identificação do Prestador de Serviços
            </h3>
            <p>
              A Plataforma é operada por <strong>FLMMKR Treinamentos Audiovisuais</strong>, com sede em <strong>Rua Simões Magro, 127, São Paulo - SP, Brasil</strong>, doravante denominada “Empresa”, “nós” ou “nosso”.
            </p>
            <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200 space-y-1">
              <p><strong>Contato para assuntos relacionados a estes Termos e à proteção de dados (DPO):</strong></p>
              <p>E-mail: <a href="mailto:contato@flmmkr.site" className="text-[#0071e3] underline">contato@flmmkr.site</a></p>
              <p>Endereço: Rua Simões Magro, 127, São Paulo - SP, Brasil</p>
            </div>
          </section>

          {/* Seção 2 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              2. Objeto
            </h3>
            <p>
              A Plataforma oferece conteúdos educacionais, cursos, treinamentos e materiais digitais voltados ao desenvolvimento de profissionais do audiovisual, incluindo, mas não se limitando a, aulas em vídeo, materiais complementares, área de membros e funcionalidades relacionadas.
            </p>
          </section>

          {/* Seção 3 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              3. Aceitação dos Termos
            </h3>
            <p>
              O uso da Plataforma e a conclusão de qualquer compra estão condicionados à aceitação integral destes Termos. Caso o usuário não concorde com qualquer disposição, deverá abster-se de utilizar a Plataforma e de realizar a compra.
            </p>
          </section>

          {/* Seção 4 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              4. Cadastro, Conta e Área de Membros
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li><strong>4.1.</strong> Para acessar a área de membros, o usuário deverá criar uma conta fornecendo dados verídicos e atualizados.</li>
              <li><strong>4.2.</strong> O usuário é responsável pela confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.</li>
              <li><strong>4.3.</strong> A Plataforma utiliza mecanismo de sessão ativa única, podendo limitar o acesso simultâneo a partir de múltiplos dispositivos ou localizações, com a finalidade de prevenir o compartilhamento indevido de conta.</li>
              <li><strong>4.4.</strong> A Empresa poderá suspender ou cancelar contas em caso de indícios de fraude, compartilhamento não autorizado ou violação destes Termos.</li>
            </ul>
          </section>

          {/* Seção 5 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              5. Produtos, Pagamentos e Cancelamento
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li><strong>5.1.</strong> As condições comerciais (preço, forma de pagamento, prazos de acesso e eventuais descontos) são informadas no momento da compra.</li>
              <li><strong>5.2.</strong> Os pagamentos são processados por meio de parceiro especializado (Asaas), em conformidade com as normas de segurança da informação e PCI-DSS.</li>
              <li><strong>5.3.</strong> O usuário autoriza a coleta e o tratamento dos dados necessários à emissão de nota fiscal, cumprimento de obrigações fiscais e prevenção de fraudes.</li>
              <li><strong>5.4.</strong> Em conformidade com o Artigo 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990), o usuário tem o direito incondicional de solicitar o cancelamento da sua compra e o reembolso integral de 100% do valor pago no prazo de até 7 (sete) dias corridos a contar da confirmação do pagamento.</li>
            </ul>
          </section>

          {/* Seção 6 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              6. Propriedade Intelectual
            </h3>
            <p>
              Todo o conteúdo disponibilizado na Plataforma (vídeos, textos, imagens, marcas, layout, códigos e demais materiais) é de titularidade da Empresa ou de terceiros licenciadores e está protegido pela legislação de direitos autorais e propriedade intelectual. É proibida a reprodução, distribuição, compartilhamento, gravação, download não autorizado ou qualquer uso comercial sem prévia autorização escrita.
            </p>
          </section>

          {/* Seção 7 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              7. Condutas Proibidas
            </h3>
            <p>É vedado ao usuário:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li>a) Compartilhar credenciais de acesso;</li>
              <li>b) Utilizar ferramentas de gravação de tela, bots, scrapers ou qualquer meio automatizado para capturar conteúdo;</li>
              <li>c) Praticar atos que possam comprometer a segurança, integridade ou disponibilidade da Plataforma;</li>
              <li>d) Utilizar a Plataforma para fins ilícitos ou que violem direitos de terceiros.</li>
            </ul>
          </section>

          {/* Seção 8 */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              8. Privacidade e Proteção de Dados Pessoais (LGPD)
            </h3>
            <p>
              A Empresa trata dados pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e demais normas aplicáveis.
            </p>

            <h4 className="text-base font-bold text-[#1d1d1f]">8.1. Dados Coletados</h4>
            <div className="space-y-2 text-neutral-600 pl-3 border-l-2 border-neutral-300">
              <p><strong>a) Dados de navegação e telemetria (first-party):</strong> Identificador anônimo de visitante, Endereço IP, país, estado, cidade, latitude e longitude aproximadas, tipo de dispositivo, sistema operacional, navegador, resolução de tela, User-Agent, origem do tráfego (orgânico, pago, redes sociais, direto), página de entrada, referrer e parâmetros UTM.</p>
              <p><strong>b) Impressão digital de dispositivo (device fingerprint):</strong> Sinais técnicos do dispositivo (núcleos de processamento, memória aproximada, características gráficas, fuso horário e outros identificadores técnicos), utilizados exclusivamente para controle de validade de ofertas com tempo limitado, prevenção de fraudes e proteção de conteúdo.</p>
              <p><strong>c) Dados de compra e checkout:</strong> Nome completo, e-mail, CPF/CNPJ, telefone, data de nascimento, idade e profissão; Endereço completo para fins fiscais; Forma de pagamento, número de parcelas e últimos dígitos do cartão (quando aplicável). Os dados completos de cartão são transmitidos de forma criptografada diretamente ao processador de pagamentos (Asaas).</p>
              <p><strong>d) Dados da área de membros:</strong> E-mail, senha criptografada, foto de perfil, apelido público, histórico de aulas assistidas, comentários, curtidas e informações de sessão ativa.</p>
              <p><strong>e) Cookies e armazenamento local:</strong> Identificação do visitante, atribuição de tráfego, controle de sessão e segurança da Plataforma.</p>
              <p><strong>f) Ferramentas de terceiros:</strong> Google Analytics e Google Tag Manager (análise de uso); Microsoft Clarity (mapas de calor e gravações de comportamento anônimas); Asaas (processamento de pagamentos seguro).</p>
            </div>

            <h4 className="text-base font-bold text-[#1d1d1f] pt-2">8.2. Finalidades e Bases Legais</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-neutral-200 rounded-xl overflow-hidden">
                <thead className="bg-neutral-100 text-neutral-800">
                  <tr>
                    <th className="p-3 border-b border-neutral-200">Finalidade</th>
                    <th className="p-3 border-b border-neutral-200">Base Legal (LGPD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-600">
                  <tr>
                    <td className="p-3">Execução do contrato e entrega do conteúdo</td>
                    <td className="p-3">Art. 7º, V (execução de contrato)</td>
                  </tr>
                  <tr>
                    <td className="p-3">Cumprimento de obrigações fiscais e legais</td>
                    <td className="p-3">Art. 7º, II (obrigação legal)</td>
                  </tr>
                  <tr>
                    <td className="p-3">Prevenção de fraudes e segurança da Plataforma</td>
                    <td className="p-3">Art. 7º, IX (legítimo interesse) e Art. 10</td>
                  </tr>
                  <tr>
                    <td className="p-3">Análise de desempenho, melhorias e marketing</td>
                    <td className="p-3">Art. 7º, I (consentimento) / Legítimo interesse</td>
                  </tr>
                  <tr>
                    <td className="p-3">Recuperação de carrinho abandonado</td>
                    <td className="p-3">Legítimo interesse / consentimento</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-base font-bold text-[#1d1d1f] pt-2">8.3. Compartilhamento de Dados</h4>
            <p>
              Não comercializamos dados pessoais. Compartilhamos estritamente com processadores de pagamento (Asaas), provedores de infraestrutura em nuvem sob rígida confidencialidade (Supabase, Vercel) e autoridades públicas mediante obrigação legal.
            </p>

            <h4 className="text-base font-bold text-[#1d1d1f] pt-2">8.4. Direitos do Titular</h4>
            <p>
              O titular poderá, a qualquer momento, solicitar confirmação, acesso, correção, anonimização ou exclusão de dados pessoais através do canal oficial: <strong>contato@flmmkr.site</strong>.
            </p>
          </section>

          {/* Seção 9 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              9. Limitação de Responsabilidade
            </h3>
            <p>
              A Plataforma é disponibilizada “no estado em que se encontra”. A Empresa não se responsabiliza por indisponibilidades temporárias decorrentes de operadoras de telecomunicações ou pelo mau uso das credenciais por parte do usuário.
            </p>
          </section>

          {/* Seção 10 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              10. Alterações destes Termos
            </h3>
            <p>
              Podemos atualizar estes Termos periodicamente. A versão vigente estará sempre disponível na Plataforma com indicação da data de atualização.
            </p>
          </section>

          {/* Seção 11 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              11. Lei Aplicável e Foro
            </h3>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de <strong>São Paulo - SP</strong>, com renúncia expressa a qualquer outro, ressalvadas as hipóteses de competência do Código de Defesa do Consumidor.
            </p>
          </section>

          {/* Seção 12 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              12. Disposições Gerais
            </h3>
            <p>
              Caso qualquer cláusula seja considerada inválida, as demais permanecerão em pleno vigor. A tolerância quanto ao descumprimento de qualquer disposição não implica renúncia ao direito de exigir o cumprimento futuro.
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

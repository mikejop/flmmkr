import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { SITE_CONFIG } from '@/config/siteConfig';

// Conteúdo público definido em código: estático, regenerado no máximo 1x por dia (ou no deploy).
export const revalidate = 86400;

export const metadata: Metadata = {
  title: { absolute: 'Termos de Uso e Privacidade | FLMMKR Plugins' },
  description:
    'Termos de uso dos plugins FLMMKR para DaVinci Resolve e como tratamos seus dados pessoais, de acordo com a LGPD (Lei nº 13.709/2018).',
  alternates: { canonical: '/plugins/termos' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'FLMMKR',
    title: 'Termos de Uso e Privacidade | FLMMKR Plugins',
    locale: 'pt_BR',
    images: [{ url: '/plugins/og-plugins.jpg', width: 1200, height: 630, alt: 'FLMMKR Plugins para DaVinci Resolve' }],
  },
  twitter: { card: 'summary_large_image', images: ['/plugins/og-plugins.jpg'] },
};

const LAST_UPDATED = '27 de outubro de 2026';
const EMAIL = SITE_CONFIG.contact.email;

const h2 = 'text-xl font-bold text-[#1d1d1f]';
const h3 = 'text-base font-semibold text-[#1d1d1f]';
const list = 'list-disc pl-5 space-y-1.5 text-neutral-600';

const SECTIONS = [
  ['aceitacao', '1. Quem somos e aceitação'],
  ['plugins', '2. Os plugins'],
  ['beta', '3. Plugins em construção e versões beta'],
  ['licenca', '4. Licença de uso'],
  ['responsabilidade', '5. Garantias e responsabilidade'],
  ['cadastro', '6. Cadastro para download'],
  ['doacoes', '7. Doações'],
  ['privacidade', '8. Privacidade e LGPD'],
  ['alteracoes', '9. Alterações destes termos'],
  ['foro', '10. Lei aplicável e foro'],
] as const;

export default function PluginsTermosPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased selection:bg-[#0071e3]/20 selection:text-[#0071e3]">
      <header className="sticky top-0 z-50 bg-[#f5f5f7]/80 backdrop-blur-xl border-b border-neutral-200/80">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/plugins" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-[#0071e3] transition-colors">
            <ArrowLeft size={15} />
            <span>Voltar para os plugins</span>
          </Link>
          <span className="text-xs font-black tracking-widest text-[#0071e3] uppercase">FLMMKR Plugins · Jurídico</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-10">
        <div className="space-y-3 border-b border-neutral-300 pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0071e3] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>LGPD · Lei nº 13.709/2018</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Termos de Uso e Privacidade</h1>
          <p className="text-sm text-neutral-500 font-medium">FLMMKR Plugins para DaVinci Resolve · Última atualização: {LAST_UPDATED}</p>
        </div>

        {/* Resumo */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 space-y-3">
          <h2 className="text-base font-bold">Resumo em poucas linhas</h2>
          <ul className={list}>
            <li>Os plugins são <strong>gratuitos</strong>: sem taxa, sem marca d&apos;água e sem cobrança surpresa.</li>
            <li>Alguns plugins ainda estão <strong>em construção ou em beta</strong> e podem apresentar erros.</li>
            <li>Doar é <strong>opcional</strong> e não muda nada no acesso aos plugins.</li>
            <li>Usamos Google Analytics e ferramentas de análise da Microsoft para <strong>melhorar a experiência</strong> no site.</li>
            <li>Os dados do download e da doação servem para <strong>avisar de atualizações e enviar novidades</strong> (só se você escolher receber) e para a <strong>segurança</strong> do ecossistema e da comunidade.</li>
            <li>Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail <a href={`mailto:${EMAIL}`} className="text-[#0071e3] underline">{EMAIL}</a>.</li>
          </ul>
        </div>

        {/* Sumário */}
        <nav aria-label="Sumário" className="p-6 rounded-2xl bg-white border border-neutral-200/80">
          <h2 className="text-base font-bold mb-3">Sumário</h2>
          <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {SECTIONS.map(([id, title]) => (
              <li key={id}>
                <a href={`#${id}`} className="text-[#0071e3] hover:underline">{title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10 text-sm text-neutral-700 leading-relaxed">
          <section id="aceitacao" className="space-y-3 scroll-mt-20">
            <h2 className={h2}>1. Quem somos e aceitação</h2>
            <p>
              Os plugins FLMMKR (&quot;plugins&quot;) são desenvolvidos e distribuídos pela <strong>FLMMKR</strong>, marca sob responsabilidade de
              Michael Oliveira (&quot;FLMMKR&quot;, &quot;nós&quot;), pela página{' '}
              <Link href="/plugins" className="text-[#0071e3] underline">flmmkr.site/plugins</Link>.
            </p>
            <p>
              Ao baixar, instalar ou usar os plugins, fazer o cadastro para download ou fazer uma doação, você declara que leu e concorda com estes
              Termos de Uso e Privacidade. Se não concordar, não use os plugins. O uso dos cursos e da área de membros da FLMMKR continua regido pelos{' '}
              <Link href="/termos" className="text-[#0071e3] underline">Termos de Uso</Link> e pela{' '}
              <Link href="/privacidade" className="text-[#0071e3] underline">Política de Privacidade</Link> gerais do site.
            </p>
          </section>

          <section id="plugins" className="space-y-3 scroll-mt-20">
            <h2 className={h2}>2. Os plugins</h2>
            <p>
              Os plugins são ferramentas para o DaVinci Resolve, feitos para a comunidade do audiovisual. Eles são <strong>gratuitos</strong> e
              funcionam na versão gratuita e na versão Studio do DaVinci Resolve. O pacote FLMMKR FX instala os plugins prontos de uma vez, com versões
              para macOS, Windows e Linux.
            </p>
            <p>
              O instalador pode consultar um arquivo público de versão para avisar quando houver atualização. Essa consulta não envia seus dados
              pessoais.
            </p>
            <p>
              DaVinci Resolve é marca registrada da Blackmagic Design Pty. Ltd. Os plugins FLMMKR são independentes e não são afiliados,
              patrocinados nem endossados pela Blackmagic Design.
            </p>
          </section>

          <section id="beta" className="space-y-3 scroll-mt-20">
            <h2 className={h2}>3. Plugins em construção e versões beta</h2>
            <p>
              Alguns plugins ainda estão <strong>em construção</strong> e outros são distribuídos em <strong>versão beta</strong> (como o Social). Por isso,
              eles <strong>podem apresentar erros</strong>, falhas visuais, comportamento inesperado, incompatibilidade com determinadas versões do
              DaVinci Resolve, do sistema operacional ou da placa de vídeo, e podem mudar ou deixar de existir sem aviso prévio.
            </p>
            <ul className={list}>
              <li>Faça backup dos seus projetos e bancos de dados do DaVinci Resolve antes de instalar ou atualizar.</li>
              <li>Teste os plugins antes de usá-los em um trabalho com prazo de entrega.</li>
              <li>
                Encontrou um erro? Conte para a gente em <a href={`mailto:${EMAIL}`} className="text-[#0071e3] underline">{EMAIL}</a>. O relato ajuda a
                melhorar o plugin para toda a comunidade.
              </li>
            </ul>
            <p>Plugins anunciados como &quot;em breve&quot; ou &quot;em produção&quot; não têm data de lançamento garantida.</p>
          </section>

          <section id="licenca" className="space-y-3 scroll-mt-20">
            <h2 className={h2}>4. Licença de uso</h2>
            <p>
              A FLMMKR concede a você uma licença gratuita, pessoal, não exclusiva, intransferível e revogável para instalar e usar os plugins em
              projetos pessoais e profissionais, inclusive trabalhos pagos para clientes.
            </p>
            <p>Não é permitido:</p>
            <ul className={list}>
              <li>vender, alugar, sublicenciar ou cobrar pelo acesso aos plugins;</li>
              <li>redistribuir os arquivos dos plugins ou do instalador em outros sites, lojas ou pacotes sem autorização por escrito;</li>
              <li>modificar, descompilar ou fazer engenharia reversa dos plugins para copiá-los ou distribuí-los como se fossem seus;</li>
              <li>remover avisos de autoria, marca ou direitos autorais;</li>
              <li>usar os plugins para atividades ilegais.</li>
            </ul>
            <p>
              Os plugins, seus códigos, nomes, marcas e materiais de divulgação pertencem à FLMMKR e são protegidos pela Lei de Direitos Autorais
              (Lei nº 9.610/1998) e pela Lei de Software (Lei nº 9.609/1998). As imagens e vídeos que você cria usando os plugins são seus.
            </p>
          </section>

          <section id="responsabilidade" className="space-y-3 scroll-mt-20">
            <h2 className={h2}>5. Garantias e responsabilidade</h2>
            <p>
              Por serem gratuitos e, em parte, ainda em desenvolvimento, os plugins são oferecidos <strong>no estado em que se encontram</strong>, sem
              garantia de funcionamento ininterrupto, livre de erros ou adequado a uma finalidade específica.
            </p>
            <p>
              Na máxima extensão permitida pela lei, a FLMMKR não se responsabiliza por perda de dados, de projetos, de prazos ou de lucros, nem por
              danos indiretos decorrentes do uso ou da impossibilidade de uso dos plugins. Nada nestes termos limita direitos que o Código de Defesa do
              Consumidor (Lei nº 8.078/1990) garante e que não possam ser afastados.
            </p>
            <p>Podemos suspender, alterar ou encerrar a distribuição de qualquer plugin a qualquer momento.</p>
          </section>

          <section id="cadastro" className="space-y-3 scroll-mt-20">
            <h2 className={h2}>6. Cadastro para download</h2>
            <p>
              Para baixar os plugins, pedimos um cadastro gratuito com nome, sobrenome e e-mail. Você se compromete a informar dados verdadeiros. O
              cadastro é feito uma vez por navegador; quem já se cadastrou baixa direto nas próximas vezes.
            </p>
            <p>
              No cadastro você escolhe, em um botão próprio que começa desligado, se quer receber notificações e e-mails da FLMMKR. O download não
              depende dessa escolha.
            </p>
          </section>

          <section id="doacoes" className="space-y-3 scroll-mt-20">
            <h2 className={h2}>7. Doações</h2>
            <ul className={list}>
              <li>A doação é <strong>voluntária</strong>. Ela não é compra e não dá direito a produto, suporte, prioridade ou recurso exclusivo. Os plugins continuam gratuitos para quem doa e para quem não doa.</li>
              <li>O valor mínimo é de <strong>R$ 5,00</strong> por doação, por Pix ou cartão de crédito.</li>
              <li>
                Os pagamentos são processados pelo <strong>Asaas</strong>, instituição de pagamento. Os dados do cartão são
                enviados de forma criptografada ao Asaas e <strong>não ficam guardados</strong> nos nossos sistemas.
              </li>
              <li>No cartão, o Asaas exige CPF ou CNPJ, telefone, CEP e número do endereço do titular.</li>
              <li>
                Doou por engano ou o valor saiu errado? Escreva para <a href={`mailto:${EMAIL}`} className="text-[#0071e3] underline">{EMAIL}</a> em até
                7 dias e devolvemos o valor pelo mesmo meio de pagamento.
              </li>
            </ul>
          </section>

          <section id="privacidade" className="space-y-6 scroll-mt-20">
            <div className="space-y-3">
              <h2 className={h2}>8. Privacidade e LGPD</h2>
              <p>
                Tratamos seus dados pessoais de acordo com a Lei Geral de Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018). A controladora dos
                dados é a FLMMKR, marca sob responsabilidade de Michael Oliveira. Contato do encarregado:{' '}
                <a href={`mailto:${EMAIL}`} className="text-[#0071e3] underline">{EMAIL}</a>.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className={h3}>8.1 Que dados coletamos</h3>
              <ul className={list}>
                <li>
                  <strong>Navegação no site:</strong> páginas visitadas, cliques, tempo de permanência, origem do acesso, tipo de dispositivo, navegador,
                  sistema operacional e localização aproximada. Esses dados são coletados por cookies e tecnologias semelhantes do{' '}
                  <strong>Google Analytics</strong> e do Google Tag Manager, das ferramentas de análise da <strong>Microsoft (Bing / Microsoft Clarity)</strong>{' '}
                  e do Vercel Analytics. O sistema operacional também é usado para indicar o download certo para o seu computador.
                </li>
                <li>
                  <strong>Cadastro para download:</strong> nome, sobrenome, e-mail, sistema escolhido (macOS, Windows ou Linux), sua escolha sobre receber
                  novidades e a data do cadastro.
                </li>
                <li>
                  <strong>Doação:</strong> nome, sobrenome, e-mail, valor, forma de pagamento, situação do pagamento e sua escolha sobre receber novidades.
                  Telefone e endereço são opcionais no Pix. No cartão, CPF ou CNPJ, telefone, CEP e número são exigidos pelo Asaas; os dados do cartão
                  vão direto para o Asaas e não ficam com a gente.
                </li>
                <li>
                  <strong>Segurança:</strong> endereço IP (guardado apenas de forma cifrada, como hash irreversível), registros de tentativas e a
                  verificação anti-robô do Cloudflare Turnstile.
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className={h3}>8.2 Para que usamos</h3>
              <ul className={list}>
                <li>
                  <strong>Melhorar a experiência:</strong> os dados do Google Analytics e das ferramentas da Microsoft mostram como o site é usado, o que
                  funciona e o que precisa melhorar.
                </li>
                <li>
                  <strong>Avisar de atualizações e enviar marketing:</strong> os dados do download e da doação são usados para enviar notificações e
                  e-mails da FLMMKR sobre atualizações, novos plugins, conteúdos e ofertas. <strong>Isso só acontece se você escolher receber</strong>,
                  no botão do cadastro ou da doação, e você pode cancelar quando quiser.
                </li>
                <li>
                  <strong>Segurança do ecossistema e da comunidade:</strong> prevenir fraude, robôs, abuso dos formulários, uso de cartões de terceiros e
                  distribuição indevida dos plugins.
                </li>
                <li><strong>Processar doações</strong> e cumprir obrigações legais, fiscais e regulatórias.</li>
              </ul>
              <p>Não vendemos nem alugamos seus dados pessoais.</p>
            </div>

            <div className="space-y-3">
              <h3 className={h3}>8.3 Bases legais (art. 7º da LGPD)</h3>
              <ul className={list}>
                <li><strong>Consentimento:</strong> envio de notificações e e-mail marketing.</li>
                <li><strong>Execução de contrato e procedimentos preliminares:</strong> cadastro para download e processamento das doações.</li>
                <li><strong>Legítimo interesse:</strong> análise de uso do site para melhorar a experiência, segurança e prevenção a fraudes.</li>
                <li><strong>Cumprimento de obrigação legal ou regulatória:</strong> registros fiscais e financeiros das doações.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className={h3}>8.4 Com quem compartilhamos</h3>
              <p>Apenas com fornecedores necessários para o funcionamento do serviço, que tratam os dados em nosso nome:</p>
              <ul className={list}>
                <li><strong>Supabase</strong> (banco de dados) e <strong>Vercel</strong> (hospedagem e estatísticas do site);</li>
                <li><strong>Asaas</strong> (processamento das doações por Pix e cartão);</li>
                <li><strong>Cloudflare</strong> (verificação anti-robô e entrega dos arquivos de download);</li>
                <li><strong>Google</strong> (Google Analytics e Google Tag Manager) e <strong>Microsoft</strong> (Bing / Microsoft Clarity);</li>
                <li>provedores de envio de e-mail, para quem escolheu receber novidades;</li>
                <li>autoridades públicas, quando houver obrigação legal ou ordem judicial.</li>
              </ul>
              <p>
                Alguns desses fornecedores guardam dados em servidores fora do Brasil. Nesses casos, a transferência internacional segue o art. 33 da
                LGPD, com fornecedores que adotam garantias adequadas de proteção.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className={h3}>8.5 Por quanto tempo guardamos</h3>
              <ul className={list}>
                <li>Cadastro para download: enquanto o cadastro estiver ativo ou até você pedir a exclusão.</li>
                <li>Doações: pelo prazo exigido pela legislação fiscal e financeira (em regra, 5 anos).</li>
                <li>Consentimento para novidades: até você cancelar. O registro do cancelamento é mantido para garantir que não voltaremos a enviar.</li>
                <li>Dados de navegação: pelos prazos configurados nas ferramentas de análise.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className={h3}>8.6 Seus direitos (art. 18 da LGPD)</h3>
              <p>A qualquer momento, você pode pedir:</p>
              <ul className={list}>
                <li>confirmação de que tratamos seus dados e acesso a eles;</li>
                <li>correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a LGPD;</li>
                <li>portabilidade dos dados;</li>
                <li>eliminação dos dados tratados com base no seu consentimento;</li>
                <li>informação sobre com quem compartilhamos seus dados;</li>
                <li>revogação do consentimento.</li>
              </ul>
              <p>
                Para exercer seus direitos, escreva para <a href={`mailto:${EMAIL}`} className="text-[#0071e3] underline">{EMAIL}</a>. Respondemos em até
                15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
              </p>
            </div>

            <div className="space-y-3">
              <h3 className={h3}>8.7 Como parar de receber novidades</h3>
              <p>
                Todo e-mail de marketing traz um link para cancelar. Você também pode pedir o cancelamento pelo e-mail{' '}
                <a href={`mailto:${EMAIL}`} className="text-[#0071e3] underline">{EMAIL}</a>. Cancelar não afeta o seu acesso aos plugins.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className={h3}>8.8 Cookies</h3>
              <p>
                Usamos cookies para estatísticas de uso (Google Analytics, Microsoft Clarity) e para lembrar que você já fez o cadastro neste navegador.
                Você pode bloquear ou apagar cookies nas configurações do seu navegador; o site continua funcionando, mas pode pedir o cadastro de novo.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className={h3}>8.9 Segurança</h3>
              <p>
                Usamos conexão criptografada (HTTPS), controle de acesso no banco de dados, IP guardado apenas como hash, limite de tentativas e
                verificação anti-robô. Nenhum sistema é 100% seguro; se ocorrer um incidente relevante, avisaremos as pessoas afetadas e a ANPD, como
                manda a lei.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className={h3}>8.10 Menores de idade</h3>
              <p>
                Menores de 18 anos só devem fazer o cadastro ou doar com o consentimento de um dos pais ou responsável legal.
              </p>
            </div>
          </section>

          <section id="alteracoes" className="space-y-3 scroll-mt-20">
            <h2 className={h2}>9. Alterações destes termos</h2>
            <p>
              Podemos atualizar estes termos para refletir mudanças nos plugins, na lei ou nas ferramentas que usamos. A data da última atualização
              fica no topo da página. Se a mudança for relevante, avisaremos quem escolheu receber novidades.
            </p>
          </section>

          <section id="foro" className="space-y-3 scroll-mt-20">
            <h2 className={h2}>10. Lei aplicável e foro</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de <strong>São Paulo - SP</strong>,
              ressalvado o direito do consumidor de propor ação no foro do seu domicílio, nos termos do Código de Defesa do Consumidor.
            </p>
          </section>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 text-sm text-neutral-600">
          Dúvidas sobre estes termos ou sobre seus dados? Fale com a gente em{' '}
          <a href={`mailto:${EMAIL}`} className="text-[#0071e3] underline">{EMAIL}</a>.
        </div>
      </main>

      <footer className="border-t border-neutral-200/80 py-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} FLMMKR. Todos os direitos reservados.
      </footer>
    </div>
  );
}

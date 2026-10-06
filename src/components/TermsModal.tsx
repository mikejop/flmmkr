'use client';

import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Lock } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto transition-all duration-200 animate-in fade-in"
      style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-white/20 shadow-[0_32px_80px_-8px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] animate-in zoom-in-95 duration-200"
        style={{
          background: 'rgba(20,20,24,0.98)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)'
        }}
      >
        {/* Top Rim */}
        <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-3xl bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center text-[#0071e3]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#0071e3] uppercase block">
                FLMMKR · Jurídico &amp; LGPD
              </span>
              <h2 id="terms-modal-title" className="text-[17px] sm:text-[19px] font-bold text-white tracking-tight">
                Termos de Uso e Política de Privacidade
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            aria-label="Fechar termos"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-[13px] sm:text-[14px] leading-relaxed text-white/80 font-normal">
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5 text-white/90 text-[12px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Última atualização:</strong> 05 de Outubro de 2026 · Em conformidade com a LGPD (Lei nº 13.709/2018) e CDC.
            </span>
          </div>

          <p>
            Estes Termos de Uso e Política de Privacidade (“Termos”) regulam o acesso e a utilização da plataforma digital de educação audiovisual (“Plataforma”), bem como a aquisição dos produtos e serviços digitais nela oferecidos.
          </p>

          <p>
            Ao marcar a opção <strong className="text-white">“Li e aceito os Termos de Uso e a Política de Privacidade”</strong> no momento da compra, o usuário declara ter lido, compreendido e concordado integralmente com as condições abaixo.
          </p>

          {/* 1. Identificação */}
          <section className="space-y-2 border-t border-white/10 pt-4">
            <h3 className="text-[15px] font-semibold text-white">
              1. Identificação do Prestador de Serviços
            </h3>
            <p>
              A Plataforma é operada por <strong>FLMMKR Treinamentos Audiovisuais</strong>, com sede em <strong>Rua Simões Magro, 127, São Paulo - SP, Brasil</strong>, doravante denominada “Empresa”, “nós” ou “nosso”.
            </p>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8 text-[12px] space-y-1">
              <p><strong>Contato &amp; DPO (Encarregado de Dados):</strong></p>
              <p>E-mail: <a href="mailto:contato@flmmkr.site" className="text-[#2997ff] hover:underline">contato@flmmkr.site</a></p>
              <p>Endereço: Rua Simões Magro, 127, São Paulo - SP, Brasil</p>
            </div>
          </section>

          {/* 2. Objeto */}
          <section className="space-y-2 border-t border-white/10 pt-4">
            <h3 className="text-[15px] font-semibold text-white">
              2. Objeto
            </h3>
            <p>
              A Plataforma oferece conteúdos educacionais, cursos, treinamentos e materiais digitais voltados ao desenvolvimento de profissionais do audiovisual, incluindo, mas não se limitando a, aulas em vídeo, materiais complementares, área de membros e funcionalidades relacionadas.
            </p>
          </section>

          {/* 3. Aceitação */}
          <section className="space-y-2 border-t border-white/10 pt-4">
            <h3 className="text-[15px] font-semibold text-white">
              3. Aceitação dos Termos
            </h3>
            <p>
              O uso da Plataforma e a conclusão de qualquer compra estão condicionados à aceitação integral destes Termos. Caso o usuário não concorde com qualquer disposição, deverá abster-se de utilizar a Plataforma e de realizar a compra.
            </p>
          </section>

          {/* 4. Cadastro */}
          <section className="space-y-2 border-t border-white/10 pt-4">
            <h3 className="text-[15px] font-semibold text-white">
              4. Cadastro, Conta e Área de Membros
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-white/75">
              <li><strong>4.1.</strong> Para acessar a área de membros, o usuário deverá criar uma conta fornecendo dados verídicos e atualizados.</li>
              <li><strong>4.2.</strong> O usuário é responsável pela confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.</li>
              <li><strong>4.3.</strong> A Plataforma utiliza mecanismo de sessão ativa única, podendo limitar o acesso simultâneo a partir de múltiplos dispositivos ou localizações, com a finalidade de prevenir o compartilhamento indevido de conta.</li>
              <li><strong>4.4.</strong> A Empresa poderá suspender ou cancelar contas em caso de indícios de fraude, compartilhamento não autorizado ou violação destes Termos.</li>
            </ul>
          </section>

          {/* 5. Pagamentos */}
          <section className="space-y-2 border-t border-white/10 pt-4">
            <h3 className="text-[15px] font-semibold text-white">
              5. Produtos, Pagamentos e Cancelamento
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-white/75">
              <li><strong>5.1.</strong> As condições comerciais (preço, forma de pagamento, prazos de acesso e eventuais descontos) são informadas no momento da compra.</li>
              <li><strong>5.2.</strong> Os pagamentos são processados por meio de parceiro especializado (Asaas), em conformidade com as normas de segurança da informação e PCI-DSS.</li>
              <li><strong>5.3.</strong> O usuário autoriza a coleta e o tratamento dos dados necessários à emissão de nota fiscal, cumprimento de obrigações fiscais e prevenção de fraudes.</li>
              <li><strong>5.4.</strong> O direito de arrependimento previsto no Código de Defesa do Consumidor (art. 49) aplica-se no prazo de até 7 (sete) dias corridos a contar da confirmação do pagamento com reembolso integral de 100% do valor pago.</li>
            </ul>
          </section>

          {/* 6. Propriedade Intelectual */}
          <section className="space-y-2 border-t border-white/10 pt-4">
            <h3 className="text-[15px] font-semibold text-white">
              6. Propriedade Intelectual
            </h3>
            <p>
              Todo o conteúdo disponibilizado na Plataforma (vídeos, textos, imagens, marcas, layout, códigos e demais materiais) é de titularidade da Empresa ou de terceiros licenciadores e está protegido pela legislação de direitos autorais e propriedade intelectual. É proibida a reprodução, distribuição, compartilhamento, gravação, download não autorizado ou qualquer uso comercial sem prévia autorização escrita.
            </p>
          </section>

          {/* 7. Condutas Proibidas */}
          <section className="space-y-2 border-t border-white/10 pt-4">
            <h3 className="text-[15px] font-semibold text-white">
              7. Condutas Proibidas
            </h3>
            <p>É vedado ao usuário:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/75">
              <li>a) Compartilhar credenciais de acesso;</li>
              <li>b) Utilizar ferramentas de gravação de tela, bots, scrapers ou qualquer meio automatizado para capturar conteúdo;</li>
              <li>c) Praticar atos que possam comprometer a segurança, integridade ou disponibilidade da Plataforma;</li>
              <li>d) Utilizar a Plataforma para fins ilícitos ou que violem direitos de terceiros.</li>
            </ul>
          </section>

          {/* 8. Privacidade e LGPD */}
          <section className="space-y-3 border-t border-white/10 pt-4">
            <h3 className="text-[15px] font-semibold text-white">
              8. Privacidade e Proteção de Dados Pessoais (LGPD)
            </h3>
            <p>
              A Empresa trata dados pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e demais normas aplicáveis.
            </p>

            <h4 className="text-[14px] font-semibold text-white/90">8.1. Dados Coletados</h4>
            <div className="space-y-2 text-white/75 pl-2 border-l border-white/10">
              <p><strong>a) Dados de navegação e telemetria (first-party):</strong> Identificador anônimo de visitante, Endereço IP, país, estado, cidade, latitude e longitude aproximadas, tipo de dispositivo, sistema operacional, navegador, resolução de tela, User-Agent, origem do tráfego (orgânico, pago, redes sociais, direto), página de entrada, referrer e parâmetros UTM.</p>
              <p><strong>b) Impressão digital de dispositivo (device fingerprint):</strong> Sinais técnicos do dispositivo (núcleos de processamento, memória aproximada, características gráficas, fuso horário e outros identificadores técnicos), utilizados exclusivamente para controle de validade de ofertas com tempo limitado, prevenção de fraudes e proteção de conteúdo.</p>
              <p><strong>c) Dados de compra e checkout:</strong> Nome completo, e-mail, CPF/CNPJ, telefone, data de nascimento, idade e profissão; Endereço completo para fins fiscais; Forma de pagamento, número de parcelas e últimos dígitos do cartão (quando aplicável). Os dados completos de cartão são transmitidos de forma criptografada diretamente ao processador de pagamentos (Asaas).</p>
              <p><strong>d) Dados da área de membros:</strong> E-mail, senha criptografada, foto de perfil, apelido público, histórico de aulas assistidas, comentários, curtidas e informações de sessão ativa.</p>
              <p><strong>e) Cookies e armazenamento local:</strong> Identificação do visitante, atribuição de tráfego, controle de sessão e segurança da Plataforma.</p>
              <p><strong>f) Ferramentas de terceiros:</strong> Google Analytics e Google Tag Manager (análise de uso); Microsoft Clarity (mapas de calor e gravações de comportamento anônimas); Asaas (processamento de pagamentos seguro).</p>
            </div>

            <h4 className="text-[14px] font-semibold text-white/90 pt-2">8.2. Finalidades e Bases Legais</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-white/[0.06] text-white">
                  <tr>
                    <th className="p-2.5 border-b border-white/10">Finalidade</th>
                    <th className="p-2.5 border-b border-white/10">Base Legal (LGPD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  <tr>
                    <td className="p-2.5">Execução do contrato e entrega do conteúdo</td>
                    <td className="p-2.5">Art. 7º, V (execução de contrato)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Cumprimento de obrigações fiscais e legais</td>
                    <td className="p-2.5">Art. 7º, II (obrigação legal)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Prevenção de fraudes e segurança da Plataforma</td>
                    <td className="p-2.5">Art. 7º, IX (legítimo interesse) e Art. 10</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Análise de desempenho, melhorias e marketing</td>
                    <td className="p-2.5">Art. 7º, I (consentimento) / Legítimo interesse</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Recuperação de carrinho abandonado</td>
                    <td className="p-2.5">Legítimo interesse / consentimento</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-[14px] font-semibold text-white/90 pt-2">8.3. Compartilhamento</h4>
            <p>
              Não vendemos dados pessoais. Compartilhamos estritamente com processadores de pagamento (Asaas), provedores de nuvem sob confidencialidade (Supabase, Vercel) e autoridades públicas sob obrigação judicial/fiscal.
            </p>

            <h4 className="text-[14px] font-semibold text-white/90 pt-2">8.4. Direitos do Titular</h4>
            <p>
              Você pode a qualquer momento solicitar confirmação, acesso, correção, anonimização ou exclusão de dados pessoais através do e-mail <strong>contato@flmmkr.site</strong>.
            </p>
          </section>

          {/* 9. Limitação de Responsabilidade */}
          <section className="space-y-2 border-t border-white/10 pt-4">
            <h3 className="text-[15px] font-semibold text-white">
              9. Limitação de Responsabilidade
            </h3>
            <p>
              A Plataforma é disponibilizada “no estado em que se encontra”. A Empresa não se responsabiliza por indisponibilidades temporárias de rede de terceiros ou pelo mau uso das credenciais pelo usuário.
            </p>
          </section>

          {/* 10. Alterações */}
          <section className="space-y-2 border-t border-white/10 pt-4">
            <h3 className="text-[15px] font-semibold text-white">
              10. Alterações destes Termos
            </h3>
            <p>
              Podemos atualizar estes Termos periodicamente. A versão vigente estará sempre disponível na Plataforma com data de atualização.
            </p>
          </section>

          {/* 11. Foro */}
          <section className="space-y-2 border-t border-white/10 pt-4">
            <h3 className="text-[15px] font-semibold text-white">
              11. Lei Aplicável e Foro
            </h3>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de <strong>São Paulo - SP</strong>, ressalvadas as hipóteses de competência do Código de Defesa do Consumidor.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-white/50 hidden sm:inline">
            Ao clicar em Concordar, você confirma a leitura dos termos.
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-[13px] font-medium transition-all cursor-pointer"
            >
              Fechar
            </button>
            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#0071e3]/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Li e Aceito os Termos</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

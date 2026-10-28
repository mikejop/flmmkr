'use client';

/** Consentimento (LGPD) para notificações e e-mail marketing. Começa desligado: a pessoa escolhe ligar. */
export default function MarketingConsent({ checked, onChange, id }: { checked: boolean; onChange: (value: boolean) => void; id: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#e5e5e7] bg-white p-4">
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-[26px] w-[44px] shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0071e3]/25 ${
          checked ? 'bg-[#30d158]' : 'bg-[#d2d2d7]'
        }`}
      >
        <span className={`inline-block h-[22px] w-[22px] rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[20px]' : 'translate-x-[2px]'}`} />
      </button>
      <label htmlFor={id} className="cursor-pointer text-[13px] leading-snug text-[#6e6e73]">
        <span className="block font-medium text-[#1d1d1f]">Quero receber novidades da FLMMKR</span>
        Notificações e e-mails sobre atualizações dos plugins, lançamentos e conteúdos. Você pode cancelar quando quiser.
      </label>
    </div>
  );
}

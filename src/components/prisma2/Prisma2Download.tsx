'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import Prisma2DownloadModal from '@/components/prisma2/Prisma2DownloadModal';

const STEPS = [
  {
    n: 1,
    title: 'Abra o app',
    text: 'Arraste o PRISMA 2 para a pasta Aplicativos e abra. O macOS mostra um aviso com os botões “Mover para o Lixo” e “Concluído”.',
    image: { src: '/prisma2/passo-1-aviso.png', alt: 'Aviso do macOS dizendo que o PRISMA 2.app não foi aberto, com os botões Move to Trash e Done', w: 522, h: 580 },
  },
  {
    n: 2,
    title: 'Clique em “Concluído”',
    text: 'Não clique em “Mover para o Lixo”. O app continua instalado e nada é apagado.',
  },
  {
    n: 3,
    title: 'Abra Ajustes do Sistema → Privacidade e Segurança',
    text: 'Role a página até a seção Segurança. O botão “Abrir Mesmo Assim” já está lá, junto da mensagem “PRISMA 2.app foi bloqueado para proteger seu Mac”.',
    image: { src: '/prisma2/passo-2-privacidade.jpg', alt: 'Ajustes do Sistema em Privacidade e Segurança, com o botão Open Anyway destacado', w: 1396, h: 516 },
  },
  {
    n: 4,
    title: 'Clique em “Abrir Mesmo Assim”',
    text: 'Confirme com sua senha ou Touch ID e, na janela seguinte, clique em “Abrir Mesmo Assim”.',
    image: { src: '/prisma2/passo-3-abrir.png', alt: 'Janela de confirmação do macOS com o botão Open Anyway destacado', w: 376, h: 505 },
  },
  {
    n: 5,
    title: 'Pronto',
    text: 'O app abre e passa a funcionar normalmente neste Mac. Você faz isso uma única vez.',
  },
];

export default function Prisma2Download() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="min-h-screen bg-white font-sans text-[#1d1d1f] antialiased selection:bg-[#0071e3]/20">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[980px] items-center justify-between px-6">
          <span className="text-[15px] font-semibold tracking-[0.18em]">FLMMKR</span>
          <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-[#0071e3] px-3.5 py-1 text-[12px] font-medium text-white transition hover:bg-[#0077ed]">
            Baixar
          </button>
        </div>
      </header>

      <main>
        <section className="px-6 pb-20 pt-16 text-center sm:pt-24">
          <Image src="/prisma2/prisma2-icon.png" alt="Ícone do PRISMA 2" width={128} height={128} priority className="mx-auto h-28 w-28 drop-shadow-xl sm:h-32 sm:w-32" />
          <p className="mt-8 text-[17px] font-semibold text-[#6e6e73] sm:text-[21px]">FLMMKR</p>
          <h1 className="mt-1 text-[56px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[96px]">PRISMA 2</h1>
          <p className="mt-3 text-[24px] font-medium leading-tight tracking-tight text-[#1d1d1f] sm:text-[32px]">Screen Capture for MacOS</p>
          <p className="mx-auto mt-5 max-w-xl text-[19px] leading-snug text-[#6e6e73]">Versão 2.0.0 em open beta.</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-9 inline-flex h-12 items-center rounded-full bg-[#0071e3] px-8 text-[17px] font-medium text-white transition hover:bg-[#0077ed] active:bg-[#006edb]"
          >
            Baixar para Mac
          </button>
          <p className="mt-4 text-[12px] text-[#86868b]">Requer macOS. Arquivo .dmg de cerca de 25 MB.</p>
        </section>

        <section className="bg-[#f5f5f7] px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-[980px]">
            <h2 className="mx-auto max-w-2xl text-center text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[48px]">Como instalar</h2>
            <p className="mx-auto mt-5 max-w-2xl text-center text-[19px] leading-snug text-[#6e6e73] sm:text-[21px]">
              O PRISMA 2 está na primeira fase do open beta e ainda não passou pela verificação da Apple. Por isso o macOS bloqueia a primeira abertura. É esperado, o app é seguro, e você libera uma única vez seguindo os passos abaixo.
            </p>

            <ol className="mt-14 space-y-6">
              {STEPS.map((s) => (
                <li key={s.n} className="overflow-hidden rounded-[28px] bg-white p-7 sm:p-10">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f] text-[15px] font-semibold text-white">{s.n}</span>
                    <div className="min-w-0">
                      <h3 className="text-[24px] font-semibold leading-tight tracking-tight sm:text-[28px]">{s.title}</h3>
                      <p className="mt-2 max-w-2xl text-[17px] leading-snug text-[#6e6e73]">{s.text}</p>
                    </div>
                  </div>
                  {s.image && (
                    <div className="mt-8 flex justify-center rounded-2xl bg-[#1d1d1f] p-4 sm:p-8">
                      <Image
                        src={s.image.src}
                        alt={s.image.alt}
                        width={s.image.w}
                        height={s.image.h}
                        sizes="(min-width: 980px) 640px, 90vw"
                        className="h-auto w-full max-w-[640px] rounded-xl"
                        style={{ maxWidth: Math.min(s.image.w, 640) }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-6 py-20 text-center sm:py-28">
          <h2 className="text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[48px]">Pronto para começar?</h2>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-8 inline-flex h-12 items-center rounded-full bg-[#0071e3] px-8 text-[17px] font-medium text-white transition hover:bg-[#0077ed] active:bg-[#006edb]"
          >
            Baixar para Mac
          </button>
        </section>
      </main>

      <footer className="border-t border-black/10 bg-[#f5f5f7] px-6 py-8">
        <div className="mx-auto flex max-w-[980px] flex-col gap-2 text-[12px] text-[#6e6e73] sm:flex-row sm:justify-between">
          <span>© 2026 FLMMKR. Todos os direitos reservados.</span>
          <span className="flex gap-4">
            <a href="/privacidade" className="hover:underline">Privacidade</a>
            <a href="/termos" className="hover:underline">Termos</a>
          </span>
        </div>
      </footer>

      {open && <Prisma2DownloadModal onClose={close} />}
    </div>
  );
}

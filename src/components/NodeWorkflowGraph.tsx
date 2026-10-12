'use client';

const workflowStages = [
  { number: '01', title: 'IDT', detail: 'Transformação de entrada' },
  { number: '02', title: 'Primárias', detail: 'Exposição e balanço' },
  { number: '03', title: 'Shot Matching', detail: 'Continuidade entre planos' },
  { number: '04', title: 'Secundárias', detail: 'Ajustes seletivos' },
  { number: '05', title: 'Creative Color', detail: 'Look e paleta' },
  { number: '06', title: 'ODT', detail: 'Transformação de saída' },
];

function Connection() {
  return (
    <div aria-hidden="true" className="flex min-w-8 flex-1 items-center">
      <div className="ml-[6px] mr-[8px] h-0.5 w-full bg-[#10b981]" />
    </div>
  );
}

export default function NodeWorkflowGraph() {
  return (
    <figure
      aria-label="Fluxo serial de color grading: IDT, Primárias, Shot Matching, Secundárias, Creative Color e ODT"
      className="my-8 overflow-hidden rounded-2xl border border-[#2b2b30] bg-[#141416] p-5 shadow-md sm:p-7"
    >
      <figcaption className="mb-6 flex items-center gap-2 border-b border-[#232328] pb-4 font-mono text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
        Node Graph · Fluxo de Trabalho
      </figcaption>

      <div className="overflow-x-auto pb-4 pt-2">
        <div className="flex min-w-[1020px] items-center gap-0 px-2 py-3">
          {workflowStages.map((stage, index) => (
            <div className="contents" key={stage.number}>
              <div className="relative w-[142px] shrink-0 rounded-xl border border-[#323238] bg-[#1e1e22] px-3 pb-3 pt-2 text-center shadow-md">
                <span
                  aria-label="Entrada RGB"
                  title="Entrada RGB"
                  className="absolute -left-2 top-1/2 -translate-y-1/2 border-y-[7px] border-y-transparent border-l-[8px] border-l-[#10b981]"
                />
                <div className="mb-2 flex items-center justify-between border-b border-[#28282e] pb-1.5">
                  <span className="font-mono text-xs font-bold tracking-wide text-amber-400/90">{stage.number}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                </div>
                <div className="flex h-12 flex-col items-center justify-center rounded-md border border-[#26262b] bg-[#161619] px-1">
                  <span className="font-sans text-xs font-semibold leading-tight text-white">{stage.title}</span>
                  <span className="mt-0.5 font-sans text-[10px] leading-tight text-[#9ca3af]">{stage.detail}</span>
                </div>
                <span
                  aria-label="Saída RGB"
                  title="Saída RGB"
                  className="absolute -right-[6px] top-1/2 h-3 w-3 -translate-y-1/2 border border-[#141416] bg-[#10b981]"
                />
              </div>
              {index < workflowStages.length - 1 && <Connection key={`connection-${stage.number}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#232328] pt-3 font-mono text-[11px] text-[#71717a]">
        <span className="flex items-center gap-2"><span className="border-y-[5px] border-y-transparent border-l-[6px] border-l-[#10b981]" />Conexão RGB: saída quadrada → entrada triangular</span>
      </div>
    </figure>
  );
}

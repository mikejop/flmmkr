import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FileText, Printer, Zap, X, Eye, Download, Check, Film, AlignLeft, Layers } from 'lucide-react';

const DEFAULT_AUDIO_SCRIPT = `[GANCHO - 0 a 10s]
Se você quer gravar vídeos pro YouTube que parecem cinema, pare agora de pesquisar por câmeras caras! 

[PROBLEMA - 10s a 30s]
O segredo que os grandes canais escondem não está no sensor da câmera de dez mil reais, mas na forma de guiar o olhar de quem assiste e na engenharia da iluminação. E a boa notícia é que você consegue fazer isso hoje usando apenas o celular que está no seu bolso.

[DESENVOLVIMENTO - 30s a 2min]
Hoje eu vou te revelar o exato passo a passo de três camadas de cenário, o triângulo de exposição para ter movimento natural e o segredo de exportação que força o algoritmo do YouTube a te dar o codec profissional.`;

const DEFAULT_VIDEO_SCRIPT = `[VÍDEO / B-ROLL]
Cena rápida: Close-up extremo de uma lente de cinema sendo colocada na câmera. Em seguida, corte brusco para tela preta com a pergunta em letras garrafais.

[VÍDEO / B-ROLL]
Apresentador aparece em plano médio, gesticulando com energia. No fundo, luzes de LED azul e rosa dão profundidade. Na mesa, há um smartphone comum posicionado em um tripé simples.

[VÍDEO / B-ROLL]
Insere B-Rolls dinâmicos mostrando o ajuste de luz principal (Key Light), alteração do Shutter Speed e a tela de renderização de exportação marcando 4K.`;

export default function AvEditorTeleprompter() {
  const [audioScript, setAudioScript] = useState(DEFAULT_AUDIO_SCRIPT);
  const [videoScript, setVideoScript] = useState(DEFAULT_VIDEO_SCRIPT);
  const [scriptTitle, setScriptTitle] = useState('O Segredo das Produções Cinematográficas no YouTube');
  const [isPrompterOpen, setIsPrompterOpen] = useState(false);
  const [isPdfMakerOpen, setIsPdfMakerOpen] = useState(false);
  
  // Modo de Exportação do PDFMaker ('full' | 'script_only' | 'storyboard_only')
  const [exportMode, setExportMode] = useState<'full' | 'script_only' | 'storyboard_only'>('full');

  // Teleprompter states
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  const [fontSize, setFontSize] = useState(32);

  const prompterRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Métrica de Leitura (Tempo Estimado)
  const totalWords = audioScript.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((totalWords / 150) * 60); // 150 palavras por minuto
  const minutes = Math.floor(estimatedSeconds / 60);
  const seconds = estimatedSeconds % 60;
  const durationText = `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;

  // Smooth scrolling loop para Teleprompter
  useEffect(() => {
    if (isPlaying && isPrompterOpen && prompterRef.current) {
      const scrollContainer = prompterRef.current;
      const scroll = () => {
        if (scrollContainer) {
          const step = scrollSpeed * 0.4;
          scrollContainer.scrollTop += step;
          
          if (scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
            setIsPlaying(false);
          } else {
            animationFrameRef.current = requestAnimationFrame(scroll);
          }
        }
      };
      animationFrameRef.current = requestAnimationFrame(scroll);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isPrompterOpen, scrollSpeed]);

  const handleResetPrompter = () => {
    setIsPlaying(false);
    if (prompterRef.current) {
      prompterRef.current.scrollTop = 0;
    }
  };

  const loadTemplate = () => {
    setAudioScript(DEFAULT_AUDIO_SCRIPT);
    setVideoScript(DEFAULT_VIDEO_SCRIPT);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // Pareamento de blocos de áudio e vídeo para o PDFMaker
  const audioBlocks = audioScript.split('\n\n').filter(Boolean);
  const videoBlocks = videoScript.split('\n\n').filter(Boolean);
  const maxRows = Math.max(audioBlocks.length, videoBlocks.length);

  return (
    <div className="space-y-6" id="av-editor-root">

      {/* Header do Roteirador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2" id="av-editor-title">
            <FileText className="w-5 h-5 text-[#0071e3]" />
            <span>Roteirador Audiovisual & PDFMaker</span>
          </h4>
          <p className="text-xs text-neutral-400">Escreva a voz e planeje a estética das tomadas de apoio (B-Roll) lado a lado.</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadTemplate}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Exemplo de Roteiro</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPdfMakerOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] py-2 px-4 rounded-xl transition-all cursor-pointer shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Exportar PDF / PDFMaker</span>
          </button>
        </div>
      </div>

      {/* Campo do Título do Roteiro */}
      <div className="bg-neutral-900/60 border border-neutral-800 p-3.5 rounded-2xl backdrop-blur-xl">
        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Título da Produção / Vídeo</label>
        <input
          type="text"
          value={scriptTitle}
          onChange={(e) => setScriptTitle(e.target.value)}
          placeholder="Ex: O Segredo das Produções Cinematográficas no YouTube"
          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:border-[#0071e3] focus:outline-none"
        />
      </div>

      {/* Editor de 2 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="av-editor-grid">
        {/* Coluna 1: Áudio / Voz */}
        <div className="flex flex-col space-y-2 p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md" id="audio-column">
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Coluna 1: Áudio (Fala / Apresentador)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">~{durationText} de Fala</span>
          </div>
          <textarea
            id="audio-script-input"
            value={audioScript}
            onChange={(e) => setAudioScript(e.target.value)}
            rows={10}
            className="w-full bg-transparent border-0 text-white placeholder-neutral-500 text-sm focus:ring-0 resize-none font-sans focus:outline-none leading-relaxed h-[260px] pr-2 overflow-y-auto"
            placeholder="Digite aqui o roteiro de voz, falas do apresentador e indicações verbais..."
          />
        </div>

        {/* Coluna 2: Vídeo / B-Roll */}
        <div className="flex flex-col space-y-2 p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md" id="video-column">
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Coluna 2: Vídeo (B-Roll & Grafismo)</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">{videoBlocks.length} Tomadas</span>
          </div>
          <textarea
            id="video-script-input"
            value={videoScript}
            onChange={(e) => setVideoScript(e.target.value)}
            rows={10}
            className="w-full bg-transparent border-0 text-white placeholder-neutral-500 text-sm focus:ring-0 resize-none font-sans focus:outline-none leading-relaxed h-[260px] pr-2 overflow-y-auto"
            placeholder="Planeje o que aparece na tela: cortes de câmera, imagens de apoio (B-Roll), zooms, textos na tela e slides..."
          />
        </div>
      </div>

      {/* Ações e Disparo do Teleprompter */}
      <div className="flex justify-between items-center border-t border-neutral-800/80 pt-4" id="av-editor-actions">
        <div className="text-xs text-neutral-400 font-mono">
          <span>Palavras totais: <strong>{totalWords}</strong></span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsPdfMakerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-all shadow-md text-xs cursor-pointer border border-neutral-700"
          >
            <Printer className="w-4 h-4 text-[#0071e3]" />
            <span>Exportar PDF / PDFMaker</span>
          </button>

          <button
            id="btn-trigger-prompter"
            onClick={() => {
              setIsPrompterOpen(true);
              setIsPlaying(false);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold transition-all shadow-lg text-xs md:text-sm cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Lançar Modo Teleprompter</span>
          </button>
        </div>
      </div>

      {/* MODAL PDFMAKER: SELEÇÃO E EXPORTAÇÃO DINÂMICA DE PDF */}
      {isPdfMakerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Header & Seletor de Formato no-print */}
            <div className="p-5 border-b border-neutral-800 space-y-4 bg-neutral-950 no-print">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Printer className="w-5 h-5 text-[#0071e3]" />
                  <h3 className="text-base font-bold text-white">PDFMaker — O que você deseja exportar?</h3>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handlePrintPdf}
                    className="px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar / Imprimir PDF</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setIsPdfMakerOpen(false)}
                    className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Botões Seletores dos 3 Modos de Exportação */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setExportMode('full')}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer border flex flex-col space-y-1 ${
                    exportMode === 'full' 
                      ? 'bg-[#0071e3]/10 border-[#0071e3] text-white ring-1 ring-[#0071e3]' 
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#0071e3]" />
                      <span>Roteiro + Storyboard</span>
                    </span>
                    {exportMode === 'full' && <Check className="w-4 h-4 text-[#0071e3]" />}
                  </div>
                  <span className="text-[10px] text-neutral-400">Exporta a tabela completa de 2 colunas com falas de voz e direção de cenas.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportMode('script_only')}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer border flex flex-col space-y-1 ${
                    exportMode === 'script_only' 
                      ? 'bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500' 
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <AlignLeft className="w-4 h-4 text-emerald-400" />
                      <span>Apenas Roteiro (Falas)</span>
                    </span>
                    {exportMode === 'script_only' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <span className="text-[10px] text-neutral-400">Exporta apenas o texto de voz do apresentador, sem imagens nem storyboard.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportMode('storyboard_only')}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer border flex flex-col space-y-1 ${
                    exportMode === 'storyboard_only' 
                      ? 'bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500' 
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-amber-400" />
                      <span>Apenas Storyboard</span>
                    </span>
                    {exportMode === 'storyboard_only' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-neutral-400">Exporta apenas as indicações visuais, cortes e B-Rolls, sem a fala do roteiro.</span>
                </button>
              </div>
            </div>

            {/* Área do PDF Formatada Dinamicamente */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-white text-neutral-900 space-y-6" id="pdf-printable-area">
              
              {/* Cabeçalho do Documento */}
              <div className="border-b-2 border-neutral-900 pb-4 flex justify-between items-end">
                <div>
                  <span className="text-xs font-mono font-black text-[#0071e3] uppercase tracking-widest block">
                    YOUTUBER PRO — {exportMode === 'script_only' ? 'ROTEIRO DE FALA DO APRESENTADOR' : exportMode === 'storyboard_only' ? 'DIREÇÃO DE CENA & STORYBOARD' : 'FICHA TÉCNICA DE PRODUÇÃO COMPLETA'}
                  </span>
                  <h1 className="text-2xl font-black text-neutral-900 mt-1">{scriptTitle}</h1>
                </div>
                <div className="text-right text-xs text-neutral-500 font-mono">
                  <div>Data: {new Date().toLocaleDateString('pt-BR')}</div>
                  {exportMode !== 'storyboard_only' && <div>Duração Est.: ~{durationText}</div>}
                </div>
              </div>

              {/* Tabela Formatada Dinamicamente baseada na seleção */}
              <div className="border border-neutral-300 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-900 text-white text-xs uppercase tracking-wider font-mono">
                      {(exportMode === 'full' || exportMode === 'script_only') && (
                        <th className={`p-3.5 ${exportMode === 'full' ? 'border-r border-neutral-800 w-1/2' : 'w-full'}`}>
                          1. ÁUDIO (Falas do Apresentador)
                        </th>
                      )}
                      {(exportMode === 'full' || exportMode === 'storyboard_only') && (
                        <th className={`p-3.5 ${exportMode === 'full' ? 'w-1/2' : 'w-full'}`}>
                          2. VÍDEO & STORYBOARD (Direção de Cenas & B-Rolls)
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-xs font-sans">
                    {Array.from({ length: maxRows }).map((_, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/80'}>
                        {/* Coluna 1: Áudio/Fala (se full ou script_only) */}
                        {(exportMode === 'full' || exportMode === 'script_only') && (
                          <td className={`p-4 align-top leading-relaxed text-neutral-800 ${exportMode === 'full' ? 'border-r border-neutral-200 w-1/2' : 'w-full'}`}>
                            {audioBlocks[idx] ? (
                              audioBlocks[idx].split('\n').map((line, lIdx) => (
                                <p key={lIdx} className={line.startsWith('[') ? 'font-bold text-[#0071e3] mt-2 first:mt-0 font-mono text-[11px]' : 'mt-1'}>
                                  {line}
                                </p>
                              ))
                            ) : (
                              <span className="text-neutral-300 italic">-</span>
                            )}
                          </td>
                        )}

                        {/* Coluna 2: Vídeo/Storyboard (se full ou storyboard_only) */}
                        {(exportMode === 'full' || exportMode === 'storyboard_only') && (
                          <td className={`p-4 align-top leading-relaxed text-neutral-700 ${exportMode === 'full' ? 'w-1/2' : 'w-full'}`}>
                            {videoBlocks[idx] ? (
                              videoBlocks[idx].split('\n').map((line, lIdx) => (
                                <p key={lIdx} className={line.startsWith('[') ? 'font-bold text-amber-600 mt-2 first:mt-0 font-mono text-[11px]' : 'mt-1'}>
                                  {line}
                                </p>
                              ))
                            ) : (
                              <span className="text-neutral-300 italic">-</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rodapé do PDF */}
              <div className="pt-4 border-t border-neutral-200 flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                <span>Gerado pelo PDFMaker ContentsPlace</span>
                <span>Página 1 de 1</span>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TELEPROMPTER FULLSCREEN MODAL */}
      {isPrompterOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 animate-fade-in" id="teleprompter-overlay">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-neutral-800" id="prompter-header">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold tracking-wider uppercase font-mono text-neutral-400">MODO TELEPROMPTER PRO</span>
            </div>
            <button
              id="btn-close-prompter"
              onClick={() => {
                setIsPrompterOpen(false);
                setIsPlaying(false);
              }}
              className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all text-xs border border-neutral-800 cursor-pointer"
            >
              Sair do Prompter
            </button>
          </div>

          {/* Central Scrolling Window */}
          <div className="flex-1 flex justify-center items-center relative my-4 overflow-hidden" id="prompter-scroller-outer">
            <div className="absolute left-0 right-0 h-16 pointer-events-none border-y border-red-500/30 bg-red-500/5 z-10 flex items-center justify-start pl-4" id="reading-guideline">
              <span className="text-[10px] font-mono text-red-500 tracking-widest uppercase">LINHA DE LEITURA</span>
            </div>

            <div
              id="prompter-scroller"
              ref={prompterRef}
              className="w-full max-w-3xl h-[400px] overflow-y-auto px-8 py-24 scroll-smooth text-center select-none"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div 
                className="text-neutral-300 font-medium leading-relaxed"
                style={{ fontSize: `${fontSize}px` }}
                id="prompter-text-body"
              >
                {audioScript.split('\n').map((line, i) => (
                  <p key={i} className={`mb-6 ${line.startsWith('[') ? 'text-amber-400 font-bold text-lg' : ''}`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto w-full" id="prompter-controls">
            <div className="flex items-center gap-3">
              <button
                id="btn-prompter-play"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pausar' : 'Iniciar'}</span>
              </button>
              <button
                id="btn-prompter-reset"
                onClick={handleResetPrompter}
                className="px-4 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full max-w-xs">
              <span className="text-xs font-mono text-neutral-400">Velocidade:</span>
              <input
                id="prompter-speed-slider"
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                className="flex-1 accent-amber-400 h-1 rounded-lg bg-neutral-800 cursor-pointer"
              />
              <span className="text-xs font-mono text-white w-6">{scrollSpeed}x</span>
            </div>

            <div className="flex items-center gap-3 w-full max-w-xs">
              <span className="text-xs font-mono text-neutral-400">Fonte:</span>
              <input
                id="prompter-font-slider"
                type="range"
                min="20"
                max="60"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 accent-white h-1 rounded-lg bg-neutral-800 cursor-pointer"
              />
              <span className="text-xs font-mono text-white w-10">{fontSize}px</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

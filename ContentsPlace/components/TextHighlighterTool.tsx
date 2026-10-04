import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HighlightItem } from '../types';
import { 
  fetchUserHighlights, 
  saveUserHighlight, 
  deleteUserHighlight, 
  updateUserHighlight 
} from '../lib/highlightsService';
import { Highlighter, Trash2, X, Check, FileText, Bookmark, FolderOpen, ZoomIn, ZoomOut, Type } from 'lucide-react';

interface TextHighlighterToolProps {
  lessonId: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const COLOR_CLASSES: Record<HighlightItem['color'], { bg: string; mark: string; border: string }> = {
  yellow: { bg: 'bg-amber-300', mark: 'bg-amber-200/90 text-neutral-900', border: 'border-amber-400' },
  blue: { bg: 'bg-sky-300', mark: 'bg-sky-200/90 text-neutral-900', border: 'border-sky-400' },
  green: { bg: 'bg-emerald-300', mark: 'bg-emerald-200/90 text-neutral-900', border: 'border-emerald-400' },
  pink: { bg: 'bg-pink-300', mark: 'bg-pink-200/90 text-neutral-900', border: 'border-pink-400' },
};

// Helper to check if a node is inside a forbidden element (headings h1-h6 or blockquote quotes)
const isForbiddenHighlightTarget = (node: Node | null): boolean => {
  let curr: HTMLElement | null = node instanceof HTMLElement ? node : node?.parentElement || null;
  while (curr && curr !== document.body) {
    const tagName = curr.tagName ? curr.tagName.toLowerCase() : '';
    if (/^h[1-6]$/.test(tagName) || tagName === 'blockquote') {
      return true;
    }
    curr = curr.parentElement;
  }
  return false;
};

// Helper to find closest section/chapter title from selected node
const findSectionTitle = (node: Node | null, container: HTMLElement | null): string => {
  let curr: HTMLElement | null = node instanceof HTMLElement ? node : node?.parentElement || null;
  
  while (curr && curr !== container && curr !== document.body) {
    // Check inside current section element
    const heading = curr.querySelector('h1, h2, h3');
    if (heading && heading.textContent) {
      return heading.textContent.trim().replace(/\s+/g, ' ');
    }

    // Check preceding siblings for closest header
    let prev = curr.previousElementSibling;
    while (prev) {
      if (prev.matches('h1, h2, h3') && prev.textContent) {
        return prev.textContent.trim().replace(/\s+/g, ' ');
      }
      const prevHead = prev.querySelector('h1, h2, h3');
      if (prevHead && prevHead.textContent) {
        return prevHead.textContent.trim().replace(/\s+/g, ' ');
      }
      prev = prev.previousElementSibling;
    }

    curr = curr.parentElement;
  }

  return 'Conteúdo Geral';
};

export const TextHighlighterTool: React.FC<TextHighlighterToolProps> = ({ lessonId, containerRef }) => {
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [selectionRange, setSelectionRange] = useState<{
    text: string;
    prefix: string;
    suffix: string;
    section_title: string;
    rect: DOMRect;
  } | null>(null);

  const [selectedColor, setSelectedColor] = useState<HighlightItem['color']>('yellow');
  const [noteText, setNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activeHighlightPopover, setActiveHighlightPopover] = useState<{
    highlight: HighlightItem;
    rect: DOMRect;
  } | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isZoomBarExpanded, setIsZoomBarExpanded] = useState(false);
  const zoomBarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearZoomBarAutoCloseTimer = () => {
    if (zoomBarTimeoutRef.current) {
      clearTimeout(zoomBarTimeoutRef.current);
      zoomBarTimeoutRef.current = null;
    }
  };

  const startZoomBarAutoCloseTimer = () => {
    clearZoomBarAutoCloseTimer();
    zoomBarTimeoutRef.current = setTimeout(() => {
      setIsZoomBarExpanded(false);
    }, 5000);
  };

  useEffect(() => {
    if (isZoomBarExpanded) {
      startZoomBarAutoCloseTimer();
    } else {
      clearZoomBarAutoCloseTimer();
    }
    return () => clearZoomBarAutoCloseTimer();
  }, [isZoomBarExpanded]);
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('youtuber_pro_a11y_prefs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fontScale) {
          const s = `${parsed.fontScale / 100}`;
          document.documentElement.style.setProperty('--lesson-zoom-scale', s);
          document.documentElement.style.setProperty('--lesson-font-scale', s);
          return parsed.fontScale;
        }
      }
    } catch (e) {}
    document.documentElement.style.setProperty('--lesson-zoom-scale', '1');
    document.documentElement.style.setProperty('--lesson-font-scale', '1');
    return 100;
  });

  // Sync zoom state if updated via AccessibilityWidget
  useEffect(() => {
    const handleZoomUpdate = (e: any) => {
      if (e.detail && typeof e.detail === 'number') {
        setZoomLevel(e.detail);
      }
    };
    window.addEventListener('youtuber_pro_zoom_update', handleZoomUpdate);
    return () => window.removeEventListener('youtuber_pro_zoom_update', handleZoomUpdate);
  }, []);

  const handleZoomChange = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.min(200, Math.max(50, prev + delta));
      const s = `${next / 100}`;
      document.documentElement.style.setProperty('--lesson-zoom-scale', s);
      document.documentElement.style.setProperty('--lesson-font-scale', s);
      try {
        const saved = localStorage.getItem('youtuber_pro_a11y_prefs');
        const prefs = saved ? JSON.parse(saved) : {};
        localStorage.setItem('youtuber_pro_a11y_prefs', JSON.stringify({ ...prefs, fontScale: next }));
      } catch (e) {}
      return next;
    });
  };

  const handleSetZoomLevel = (val: number) => {
    const next = Math.min(200, Math.max(50, val));
    setZoomLevel(next);
    const s = `${next / 100}`;
    document.documentElement.style.setProperty('--lesson-zoom-scale', s);
    document.documentElement.style.setProperty('--lesson-font-scale', s);
    try {
      const saved = localStorage.getItem('youtuber_pro_a11y_prefs');
      const prefs = saved ? JSON.parse(saved) : {};
      localStorage.setItem('youtuber_pro_a11y_prefs', JSON.stringify({ ...prefs, fontScale: next }));
    } catch (e) {}
  };

  const popupRef = useRef<HTMLDivElement>(null);
  const activePopoverRef = useRef<HTMLDivElement>(null);

  // Fetch highlights on mount & when lessonId changes
  const loadHighlights = useCallback(async () => {
    if (!lessonId) return;
    const data = await fetchUserHighlights(lessonId);
    setHighlights(data);
  }, [lessonId]);

  useEffect(() => {
    loadHighlights();
  }, [loadHighlights]);

  // Handle text selection in document
  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 2) return;

    // Check if selection is inside containerRef
    if (!containerRef.current || !containerRef.current.contains(selection.anchorNode)) {
      return;
    }

    try {
      const range = selection.getRangeAt(0);

      // Rejeita a seleção se o texto estiver dentro de um título (h1-h6) ou citação (blockquote)
      if (
        isForbiddenHighlightTarget(selection.anchorNode) ||
        isForbiddenHighlightTarget(selection.focusNode) ||
        isForbiddenHighlightTarget(range.commonAncestorContainer)
      ) {
        setSelectionRange(null);
        return;
      }

      const rect = range.getBoundingClientRect();

      // Extract section/chapter title
      const section_title = findSectionTitle(selection.anchorNode, containerRef.current);

      // Extract context prefix & suffix for robust matching
      const fullText = containerRef.current.textContent || '';
      const idx = fullText.indexOf(text);
      const prefix = idx > 15 ? fullText.substring(idx - 15, idx) : '';
      const suffix = idx >= 0 && idx + text.length + 15 <= fullText.length 
        ? fullText.substring(idx + text.length, idx + text.length + 15) 
        : '';

      setSelectionRange({ text, prefix, suffix, section_title, rect });
      setIsAddingNote(false);
      setNoteText('');
      setActiveHighlightPopover(null);
    } catch (e) {
      console.warn('Error getting selection range:', e);
    }
  }, [containerRef]);

  // Global mouseup event listener
  useEffect(() => {
    const onMouseUp = (e: MouseEvent) => {
      // Check if clicking inside active popups
      if (popupRef.current && popupRef.current.contains(e.target as Node)) return;
      if (activePopoverRef.current && activePopoverRef.current.contains(e.target as Node)) return;

      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          setSelectionRange(null);
        } else {
          handleSelection();
        }
      }, 20);
    };

    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, [handleSelection]);

  // Apply highlights into DOM
  useEffect(() => {
    if (!containerRef.current) return;
    const root = containerRef.current;

    // First remove any existing highlights to prevent duplication
    const existingMarks = root.querySelectorAll('mark[data-highlight-id]');
    existingMarks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });

    if (highlights.length === 0) return;

    // Walk text nodes and highlight matches
    highlights.forEach(item => {
      if (!item.text_content) return;

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      let currentNode: Node | null;

      while ((currentNode = walker.nextNode())) {
        if (isForbiddenHighlightTarget(currentNode)) continue;
        const text = currentNode.textContent || '';
        const matchIdx = text.indexOf(item.text_content);

        if (matchIdx !== -1 && currentNode.parentNode && currentNode.parentNode.nodeName !== 'MARK') {
          try {
            const range = document.createRange();
            range.setStart(currentNode, matchIdx);
            range.setEnd(currentNode, matchIdx + item.text_content.length);

            const mark = document.createElement('mark');
            const colorStyle = COLOR_CLASSES[item.color] || COLOR_CLASSES.yellow;
            mark.className = `${colorStyle.mark} px-1 rounded cursor-pointer transition-all hover:opacity-80 inline relative border-b-2 ${colorStyle.border}`;
            mark.setAttribute('data-highlight-id', item.id);
            if (item.note) {
              mark.setAttribute('title', `Nota: ${item.note}`);
            }

            // Click listener on highlight tag to open popover
            mark.onclick = (e) => {
              e.stopPropagation();
              const rect = mark.getBoundingClientRect();
              setActiveHighlightPopover({ highlight: item, rect });
              setSelectionRange(null);
            };

            range.surroundContents(mark);
            break;
          } catch (e) {
            // Ignore range boundary split exceptions
          }
        }
      }
    });
  }, [highlights, containerRef]);

  // Save new highlight
  const handleSaveHighlight = async () => {
    if (!selectionRange) return;

    const newItem = await saveUserHighlight({
      lesson_id: lessonId,
      section_title: selectionRange.section_title,
      text_content: selectionRange.text,
      prefix: selectionRange.prefix,
      suffix: selectionRange.suffix,
      color: selectedColor,
      note: noteText.trim()
    });

    if (newItem) {
      setHighlights(prev => [...prev.filter(h => h.id !== newItem.id), newItem]);
    }

    setSelectionRange(null);
    window.getSelection()?.removeAllRanges();
  };

  // Delete highlight
  const handleDeleteHighlight = async (id: string) => {
    await deleteUserHighlight(id, lessonId);
    setHighlights(prev => prev.filter(h => h.id !== id));
    setActiveHighlightPopover(null);
  };

  // Jump to highlight in article
  const handleJumpToHighlight = (id: string) => {
    if (!containerRef.current) return;
    const element = containerRef.current.querySelector(`mark[data-highlight-id="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-4', 'ring-blue-500/50');
      setTimeout(() => element.classList.remove('ring-4', 'ring-blue-500/50'), 2000);
    }
  };

  // Group highlights by section/chapter title
  const groupedHighlights = highlights.reduce((acc, h) => {
    const section = h.section_title || 'Conteúdo Geral';
    if (!acc[section]) acc[section] = [];
    acc[section].push(h);
    return acc;
  }, {} as Record<string, HighlightItem[]>);

  return (
    <>
      {/* Floating Toolbar for New Selection */}
      {selectionRange && (
        <div
          ref={popupRef}
          style={{
            top: `${Math.max(10, selectionRange.rect.top + window.scrollY - 55)}px`,
            left: `${Math.min(window.innerWidth - 300, Math.max(20, selectionRange.rect.left + window.scrollX + selectionRange.rect.width / 2 - 140))}px`,
          }}
          className="fixed z-50 bg-[#1c1c1e] text-white p-2.5 rounded-2xl shadow-2xl border border-neutral-700/80 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150 max-w-sm"
        >
          <div className="flex items-center gap-2">
            {/* Color selection buttons */}
            <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-xl">
              {(['yellow', 'blue', 'green', 'pink'] as HighlightItem['color'][]).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${COLOR_CLASSES[c].bg} ${
                    selectedColor === c ? 'scale-125 ring-2 ring-white shadow-sm' : 'hover:scale-110 opacity-80'
                  }`}
                  title={`Cor ${c}`}
                />
              ))}
            </div>

            {/* Note toggle */}
            <button
              type="button"
              onClick={() => setIsAddingNote(!isAddingNote)}
              className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                isAddingNote ? 'bg-blue-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              <FileText size={14} />
              Nota
            </button>

            {/* Submit highlight button */}
            <button
              type="button"
              onClick={handleSaveHighlight}
              className="bg-[#0071e3] hover:bg-[#147ce5] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center gap-1 ml-auto cursor-pointer"
            >
              <Check size={14} />
              Grifar
            </button>
          </div>

          {/* Optional inline note input */}
          {isAddingNote && (
            <div className="pt-1 border-t border-neutral-700/60 flex flex-col gap-1.5">
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Escreva sua anotação..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none h-16"
                autoFocus
              />
            </div>
          )}
        </div>
      )}

      {/* Popover when clicking an existing highlight */}
      {activeHighlightPopover && (
        <div
          ref={activePopoverRef}
          style={{
            top: `${Math.max(10, activeHighlightPopover.rect.top + window.scrollY - 60)}px`,
            left: `${Math.min(window.innerWidth - 300, Math.max(20, activeHighlightPopover.rect.left + window.scrollX + activeHighlightPopover.rect.width / 2 - 130))}px`,
          }}
          className="fixed z-50 bg-[#1c1c1e] text-white p-3 rounded-2xl shadow-2xl border border-neutral-700 max-w-xs flex flex-col gap-2 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between gap-2 border-b border-neutral-700/60 pb-2">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${COLOR_CLASSES[activeHighlightPopover.highlight.color].bg}`} />
              {activeHighlightPopover.highlight.section_title || 'Marcação'}
            </span>
            <button
              onClick={() => setActiveHighlightPopover(null)}
              className="text-neutral-400 hover:text-white p-0.5 rounded-full"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-xs italic text-neutral-300 line-clamp-2">
            "{activeHighlightPopover.highlight.text_content}"
          </p>

          {/* Note content */}
          {activeHighlightPopover.highlight.note ? (
            <div className="bg-neutral-900 p-2 rounded-xl text-xs text-neutral-200 border border-neutral-800">
              <span className="font-bold text-amber-400 block mb-0.5 text-[10px]">ANOTAÇÃO:</span>
              {activeHighlightPopover.highlight.note}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => handleDeleteHighlight(activeHighlightPopover.highlight.id)}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-rose-500/30 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 size={13} />
              Remover
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Controls: Google Docs Zoom Pill + Marcações */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-wrap items-center justify-end gap-3 max-w-[calc(100vw-2rem)]">
        {/* Floating Zoom & Reading Pill (Google Docs Style - Minimized / Expanded) */}
        {!isZoomBarExpanded ? (
          <div className="relative group">
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50 animate-fade-in">
              <span className="bg-[#1c1c1e] text-white text-[11px] font-medium px-3 py-1.5 rounded-xl border border-white/10 shadow-xl whitespace-nowrap">
                Clique para ajustar o zoom e tamanho de leitura
              </span>
              <span className="w-2 h-2 bg-[#1c1c1e] border-r border-b border-white/10 rotate-45 mr-4 -mt-1" />
            </div>

            {/* Minimized T Button */}
            <button
              onClick={() => setIsZoomBarExpanded(true)}
              className="bg-[#1c1c1e] hover:bg-neutral-800 text-white px-3.5 py-2 rounded-full shadow-2xl border border-neutral-700/80 font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Abrir Ajuste de Leitura & Zoom"
              title="Ajuste de Leitura & Zoom"
            >
              <Type size={16} className="text-[#0071e3]" />
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetZoomLevel(100);
                }}
                className="font-mono text-xs font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] px-2 py-0.5 rounded-full transition-all hover:scale-105 cursor-pointer"
                title="Clique para resetar o zoom para 100%"
              >
                {zoomLevel}%
              </span>
            </button>
          </div>
        ) : (
          /* Expanded Full Zoom Bar */
          <div 
            onMouseEnter={clearZoomBarAutoCloseTimer}
            onMouseLeave={() => {
              if (isZoomBarExpanded) startZoomBarAutoCloseTimer();
            }}
            className="bg-[#1c1c1e]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-full border border-neutral-700/80 shadow-2xl flex items-center gap-3 select-none animate-fade-in"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsZoomBarExpanded(false)}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                title="Minimizar barra de zoom"
              >
                <span className="hidden sm:inline text-[10px] font-bold tracking-wider uppercase text-neutral-300">
                  AJUSTE DE LEITURA & ZOOM
                </span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetZoomLevel(100);
                }}
                className="text-xs px-2.5 py-0.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full font-mono font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                title="Clique para resetar o zoom para 100%"
                aria-label="Resetar zoom para 100%"
              >
                {zoomLevel}%
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleZoomChange(-5)}
                disabled={zoomLevel <= 50}
                className="p-1 rounded-full hover:bg-white/10 text-neutral-300 disabled:opacity-40 transition-colors cursor-pointer"
                title="Diminuir Zoom (50% min)"
                aria-label="Diminuir Zoom"
              >
                <ZoomOut size={15} />
              </button>

              <input
                type="range"
                min={50}
                max={200}
                step={5}
                value={zoomLevel}
                onChange={(e) => handleSetZoomLevel(Number(e.target.value))}
                className="w-24 sm:w-36 accent-[#0071e3] cursor-pointer h-1.5 bg-neutral-700 rounded-lg appearance-none"
                aria-label="Controle de Zoom da Página"
              />

              <button
                onClick={() => handleZoomChange(5)}
                disabled={zoomLevel >= 200}
                className="p-1 rounded-full hover:bg-white/10 text-neutral-300 disabled:opacity-40 transition-colors cursor-pointer"
                title="Aumentar Zoom (200% max)"
                aria-label="Aumentar Zoom"
              >
                <ZoomIn size={15} />
              </button>
            </div>

            <button
              onClick={() => setIsZoomBarExpanded(false)}
              className="p-1 text-neutral-400 hover:text-white rounded-full transition-colors ml-1 cursor-pointer"
              title="Minimizar"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Marcações Button */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="bg-[#1c1c1e] hover:bg-neutral-800 text-white px-4 py-2.5 rounded-full shadow-2xl border border-neutral-700/80 font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Bookmark size={15} className="text-amber-400" />
          Marcações ({highlights.length})
        </button>
      </div>

      {/* Highlights Drawer / Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-[#1c1c1e] text-white w-full max-w-md h-full shadow-2xl border-l border-neutral-800 p-6 flex flex-col gap-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                <Bookmark size={18} className="text-amber-400" />
                Minhas Marcações
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {highlights.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-400 gap-3">
                <Bookmark size={36} className="text-neutral-600" />
                <p className="text-sm">Você ainda não fez marcações nesta aula.</p>
                <p className="text-xs text-neutral-500">Selecione qualquer texto para grifar ou adicionar anotações personalizadas.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
                {(Object.entries(groupedHighlights) as [string, HighlightItem[]][]).map(([sectionTitle, items]) => (
                  <div key={sectionTitle} className="space-y-3">
                    {/* Chapter / Section Header Badge */}
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0071e3] bg-[#0071e3]/10 border border-[#0071e3]/30 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                      <FolderOpen size={14} />
                      <span className="truncate">{sectionTitle}</span>
                    </div>

                    {/* Highlights inside this chapter */}
                    <div className="space-y-3 pl-1">
                      {items.map(h => (
                        <div
                          key={h.id}
                          onClick={() => {
                            handleJumpToHighlight(h.id);
                            setIsDrawerOpen(false);
                          }}
                          className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-4 rounded-2xl space-y-2 cursor-pointer transition-all hover:bg-neutral-800/80 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`w-3 h-3 rounded-full ${COLOR_CLASSES[h.color].bg}`} />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHighlight(h.id);
                              }}
                              className="text-neutral-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Deletar marcação"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <p className="text-xs font-serif text-neutral-200 line-clamp-3 leading-relaxed italic">
                            "{h.text_content}"
                          </p>

                          {h.note && (
                            <div className="bg-neutral-800/90 p-2.5 rounded-xl border border-neutral-700/60 text-xs text-neutral-300">
                              <span className="font-bold text-amber-400 block mb-0.5 text-[10px]">ANOTAÇÃO:</span>
                              {h.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

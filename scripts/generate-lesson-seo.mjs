/**
 * Gera um RASCUNHO de src/data/lessonSeo.ts (prévias públicas das aulas para buscadores/IAs).
 *
 * Regra de ouro: cada tópico público tem UM parágrafo de abertura. Passos, dicas, imagens e
 * vídeo nunca entram aqui. O arquivo gerado deve ser REVISADO por Michael antes do deploy.
 *
 * Uso:  node scripts/generate-lesson-seo.mjs           (não sobrescreve se o arquivo existir)
 *       node scripts/generate-lesson-seo.mjs --force   (sobrescreve)
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const outFile = path.join(root, 'src/data/lessonSeo.ts');
if (fs.existsSync(outFile) && !process.argv.includes('--force')) {
  console.error('src/data/lessonSeo.ts já existe (pode ter edições manuais). Use --force para sobrescrever.');
  process.exit(1);
}

// 1) Carrega modulesData (transpila o TS e executa em memória).
const dataSrc = fs.readFileSync(path.join(root, 'src/data/data.ts'), 'utf8');
const js = ts.transpileModule(dataSrc, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
new Function('exports', 'module', 'require', js)(mod.exports, mod, () => ({}));
const modulesData = mod.exports.modulesData;

const MAX_OPENING = 320;

const slugify = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const stripModulePrefix = (t) => t.replace(/^M[ÓO]DULO\s+\d+\s*[:\-–—]?\s*/i, '').trim();

const PROPER = { davinci: 'DaVinci', aces: 'ACES', cst: 'CST', hdr: 'HDR', rgb: 'RGB', lut: 'LUT', yrgb: 'YRGB', log: 'Log', lut_: 'LUT' };
const sentenceCase = (t) => {
  const lower = t.toLocaleLowerCase('pt-BR');
  const cased = lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
  return cased.replace(/\b[\p{L}]+\b/gu, (w) => PROPER[w.toLowerCase()] || w);
};

/** Corta no fim de uma frase, no máximo MAX_OPENING caracteres. */
function clip(text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= MAX_OPENING) return clean;
  const cut = clean.slice(0, MAX_OPENING);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  if (lastStop > 120) return cut.slice(0, lastStop + 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:]$/, '') + '…';
}

const firstParagraph = (text) => clip((text || '').split(/\n\s*\n/)[0]);

/** Extrai {heading, opening} das <EditorialSection> de um artigo TSX (só título + 1º <p>). */
function topicsFromArticle(file) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  const parts = src.split('<EditorialSection').slice(1);
  const topics = [];
  for (const part of parts) {
    const title = /title="([^"]+)"/.exec(part)?.[1];
    const p = /<p[^>]*>([\s\S]*?)<\/p>/.exec(part)?.[1];
    if (!title || !p) continue;
    const text = p.replace(/\{[^}]*\}/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
    if (text.replace(/\s+/g, ' ').trim().length < 60) continue;
    topics.push({ heading: sentenceCase(title), opening: clip(text) });
  }
  return topics;
}

const ARTICLES = {
  'mod1-1': 'src/components/IntroducaoDaVinciArticle.tsx',
  'mod1-analise-tecnica': 'src/components/AnaliseTecnicaArticle.tsx',
};

const lessons = [];
for (const m of modulesData) {
  const moduleTitle = stripModulePrefix(m.title);
  for (const sub of m.subtopics) {
    const title = sub.title.replace(/^\d+\.\s*/, '');
    let topics = [];
    if (ARTICLES[sub.id]) topics = topicsFromArticle(ARTICLES[sub.id]);
    if (topics.length === 0 && sub.subtabs?.length) {
      topics = sub.subtabs.map((t) => ({ heading: t.label, opening: firstParagraph(t.concept) }));
    }
    if (topics.length === 0) topics = [{ heading: 'Visão geral', opening: firstParagraph(sub.concept) }];

    lessons.push({
      id: sub.id,
      moduleSlug: slugify(moduleTitle),
      moduleTitle,
      slug: slugify(title),
      title,
      metaDescription: clip(sub.concept.split(/\n\s*\n/)[0]).slice(0, 155).replace(/\s+\S*$/, '') + (sub.concept.length > 155 ? '…' : ''),
      learningOutcomes: [],
      topics: topics.map((t, i) => ({ id: `${slugify(t.heading) || 'topico'}-${i + 1}`, ...t })),
    });
  }
}

const header = `/**
 * Prévias PÚBLICAS das aulas (lidas por Google, Bing, DuckDuckGo e IAs de busca).
 *
 * REGRAS:
 *  - Cada tópico tem UM parágrafo de abertura (\`opening\`, até ~320 caracteres).
 *  - Nunca colocar passos, dicas, imagens ou vídeo da aula aqui.
 *  - Este arquivo NÃO pode importar src/data/data.ts nem os artigos (vazaria o texto completo no JS público).
 *  - Gerado como rascunho por scripts/generate-lesson-seo.mjs: REVISAR cada parágrafo antes do deploy.
 */
export interface LessonSeoTopic {
  id: string;
  heading: string;
  opening: string;
}

export interface LessonSeo {
  id: string;
  moduleSlug: string;
  moduleTitle: string;
  slug: string;
  title: string;
  metaDescription: string;
  learningOutcomes: string[];
  topics: LessonSeoTopic[];
}

/**
 * Interruptor de publicação. Enquanto for false, /aulas e /aulas/** respondem 404 e saem do
 * sitemap/IndexNow. Mude para true SÓ depois de revisar cada parágrafo abaixo.
 */
export const LESSON_SEO_PUBLISHED = false;

/** Data da última revisão do conteúdo público (usada no sitemap). */
export const LESSON_SEO_UPDATED_AT = '${new Date().toISOString().slice(0, 10)}';

export const LESSON_SEO: LessonSeo[] = `;

fs.writeFileSync(outFile, header + JSON.stringify(lessons, null, 2) + ';\n');
console.log(`Gerado: ${lessons.length} aulas, ${lessons.reduce((n, l) => n + l.topics.length, 0)} tópicos -> src/data/lessonSeo.ts`);

import { supabase } from './supabase';
import {
  COMPLETE_RATIO, emptyProgress, mergeProgress, mergeRanges, resumePosition, sanitizeProgress, sumRanges,
  type Range, type VideoProgress,
} from './videoProgressCore';

/**
 * Rastreia o que o aluno faz no player (Panda) e guarda primeiro no aparelho.
 *
 * Regras para gravar no banco gastando pouco:
 *  1. Tudo acontece em memória/localStorage; o banco só recebe um RESUMO (não cada timeupdate).
 *  2. No máximo 1 requisição a cada SYNC_MIN_GAP_MS, e só se algo mudou de verdade.
 *  3. Disparos: pausa (com atraso), batida a cada HEARTBEAT_MS enquanto assiste, fim do vídeo,
 *     troca de vídeo, aba escondida/fechada e volta da conexão.
 *  4. Um envio leva todos os vídeos pendentes juntos; a API faz um único upsert.
 *  5. Se falhar, o registro continua pendente e vai no próximo disparo (a mesclagem é idempotente).
 */

const SYNC_MIN_GAP_MS = 30_000;
const HEARTBEAT_MS = 120_000;
const LOCAL_SAVE_MS = 4_000;
const MIN_POSITION_DELTA = 5; // só conta como mudança de posição se andou ≥ 5 s desde o último envio
const API = '/api/user/video-progress';
const lsKey = (userId: string) => `cm_vp:v1:${userId}`;

type Msg = { message?: string; currentTime?: number; duration?: number; speed?: number; video?: string };

interface Live {
  playing: boolean;
  lastT: number | null;       // último tempo contínuo observado
  open: Range | null;         // trecho que está sendo assistido agora
}

export class VideoProgressTracker {
  private userId: string;
  private store = new Map<string, VideoProgress>();
  private dirty = new Set<string>();
  private synced = new Map<string, number>(); // posição no último envio bem-sucedido
  private live = new Map<string, Live>();
  private lastSyncAt = 0;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private inFlight = false;
  private readonly onHide = () => { if (document.visibilityState === 'hidden') this.flush(true); };
  private readonly onPageHide = () => this.flush(true);
  private readonly onOnline = () => this.flush(false);

  constructor(userId: string | null) {
    this.userId = userId || 'anon';
    this.readLocal();
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.onHide);
      window.addEventListener('pagehide', this.onPageHide);
      window.addEventListener('online', this.onOnline);
      this.heartbeat = setInterval(() => { if (this.anyPlaying()) this.flush(false); }, HEARTBEAT_MS);
    }
  }

  get canSync() { return this.userId !== 'anon'; }

  dispose() {
    this.flush(true);
    if (this.syncTimer) clearTimeout(this.syncTimer);
    if (this.saveTimer) clearTimeout(this.saveTimer);
    if (this.heartbeat) clearInterval(this.heartbeat);
    document.removeEventListener('visibilitychange', this.onHide);
    window.removeEventListener('pagehide', this.onPageHide);
    window.removeEventListener('online', this.onOnline);
  }

  /** Busca o progresso do aluno no banco (1 requisição por aula) e junta com o do aparelho. */
  async loadRemote(videoIds: string[]) {
    if (!this.canSync || !videoIds.length) return;
    try {
      const res = await fetch(`${API}?videos=${encodeURIComponent(videoIds.join(','))}`, { credentials: 'same-origin' });
      if (!res.ok) return;
      const body = (await res.json()) as { items?: unknown[] };
      for (const raw of body.items || []) {
        const remote = sanitizeProgress(raw);
        if (!remote) continue;
        const merged = mergeProgress(this.store.get(remote.videoId), remote);
        this.store.set(remote.videoId, merged);
        this.synced.set(remote.videoId, remote.position);
        // O que existe só no aparelho (jogado offline antes) continua pendente.
        if (merged.position !== remote.position || sumRanges(merged.ranges) > sumRanges(remote.ranges)) this.dirty.add(remote.videoId);
      }
      this.saveLocal();
    } catch { /* sem rede: segue com o que está no aparelho */ }
  }

  getResume(videoId: string, duration?: number) {
    return resumePosition(this.store.get(videoId), duration);
  }

  getProgress(videoId: string) { return this.store.get(videoId); }

  /** Entrada única: mensagens do iframe do Panda. */
  handle(videoId: string, lessonId: string, msg: Msg, durationHint?: number) {
    const type = msg.message;
    if (!type || !type.startsWith('panda_')) return;
    const rec = this.store.get(videoId) || emptyProgress(videoId, lessonId);
    const live = this.live.get(videoId) || { playing: false, lastT: null, open: null };
    const t = typeof msg.currentTime === 'number' && Number.isFinite(msg.currentTime) ? msg.currentTime : null;
    const dur = (typeof msg.duration === 'number' && msg.duration > 0 ? msg.duration : 0) || durationHint || rec.duration;
    if (dur && dur !== rec.duration) rec.duration = dur;
    let flushNow: 'none' | 'soon' | 'force' = 'none';

    switch (type) {
      case 'panda_ready':
        rec.stats.sessions += 1;
        this.dirty.add(videoId);
        break;
      case 'panda_play':
        rec.stats.plays += 1;
        live.playing = true;
        if (t !== null) live.lastT = t;
        this.dirty.add(videoId);
        break;
      case 'panda_timeupdate':
        if (t === null) break;
        if (live.playing) {
          const gap = live.lastT === null ? null : t - live.lastT;
          const speed = rec.stats.speed || 1;
          if (gap !== null && gap >= 0 && gap <= 2.5 * speed && live.open) {
            live.open[1] = t;
            rec.stats.watchSecs += gap / speed;
          } else {
            this.commitOpen(rec, live);
            live.open = [t, t];
          }
          live.lastT = t;
        }
        rec.position = t;
        rec.maxPosition = Math.max(rec.maxPosition, t);
        if (!rec.completed && rec.duration && this.watchedRatio(rec, live) >= COMPLETE_RATIO) { rec.completed = true; this.dirty.add(videoId); flushNow = 'soon'; }
        if (Math.abs(t - (this.synced.get(videoId) ?? 0)) >= MIN_POSITION_DELTA) this.dirty.add(videoId);
        break;
      case 'panda_pause':
        rec.stats.pauses += 1;
        live.playing = false;
        this.commitOpen(rec, live);
        if (t !== null) rec.position = t;
        this.dirty.add(videoId);
        flushNow = 'soon';
        break;
      case 'panda_seeking':
        this.commitOpen(rec, live);
        live.lastT = null;
        rec.stats.seeks += 1;
        this.dirty.add(videoId);
        break;
      case 'panda_seeked':
        if (t !== null) { live.lastT = t; rec.position = t; rec.maxPosition = Math.max(rec.maxPosition, t); }
        live.open = t !== null && live.playing ? [t, t] : null;
        break;
      case 'panda_ended':
        live.playing = false;
        if (rec.duration) live.lastT = rec.duration;
        this.commitOpen(rec, live, rec.duration || undefined);
        rec.completed = true;
        rec.position = rec.duration || (t ?? rec.position);
        rec.maxPosition = Math.max(rec.maxPosition, rec.position);
        this.dirty.add(videoId);
        flushNow = 'force';
        break;
      case 'panda_enterfullscreen':
        rec.stats.fullscreen += 1; this.dirty.add(videoId); break;
      case 'panda_captionsenabled':
      case 'panda_captionsdisabled':
        rec.stats.captions += 1; this.dirty.add(videoId); break;
      case 'panda_speed_update': {
        const s = Number(msg.speed);
        if (Number.isFinite(s) && s > 0) { rec.stats.speed = s; this.dirty.add(videoId); }
        break;
      }
      default:
        return;
    }

    rec.updatedAt = Date.now();
    this.store.set(videoId, rec);
    this.live.set(videoId, live);
    this.scheduleLocalSave();
    if (flushNow === 'force') this.flush(true);
    else if (flushNow === 'soon') this.flush(false);
  }

  /** Fecha o trecho aberto de todos os vídeos e envia o que estiver pendente. */
  flush(force: boolean) {
    for (const [id, live] of this.live) {
      const rec = this.store.get(id);
      if (rec && live.open) { this.commitOpen(rec, live); this.dirty.add(id); }
    }
    this.saveLocal();
    if (!this.canSync || !this.dirty.size) return;

    const wait = this.lastSyncAt + SYNC_MIN_GAP_MS - Date.now();
    if (!force && wait > 0) {
      // Dentro da janela mínima: um único envio agendado para o fim dela (junta tudo que vier até lá).
      if (!this.syncTimer) this.syncTimer = setTimeout(() => { this.syncTimer = null; this.flush(false); }, wait);
      return;
    }
    if (this.inFlight && !force) return;
    void this.send(force);
  }

  private async send(keepalive: boolean) {
    const ids = [...this.dirty];
    const items = ids.map((id) => this.store.get(id)).filter((p): p is VideoProgress => !!p);
    if (!items.length) { this.dirty.clear(); return; }
    this.inFlight = true;
    this.lastSyncAt = Date.now();
    try {
      const res = await fetch(API, {
        method: 'POST', credentials: 'same-origin', keepalive,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error(String(res.status));
      for (const p of items) {
        this.synced.set(p.videoId, p.position);
        // Só limpa se nada novo chegou durante o envio.
        if (this.store.get(p.videoId)?.updatedAt === p.updatedAt) this.dirty.delete(p.videoId);
      }
    } catch {
      /* continua pendente; tenta no próximo disparo (a janela mínima evita tempestade de retentativas) */
    } finally {
      this.inFlight = false;
    }
  }

  private commitOpen(rec: VideoProgress, live: Live, endAt?: number) {
    if (live.open) {
      const [s, e] = live.open;
      const end = endAt ?? e;
      if (end > s) rec.ranges = mergeRanges([...rec.ranges, [s, end]]);
      live.open = null;
    }
  }

  private watchedRatio(rec: VideoProgress, live: Live) {
    const extra = live.open ? live.open[1] - live.open[0] : 0;
    return rec.duration ? (sumRanges(rec.ranges) + extra) / rec.duration : 0;
  }

  private anyPlaying() { for (const l of this.live.values()) if (l.playing) return true; return false; }

  private readLocal() {
    if (typeof window === 'undefined') return;
    try {
      const raw = JSON.parse(localStorage.getItem(lsKey(this.userId)) || 'null') as { items?: unknown[]; dirty?: string[] } | null;
      for (const item of raw?.items || []) {
        const p = sanitizeProgress(item);
        if (p) this.store.set(p.videoId, p);
      }
      (raw?.dirty || []).forEach((id) => { if (this.store.has(id)) this.dirty.add(id); });
    } catch { /* storage bloqueado ou corrompido: começa vazio */ }
  }

  private scheduleLocalSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => { this.saveTimer = null; this.saveLocal(); }, LOCAL_SAVE_MS);
  }

  private saveLocal() {
    try {
      localStorage.setItem(lsKey(this.userId), JSON.stringify({ items: [...this.store.values()], dirty: [...this.dirty] }));
    } catch { /* cheio ou bloqueado */ }
  }
}

/** Id do aluno logado (ou null). */
export async function currentUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch { return null; }
}

/**
 * Proof links get pasted straight from wherever the recording lives, so this
 * works out how to render whatever form of URL comes back: a YouTube watch
 * page, a youtu.be shortener, a Short, a Vimeo or Loom share link, a Google
 * Drive file view, or a plain file sitting on a CDN.
 */

export type MediaProvider = 'youtube' | 'vimeo' | 'loom' | 'drive' | 'file' | 'unknown';

export type ResolvedMedia =
  /** No link supplied yet — callers fall back to the designed placeholder. */
  | { mode: 'empty' }
  /** Playable inside an <iframe>. */
  | { mode: 'embed'; provider: MediaProvider; src: string; poster?: string }
  /** A real media file we can hand straight to <video> or <img>. */
  | { mode: 'video'; provider: 'file'; src: string }
  | { mode: 'image'; provider: 'file'; src: string }
  /** Recognisably media, but not embeddable — offer it as a link out instead. */
  | { mode: 'external'; provider: MediaProvider; src: string };

const YOUTUBE =
  /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{6,})/i;
const VIMEO = /vimeo\.com\/(?:video\/)?(\d+)/i;
const LOOM = /loom\.com\/(?:share|embed)\/([\w-]+)/i;
const DRIVE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([\w-]+)/i;

const VIDEO_FILE = /\.(mp4|webm|ogv|ogg|mov|m4v)(?:[?#]|$)/i;
const IMAGE_FILE = /\.(png|jpe?g|gif|webp|avif|svg)(?:[?#]|$)/i;

/**
 * @param kind What the data claims the link points at. Only consulted when the
 *   URL itself gives nothing away — plenty of image hosts serve extensionless
 *   URLs, and guessing wrong there costs us a broken frame.
 */
export function resolveMedia(url: string, kind: 'video' | 'image'): ResolvedMedia {
  const raw = url?.trim();
  if (!raw) return { mode: 'empty' };

  const youtube = raw.match(YOUTUBE);
  if (youtube) {
    const id = youtube[1];
    return {
      mode: 'embed',
      provider: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white`,
      poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  const vimeo = raw.match(VIMEO);
  if (vimeo) {
    return {
      mode: 'embed',
      provider: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`,
    };
  }

  const loom = raw.match(LOOM);
  if (loom) {
    return {
      mode: 'embed',
      provider: 'loom',
      src: `https://www.loom.com/embed/${loom[1]}?autoplay=1&hideEmbedTopBar=true`,
    };
  }

  const drive = raw.match(DRIVE);
  if (drive) {
    // Drive refuses to autoplay from /preview, but it is the only form that
    // renders inline rather than bouncing to the Drive UI.
    return { mode: 'embed', provider: 'drive', src: `https://drive.google.com/file/d/${drive[1]}/preview` };
  }

  if (IMAGE_FILE.test(raw)) return { mode: 'image', provider: 'file', src: raw };
  if (VIDEO_FILE.test(raw)) return { mode: 'video', provider: 'file', src: raw };

  if (kind === 'image') return { mode: 'image', provider: 'file', src: raw };
  return { mode: 'external', provider: 'unknown', src: raw };
}

/** Bare host for link chips — "https://www.kenafiber.com/" reads as "kenafiber.com". */
export function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
  }
}

import type { StageMeta, Viewport } from './types';

/**
 * Phone choreography. Kept in one place because several layers have to agree
 * on it to the pixel: the top edge of a stage panel is the edge Ebbi peeks
 * over, and the room above her head at home is where her speech bubble sits.
 */

/** Artwork aspect (408 × 612). */
export const ART_RATIO = 408 / 612;

/** Clear of the header row. */
const HEADER_CLEARANCE = 64;
/** Clear of the merged section control at the bottom of the screen. */
const FOOTER_CLEARANCE = 70;
/** Room kept above her head on the home stage for the speech bubble. */
export const PHONE_BUBBLE_ROOM = 88;

/** Slice of the artwork that shows above a panel: crown to just under the chin. */
const PEEK_FROM = 0.03;
const PEEK_TO = 0.47;
/** Half the width of her hair, as a fraction of the artwork width. */
const HAIR_HALF_WIDTH = 0.36;

function peekHeight(v: Viewport) {
  return Math.round(Math.max(88, Math.min(124, v.height * 0.14)));
}

export function phonePanelInsets(v: Viewport) {
  return {
    top: v.safeTop + HEADER_CLEARANCE + peekHeight(v),
    bottom: v.safeBottom + FOOTER_CLEARANCE,
  };
}

/** Home: she stands on the section control, under the headline and her bubble. */
export function phoneHome(v: Viewport, heroBottom: number) {
  const top = (heroBottom || v.safeTop + 320) + PHONE_BUBBLE_ROOM;
  const floor = v.height - v.safeBottom - 62;
  const figureH = Math.max(v.height * 0.34, Math.min(420, floor - top));
  return { figureH, baseY: floor - figureH / 2 };
}

/** Which corner she peeks from: opposite the side the panel takes on desktop. */
export function phonePeekSide(meta: StageMeta): 1 | -1 {
  return meta.side === 'left' ? 1 : -1;
}

/** Inner stages: her head and shoulders showing above the panel's top edge. */
export function phonePeek(v: Viewport, side: 1 | -1) {
  const panelTop = phonePanelInsets(v).top;
  const figureH = peekHeight(v) / (PEEK_TO - PEEK_FROM);
  const figureW = figureH * ART_RATIO;
  const inset = 10 + figureW * HAIR_HALF_WIDTH;
  return {
    panelTop,
    figureH,
    cx: side === 1 ? v.width - inset : inset,
    cy: panelTop - PEEK_TO * figureH + figureH / 2,
    /** Horizontal reach of her hair from the centre line, for neighbours to clear. */
    halfWidth: figureW * HAIR_HALF_WIDTH,
  };
}

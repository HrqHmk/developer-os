import type { CSSProperties } from 'react'

/**
 * Hero puzzle pieces (Issue #72) — a reversible visual experiment.
 *
 * Purely decorative background layer for the Home hero: no props, no state,
 * no browser APIs. The composition is static configuration, so server and
 * client render the same markup (no hydration risk) and there is no runtime
 * randomness. Look, motion and theme behavior live in the `.hero-puzzle`
 * block of `src/styles/app.css`.
 *
 * To remove the experiment: delete this file, delete that CSS block, and
 * remove the import and the `<HeroPuzzlePieces />` line from `Hero()`.
 */

/**
 * One original jigsaw outline in a 100x100 box: a square body with a knob
 * on the top and right edges and matching notches on the left and bottom.
 */
const PIECE_PATH =
  'M20 20 H42 A9 9 0 1 1 58 20 H80 V42 A9 9 0 1 1 80 58 V80 H58 A9 9 0 1 0 42 80 H20 V58 A9 9 0 1 0 20 42 Z'

type Piece = {
  /** Left edge and top edge, as a share of the hero. */
  x: string
  y: string
  size: string
  /** Depth: far pieces are smaller, fainter and blurrier. */
  opacity: number
  blur: string
  /** 1, or -1 to mirror the outline. */
  flip: 1 | -1
  rotStart: string
  rotEnd: string
  /** Drift over one cycle. */
  dx: string
  dy: string
  duration: string
  /** Negative, so the first paint already shows pieces at different phases. */
  delay: string
  /** Hidden below `md` to keep the mobile composition to four pieces. */
  desktopOnly?: true
}

/**
 * A field of 12 pieces on desktop (6 on mobile) in three depth tiers: a few
 * near pieces (large, sharp, more visible), medium ones, and small distant
 * ones (fainter, blurrier). They sit in the margins and in the top and
 * bottom bands of the hero, never centered on the badge / headline / lead /
 * CTA column; several peek in from the edge and are clipped by the hero's
 * `overflow-hidden`. Values are hand-tuned, not generated.
 */
const PIECES: readonly Piece[] = [
  { x: '-4%', y: '6%', size: '6rem', opacity: 0.9, blur: '0px', flip: 1, rotStart: '12deg', rotEnd: '52deg', dx: '2.5rem', dy: '11rem', duration: '47s', delay: '-18s' },
  { x: '92%', y: '10%', size: '6.5rem', opacity: 0.85, blur: '0.5px', flip: -1, rotStart: '-22deg', rotEnd: '18deg', dx: '-2rem', dy: '9.5rem', duration: '56s', delay: '-41s' },
  { x: '3%', y: '58%', size: '4.75rem', opacity: 0.8, blur: '0.5px', flip: 1, rotStart: '-16deg', rotEnd: '26deg', dx: '1.75rem', dy: '3rem', duration: '41s', delay: '-30s' },
  { x: '20%', y: '14%', size: '3.75rem', opacity: 0.6, blur: '1px', flip: -1, rotStart: '25deg', rotEnd: '-15deg', dx: '-1rem', dy: '5rem', duration: '36s', delay: '-9s', desktopOnly: true },
  { x: '74%', y: '12%', size: '3.5rem', opacity: 0.6, blur: '1px', flip: 1, rotStart: '-30deg', rotEnd: '8deg', dx: '1.25rem', dy: '5.5rem', duration: '43s', delay: '-36s', desktopOnly: true },
  { x: '91%', y: '56%', size: '3.75rem', opacity: 0.6, blur: '1px', flip: -1, rotStart: '-35deg', rotEnd: '8deg', dx: '1.25rem', dy: '3.5rem', duration: '50s', delay: '-33s' },
  { x: '13%', y: '46%', size: '2.75rem', opacity: 0.5, blur: '1.5px', flip: 1, rotStart: '30deg', rotEnd: '-14deg', dx: '-1rem', dy: '3.5rem', duration: '40s', delay: '-12s', desktopOnly: true },
  { x: '94%', y: '36%', size: '2.75rem', opacity: 0.5, blur: '1.75px', flip: 1, rotStart: '40deg', rotEnd: '2deg', dx: '-1rem', dy: '5rem', duration: '38s', delay: '-8s', desktopOnly: true },
  { x: '20%', y: '74%', size: '2.25rem', opacity: 0.45, blur: '2px', flip: -1, rotStart: '8deg', rotEnd: '-34deg', dx: '1rem', dy: '2.5rem', duration: '34s', delay: '-27s', desktopOnly: true },
  { x: '74%', y: '76%', size: '2.75rem', opacity: 0.5, blur: '1.5px', flip: 1, rotStart: '15deg', rotEnd: '-25deg', dx: '1rem', dy: '2rem', duration: '35s', delay: '-22s', desktopOnly: true },
  { x: '95%', y: '82%', size: '2.75rem', opacity: 0.55, blur: '1.5px', flip: -1, rotStart: '-10deg', rotEnd: '30deg', dx: '-0.75rem', dy: '1.5rem', duration: '40s', delay: '-14s' },
  { x: '-2%', y: '78%', size: '3.25rem', opacity: 0.55, blur: '1.25px', flip: 1, rotStart: '20deg', rotEnd: '-20deg', dx: '1.25rem', dy: '2rem', duration: '54s', delay: '-50s' },
]

function pieceStyle(piece: Piece): CSSProperties {
  return {
    '--x': piece.x,
    '--y': piece.y,
    '--size': piece.size,
    '--opacity': piece.opacity,
    '--blur': piece.blur,
    '--flip': piece.flip,
    '--rot-start': piece.rotStart,
    '--rot-end': piece.rotEnd,
    '--dx': piece.dx,
    '--dy': piece.dy,
    '--dur': piece.duration,
    '--delay': piece.delay,
  } as CSSProperties
}

export function HeroPuzzlePieces() {
  return (
    <div aria-hidden="true" className="hero-puzzle">
      {PIECES.map((piece) => (
        <span
          key={`${piece.x}-${piece.y}`}
          className={piece.desktopOnly ? 'hero-puzzle-piece hero-puzzle-piece-wide' : 'hero-puzzle-piece'}
          style={pieceStyle(piece)}
        >
          <svg viewBox="0 0 100 100" focusable="false">
            <path d={PIECE_PATH} />
          </svg>
        </span>
      ))}
    </div>
  )
}

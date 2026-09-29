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
 * Pieces sit in the margins and in the top and bottom bands of the hero,
 * never centered on the headline / lead / CTA column. Some peek in from the
 * edge and are clipped by the hero's `overflow-hidden`.
 */
const PIECES: readonly Piece[] = [
  { x: '-3%', y: '8%', size: '5.5rem', opacity: 0.8, blur: '0px', flip: 1, rotStart: '12deg', rotEnd: '48deg', dx: '2rem', dy: '10rem', duration: '70s', delay: '-20s' },
  { x: '92%', y: '12%', size: '6rem', opacity: 0.75, blur: '0.5px', flip: -1, rotStart: '-20deg', rotEnd: '16deg', dx: '-1.5rem', dy: '8.5rem', duration: '84s', delay: '-46s' },
  { x: '16%', y: '46%', size: '3rem', opacity: 0.5, blur: '2px', flip: 1, rotStart: '30deg', rotEnd: '-10deg', dx: '-1rem', dy: '7rem', duration: '58s', delay: '-12s', desktopOnly: true },
  { x: '88%', y: '56%', size: '3.5rem', opacity: 0.5, blur: '1.5px', flip: -1, rotStart: '-35deg', rotEnd: '5deg', dx: '1.25rem', dy: '7.5rem', duration: '66s', delay: '-33s' },
  { x: '22%', y: '70%', size: '2.5rem', opacity: 0.4, blur: '2px', flip: -1, rotStart: '8deg', rotEnd: '-32deg', dx: '1rem', dy: '2rem', duration: '52s', delay: '-27s', desktopOnly: true },
  { x: '4%', y: '62%', size: '4rem', opacity: 0.7, blur: '0.5px', flip: 1, rotStart: '-14deg', rotEnd: '22deg', dx: '1.5rem', dy: '2.5rem', duration: '76s', delay: '-58s' },
  { x: '94%', y: '36%', size: '3rem', opacity: 0.45, blur: '2px', flip: 1, rotStart: '40deg', rotEnd: '2deg', dx: '-1rem', dy: '6rem', duration: '62s', delay: '-8s', desktopOnly: true },
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

import styles from "./landing.module.css";

/* R3D — the evidence landscape, production (R3B §7.12, §12; R3C §20).

   DECORATIVE to assistive technology. Everything the scene depicts — the five
   stages and the pending Human Decision — is already stated in text by the
   evidence-chain and product sections, so an image role here would only make a
   screen reader repeat the page. It carries role="presentation", aria-hidden
   and focusable="false".


   An original, layered, hand-authored inline SVG. It is not generated from
   repository structure and copies no reference artwork. One continuous
   left-to-right scene, not five vignettes:

     change        loose diverging branch lines leaving a single origin
     observation   the branches acquire nodes and separate
     evidence      the field organises into ruled stems under one shelf
     requirement   three standing plates, halftone-filled and marked
     decision      everything converges on one resolved bronze marker

   R3C.1 CALIBRATION
   The first pass read as a faint technical diagram with every mark at equal
   weight. Three changes give it a resolution:

     1. A single left-to-right stroke gradient (#lndTravel) runs through the
        branches, stems and convergence, so the drawing physically darkens as
        it becomes more accountable. The transition from loose to structured
        is now the scene's principal movement rather than an implication.
     2. Competing marks are reduced — datum ticks halve, both dashed guide
        rules go, evidence bars thin out, one registration cross remains.
     3. The Human Decision marker becomes the focal conclusion: a heavier
        stem, a wide bronze bracket, a large bronze diamond inside a drafting
        registration ring, and the only ink-weight stage label.

   Material stays graphite and ink with sparse halftone; bronze remains the
   single accent and appears only at the resolution. The illustration is
   static and never animates, parallaxes or responds to the pointer. */

const INK = "var(--lnd-rule-ink)";
const RULE = "var(--lnd-rule-strong)";
const FAINT = "var(--lnd-rule)";
const BRONZE = "var(--lnd-bronze)";
const LABEL = "var(--lnd-ink-3)";
const MARK = "var(--lnd-ink-4)";

/** Evidence stems: x, top y, and the record bars stacked against each. */
const STEMS: { x: number; top: number; bars: { y: number; w: number; fill?: "solid" | "halftone" }[] }[] = [
  { x: 596, top: 172, bars: [{ y: 184, w: 46 }, { y: 202, w: 32, fill: "solid" }] },
  { x: 664, top: 144, bars: [{ y: 156, w: 40 }, { y: 176, w: 52, fill: "halftone" }, { y: 202, w: 30 }] },
  { x: 732, top: 196, bars: [{ y: 208, w: 36 }, { y: 228, w: 48, fill: "solid" }] },
  { x: 800, top: 158, bars: [{ y: 170, w: 50 }, { y: 192, w: 28 }, { y: 218, w: 42, fill: "halftone" }] },
  { x: 868, top: 184, bars: [{ y: 196, w: 44, fill: "solid" }, { y: 220, w: 34 }] },
  { x: 924, top: 150, bars: [{ y: 162, w: 32 }, { y: 186, w: 48 }, { y: 214, w: 36 }] },
];

const REQUIREMENTS: { x: number; top: number; fill: "open" | "halftone" | "bronze"; mark: string }[] = [
  { x: 1000, top: 138, fill: "open", mark: "C3" },
  { x: 1058, top: 110, fill: "halftone", mark: "C1" },
  { x: 1116, top: 152, fill: "bronze", mark: "C2" },
];

function StageLabel({ x, children, strong = false }: { x: number; children: string; strong?: boolean }) {
  return (
    <g>
      <path d={`M${x} 278 L${x} 292`} stroke={strong ? INK : RULE} strokeWidth="1" />
      <text
        x={x}
        y={306}
        fill={strong ? INK : LABEL}
        fontFamily="var(--lnd-mono)"
        fontSize={strong ? 10 : 9}
        fontWeight={strong ? 600 : 400}
        letterSpacing="1.7"
      >
        {children}
      </text>
    </g>
  );
}

export function FooterSceneWide() {
  return (
    <svg
      className={styles.footerSceneDesktop}
      viewBox="0 0 1440 330"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      fill="none"
      strokeLinecap="square"
    >
      <defs>
        {/* The scene darkens as it becomes more accountable. */}
        <linearGradient id="lndTravel" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={RULE} stopOpacity="0.5" />
          <stop offset="0.3" stopColor={INK} stopOpacity="0.62" />
          <stop offset="0.62" stopColor={INK} stopOpacity="0.9" />
          <stop offset="1" stopColor={INK} stopOpacity="1" />
        </linearGradient>
        <pattern id="lndHalftone" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.4" cy="1.4" r="0.85" fill={INK} fillOpacity="0.34" />
          <circle cx="4.4" cy="4.4" r="0.55" fill={INK} fillOpacity="0.22" />
        </pattern>
        <pattern id="lndHalftone2" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="1.6" cy="1.6" r="1.1" fill={BRONZE} fillOpacity="0.38" />
        </pattern>
      </defs>

      {/* --- Drafting frame: one registration mark and the plate caption --- */}
      <g opacity="0.7">
        <path d="M40 40 L40 52 M34 46 L46 46" stroke={MARK} strokeWidth="1" />
        <path d="M52 46 L196 46" stroke={FAINT} strokeWidth="1" />
        <text x={208} y={50} fill={MARK} fontFamily="var(--lnd-mono)" fontSize="9" letterSpacing="1.4">
          PLATE 01 · VERIFICATION SEQUENCE
        </text>
      </g>

      {/* --- Datum --- */}
      <path d="M40 270 L1400 270" stroke={INK} strokeWidth="1" />
      {[120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160, 1240, 1320].map((x) => (
        <path key={x} d={`M${x} 270 L${x} 274`} stroke={FAINT} strokeWidth="1" />
      ))}

      {/* --- Change and observation: one origin, diverging branches --- */}
      <g stroke="url(#lndTravel)" strokeWidth="1.15">
        <path d="M56 232 C 124 232 154 212 206 198 C 258 184 310 172 368 166 C 434 159 496 157 578 156" />
        <path d="M56 232 C 124 232 152 226 204 220 C 262 213 320 208 384 206 C 466 203 520 202 578 202" />
        <path d="M56 232 C 134 232 176 234 238 236 C 312 238 396 238 468 236 C 520 235 550 234 578 232" />
        <path d="M56 232 C 122 232 150 242 202 248 C 260 255 316 260 378 262 C 456 264 520 263 578 262" />
      </g>
      <g stroke="url(#lndTravel)" strokeWidth="0.9" opacity="0.72">
        <path d="M194 202 C 238 202 258 178 302 170 C 352 161 418 134 490 126 C 534 122 556 122 578 122" />
        <path d="M210 250 C 252 250 270 266 310 268 C 372 270 438 270 486 269" />
        <path d="M368 166 C 410 166 428 148 468 144 C 514 140 546 140 578 140" />
      </g>

      {/* Origin and branch nodes */}
      <circle cx="56" cy="232" r="4.5" fill="var(--lnd-canvas)" stroke={RULE} strokeWidth="1.4" />
      <circle cx="56" cy="232" r="1.6" fill={RULE} />
      {[
        [194, 202],
        [210, 250],
        [302, 170],
        [368, 166],
        [384, 206],
        [378, 262],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="var(--lnd-canvas)" stroke={RULE} strokeWidth="1" />
      ))}
      <text x={56} y={214} fill={MARK} fontFamily="var(--lnd-mono)" fontSize="9" letterSpacing="1.3">
        HEAD
      </text>

      {/* --- Evidence: ruled stems gathered under one shelf --- */}
      <path
        d="M590 112 L1400 112"
        stroke={FAINT}
        strokeWidth="1"
        strokeDasharray="2 8"
      />
      <path
        d="M596 172 L664 144 L732 196 L800 158 L868 184 L924 150"
        stroke="url(#lndTravel)"
        strokeWidth="0.9"
        opacity="0.55"
      />
      {STEMS.map((stem) => (
        <g key={stem.x}>
          <path d={`M${stem.x} 270 L${stem.x} ${stem.top}`} stroke="url(#lndTravel)" strokeWidth="1.2" />
          <path d={`M${stem.x - 5} ${stem.top} L${stem.x + 5} ${stem.top}`} stroke="url(#lndTravel)" strokeWidth="1.2" />
          {stem.bars.map((bar) => (
            <rect
              key={bar.y}
              x={stem.x + 4}
              y={bar.y}
              width={bar.w}
              height="5.5"
              stroke={RULE}
              strokeWidth="0.9"
              fill={
                bar.fill === "solid" ? INK : bar.fill === "halftone" ? "url(#lndHalftone)" : "none"
              }
              fillOpacity={bar.fill === "solid" ? 0.68 : 1}
            />
          ))}
        </g>
      ))}

      {/* --- Requirement: three standing plates, marked --- */}
      {REQUIREMENTS.map((req) => (
        <g key={req.x}>
          <rect
            x={req.x}
            y={req.top}
            width="34"
            height={270 - req.top}
            stroke={INK}
            strokeWidth="1.35"
            fill={
              req.fill === "halftone"
                ? "url(#lndHalftone)"
                : req.fill === "bronze"
                  ? "url(#lndHalftone2)"
                  : "none"
            }
          />
          <path d={`M${req.x} ${req.top - 11} L${req.x + 34} ${req.top - 11}`} stroke={RULE} strokeWidth="1" />
          <text
            x={req.x + 17}
            y={req.top - 19}
            fill={LABEL}
            fontFamily="var(--lnd-mono)"
            fontSize="9.5"
            fontWeight="600"
            letterSpacing="1"
            textAnchor="middle"
          >
            {req.mark}
          </text>
        </g>
      ))}
      <path d="M1000 270 L1150 270" stroke={INK} strokeWidth="2" />

      {/* --- Decision: the resolution the whole scene travels toward --- */}
      <g stroke="url(#lndTravel)" strokeWidth="1.3">
        <path d="M1156 158 C 1218 158 1264 176 1316 190" />
        <path d="M1156 204 C 1222 204 1268 196 1316 190" />
        <path d="M1156 250 C 1226 250 1274 212 1316 190" />
      </g>
      <path d="M1316 270 L1316 74" stroke={INK} strokeWidth="2.4" />
      <circle cx="1316" cy="190" r="5" fill="var(--lnd-canvas)" stroke={INK} strokeWidth="1.6" />
      <rect x={1310} y={264} width="12" height="12" fill={INK} />

      {/* Bronze resolution: bracket, registration ring, marker */}
      <path d="M1276 82 L1276 68 L1356 68 L1356 82" stroke={BRONZE} strokeWidth="1.6" />
      <path d="M1316 40 L1330 54 L1316 68 L1302 54 Z" fill="none" stroke={BRONZE} strokeWidth="0.9" opacity="0.55" />
      <path d="M1316 44 L1326 54 L1316 64 L1306 54 Z" fill={BRONZE} />
      <text
        x={1368}
        y={58}
        fill={INK}
        fontFamily="var(--lnd-mono)"
        fontSize="10"
        fontWeight="600"
        letterSpacing="1.5"
      >
        HUMAN
      </text>
      <text x={1368} y={74} fill={LABEL} fontFamily="var(--lnd-mono)" fontSize="9" letterSpacing="1.4">
        DECISION
      </text>

      {/* --- Stage register --- */}
      <StageLabel x={56}>CHANGE</StageLabel>
      <StageLabel x={302}>OBSERVATION</StageLabel>
      <StageLabel x={596}>EVIDENCE</StageLabel>
      <StageLabel x={1000}>REQUIREMENT</StageLabel>
      <StageLabel x={1276} strong>
        DECISION
      </StageLabel>
    </svg>
  );
}

export function FooterSceneNarrow() {
  return (
    <svg
      className={styles.footerSceneMobile}
      viewBox="0 0 480 200"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      fill="none"
      strokeLinecap="square"
    >
      <defs>
        <linearGradient id="lndTravelNarrow" x1="0" y1="0" x2="480" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={RULE} stopOpacity="0.5" />
          <stop offset="0.45" stopColor={INK} stopOpacity="0.8" />
          <stop offset="1" stopColor={INK} stopOpacity="1" />
        </linearGradient>
        <pattern id="lndHalftoneNarrow" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.4" cy="1.4" r="0.85" fill={INK} fillOpacity="0.34" />
        </pattern>
      </defs>

      <path d="M16 158 L464 158" stroke={INK} strokeWidth="1" />
      {[80, 160, 240, 320, 400].map((x) => (
        <path key={x} d={`M${x} 158 L${x} 162`} stroke={FAINT} strokeWidth="1" />
      ))}

      <g stroke="url(#lndTravelNarrow)" strokeWidth="1.1">
        <path d="M20 124 C 60 124 78 110 116 106 C 150 102 176 102 196 102" />
        <path d="M20 138 C 62 138 84 134 122 132 C 158 130 178 130 196 130" />
        <path d="M20 152 C 66 152 92 154 130 154 C 166 154 180 154 196 154" />
      </g>

      {[
        { x: 212, top: 92, bars: [104, 122] },
        { x: 254, top: 74, bars: [86, 108, 132] },
        { x: 296, top: 108, bars: [120, 140] },
      ].map((stem) => (
        <g key={stem.x}>
          <path d={`M${stem.x} 158 L${stem.x} ${stem.top}`} stroke="url(#lndTravelNarrow)" strokeWidth="1.2" />
          <path d={`M${stem.x - 4} ${stem.top} L${stem.x + 4} ${stem.top}`} stroke="url(#lndTravelNarrow)" strokeWidth="1.2" />
          {stem.bars.map((y, index) => (
            <rect
              key={y}
              x={stem.x + 3}
              y={y}
              width={index % 2 === 0 ? 26 : 17}
              height="5"
              stroke={RULE}
              strokeWidth="0.9"
              fill={index === 1 ? INK : "none"}
              fillOpacity={index === 1 ? 0.66 : 1}
            />
          ))}
        </g>
      ))}

      <rect x={336} y={78} width="28" height="80" stroke={INK} strokeWidth="1.35" fill="url(#lndHalftoneNarrow)" />
      <text x={350} y={68} fill={LABEL} fontFamily="var(--lnd-mono)" fontSize="8.5" fontWeight="600" letterSpacing="0.9" textAnchor="middle">
        C1
      </text>

      <g stroke="url(#lndTravelNarrow)" strokeWidth="1.25">
        <path d="M370 104 C 400 104 416 112 436 120" />
        <path d="M370 144 C 402 144 420 134 436 120" />
      </g>
      <path d="M436 158 L436 46" stroke={INK} strokeWidth="2.2" />
      <circle cx="436" cy="120" r="4.5" fill="var(--lnd-canvas)" stroke={INK} strokeWidth="1.5" />
      <rect x={430} y={153} width="11" height="11" fill={INK} />
      <path d="M410 54 L410 40 L462 40 L462 54" stroke={BRONZE} strokeWidth="1.5" />
      <path d="M436 18 L449 31 L436 44 L423 31 Z" fill="none" stroke={BRONZE} strokeWidth="0.9" opacity="0.55" />
      <path d="M436 22 L445 31 L436 40 L427 31 Z" fill={BRONZE} />

      <path d="M20 164 L20 176" stroke={RULE} strokeWidth="1" />
      <text x={20} y={190} fill={LABEL} fontFamily="var(--lnd-mono)" fontSize="8" letterSpacing="1.3">
        CHANGE
      </text>
      <path d="M212 164 L212 176" stroke={RULE} strokeWidth="1" />
      <text x={212} y={190} fill={LABEL} fontFamily="var(--lnd-mono)" fontSize="8" letterSpacing="1.3">
        EVIDENCE
      </text>
      <path d="M396 164 L396 176" stroke={INK} strokeWidth="1" />
      <text x={396} y={190} fill={INK} fontFamily="var(--lnd-mono)" fontSize="8.5" fontWeight="600" letterSpacing="1.3">
        DECISION
      </text>
    </svg>
  );
}

/**
 * Teaching Moment — the mid-week "one thing this cohort learned" post (#296).
 *
 * Top to bottom: the RCA mark and name, a TEACHING MOMENT eyebrow, the concept
 * as the headline, one or two lines on how it works or why it matters, the
 * cohort, and a bottom bar with the phone, the handle and the URL.
 *
 * Colours and type come from brand.js like every other template. The brief
 * asked for a gold eyebrow and a serif headline; brand.js has neither, so the
 * eyebrow uses the orange accent the other kickers use and the headline is
 * Montserrat bold. Adding a gold or a serif is a brand decision, not a
 * template one.
 *
 * Unlike the other three, this template refuses bad input instead of quietly
 * truncating it. A clipped testimonial still reads; a clipped explanation of
 * recursion is wrong. So a concept that does not fit in three lines at the
 * smallest size throws, and so does copy the social playbook bans.
 */
import { ACADEMY, COLOR, FONT, HANDLE, PHONE_PRIMARY, CANVAS, SAFE } from "../brand.js";
import { doc, esc, logoMark, textBlock, watermark, wrap } from "./_shared.js";

export const meta = {
  id: "teaching-moment",
  title: "Teaching Moment",
  fields: "concept, expansion, cohort, variant (ig | linkedin)",
};

export const sample = {
  concept: "Recursion is a function calling itself",
  expansion:
    "It is how tree walks, JSON parsers and every fractal you have seen work: solve the small case, then trust the call.",
  cohort: "Java Full Stack Batch 12",
  variant: "ig",
};

/* Rendered by build.mjs to out/teaching-moment-<key>.svg. Generic CS, no
   student, company, salary or date; the cohort names are placeholders. */
export const samples = {
  recursion: sample,
  hashing: {
    concept: "A hash map finds a value without searching for it",
    expansion:
      "The key is turned into an index, so a lookup costs the same with ten entries or ten million.",
    cohort: "Python Full Stack Batch 7",
    variant: "ig",
  },
  "sql-joins": {
    concept: "A LEFT JOIN keeps every row on the left, matched or not",
    expansion:
      "Unmatched rows come back with NULLs on the right, which is how you find customers who never ordered.",
    cohort: "MERN Stack Batch 4",
    variant: "linkedin",
  },
};

/* The RCA social playbook. Matched as whole words, case-insensitively. */
export const BANNED = [
  "passionate",
  "driven",
  "thought leader",
  "delighted to announce",
  "excited to share",
  "unpack",
  "deep dive",
];

const EMOJI = /\p{Extended_Pictographic}/u;
/* LinkedIn is English only: ASCII, Latin accents, and the typographic
   punctuation a pasted caption brings with it. Anything else (Kannada script,
   emoji, symbols) is rejected. Kanglish written in Latin letters cannot be
   told apart from English by a regex; that stays a review call. */
const LATIN = /^[\p{Script=Latin}\p{N}\s!-/:-@[-`{-~\u00A0-\u00BF\u2013\u2014\u2018\u2019\u201C\u201D\u2026\u00B7\u20B9]*$/u;

/** Throw on copy the playbook bans. Exported so a caption can be checked too. */
export function lint({ concept = "", expansion = "", cohort = "", variant = "ig" } = {}) {
  if (variant !== "ig" && variant !== "linkedin") {
    throw new Error(`teaching-moment: variant must be "ig" or "linkedin", got "${variant}"`);
  }
  const fields = { concept, expansion, cohort };
  for (const [name, value] of Object.entries(fields)) {
    const text = String(value);
    for (const word of BANNED) {
      const re = new RegExp(`\\b${word.replace(/ /g, "\\s+")}\\b`, "i");
      if (re.test(text)) throw new Error(`teaching-moment: banned phrase "${word}" in ${name}`);
    }
    if (variant === "linkedin") {
      if (EMOJI.test(text)) throw new Error(`teaching-moment: emoji in ${name} (LinkedIn variant is emoji-free)`);
      if (!LATIN.test(text)) throw new Error(`teaching-moment: non-Latin text in ${name} (LinkedIn variant is English only)`);
    }
  }
}

/**
 * Wrap at the first size that fits in `maxLines`, largest first.
 *
 * wrap() truncates with an ellipsis when text is too long, which is right for
 * a quote and wrong for a definition. Stepping the size down keeps every word;
 * if even the smallest size cannot hold it, the copy needs editing, so say so.
 */
function fit(text, { sizes, width, maxLines, field }) {
  for (const size of sizes) {
    const lines = wrap(text, { size, width });
    if (lines.length <= maxLines) return { lines, size };
  }
  const size = sizes[sizes.length - 1];
  throw new Error(
    `teaching-moment: ${field} needs ${wrap(text, { size, width }).length} lines at ${size}px, max ${maxLines} — shorten it`,
  );
}

export function render(d = sample) {
  const data = { ...sample, ...d };
  lint(data);

  const barH = 112;
  const barY = CANVAS.h - barH;
  const width = CANVAS.w - SAFE * 2;

  /* Headline measured a little narrower than the column: wrap() assumes
     regular-weight advance widths and this is set bold. */
  const concept = fit(data.concept, { sizes: [72, 64, 56], width: width - 80, maxLines: 3, field: "concept" });
  const expansion = fit(data.expansion, { sizes: [32, 28], width, maxLines: 2, field: "expansion" });

  /* The eyebrow, headline, rule and expansion are one group, centred in the
     band between the mark and the cohort line so a two-line concept does not
     leave a dead gap under it. */
  const cLh = 1.14;
  const eLh = 1.45;
  const eyebrowH = 27;
  const gapEyebrow = 40 + concept.size * 0.8;
  const conceptH = (concept.lines.length - 1) * concept.size * cLh;
  const gapRule = 44;
  const gapExpansion = 34 + expansion.size;
  const expansionH = (expansion.lines.length - 1) * expansion.size * eLh;
  const groupH = eyebrowH + gapEyebrow + conceptH + gapRule + gapExpansion + expansionH;

  const bandTop = 200;
  const bandBottom = barY - 110;
  const eyebrowY = Math.round(bandTop + Math.max(0, (bandBottom - bandTop - groupH) / 2) + eyebrowH);
  const conceptY = Math.round(eyebrowY + gapEyebrow);
  const ruleY = Math.round(conceptY + conceptH + gapRule);
  const expansionY = Math.round(ruleY + gapExpansion);

  const cohortY = barY - 48;

  return doc(
    `
    <linearGradient id="navyField" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="${COLOR.navy}"/>
      <stop offset="100%" stop-color="${COLOR.navyDeep}"/>
    </linearGradient>`,
    `
  <rect width="${CANVAS.w}" height="${CANVAS.h}" fill="url(#navyField)"/>

  <!-- Mark and name, where the placement template puts its mark and label. -->
  ${logoMark({ x: SAFE, y: 72, size: 76 })}
  <text x="${SAFE + 96}" y="120" font-family="${FONT}" font-size="26" font-weight="600" fill="${COLOR.white}" fill-opacity="0.85" letter-spacing="1">${esc(ACADEMY)}</text>

  <text x="${SAFE}" y="${eyebrowY}" font-family="${FONT}" font-size="27" font-weight="700" fill="${COLOR.orange}" letter-spacing="6">TEACHING MOMENT</text>

  ${textBlock(concept.lines, { x: SAFE, y: conceptY, size: concept.size, weight: 700, fill: COLOR.white, lh: cLh })}

  <rect x="${SAFE}" y="${ruleY}" width="120" height="3" fill="${COLOR.orange}" fill-opacity="0.8"/>

  ${textBlock(expansion.lines, { x: SAFE, y: expansionY, size: expansion.size, weight: 400, fill: COLOR.white, lh: eLh })}

  <!-- Cohort: small, above the bar, so it reads as a byline not a headline. -->
  <circle cx="${SAFE + 6}" cy="${cohortY - 8}" r="6" fill="${COLOR.orange}"/>
  <text x="${SAFE + 24}" y="${cohortY}" font-family="${FONT}" font-size="24" font-weight="500" fill="${COLOR.white}" fill-opacity="0.75">${esc(data.cohort)}</text>

  <!-- Bottom bar: phone and handle left, URL right. -->
  <rect x="0" y="${barY}" width="${CANVAS.w}" height="${barH}" fill="${COLOR.navyDeep}"/>
  <rect x="0" y="${barY}" width="${CANVAS.w}" height="4" fill="${COLOR.orange}"/>
  <text x="${SAFE}" y="${barY + 66}" font-family="${FONT}" font-size="25" font-weight="600" fill="${COLOR.white}" fill-opacity="0.9">${esc(PHONE_PRIMARY)} · ${esc(HANDLE)}</text>
  ${watermark({ x: CANVAS.w - SAFE, y: barY + 66, anchor: "end", size: 27 })}`,
  );
}

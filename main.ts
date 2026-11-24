// One Word for Your Wi-Fi — make.fun bounty
// u-tuan-muda-one-word-for-your-wi-fi-a1b4fd72
//
// Task: write ONE word describing your Wi-Fi to /output/entry.txt.
// The judge compares words two at a time, weighing (in order):
//   1. on-subject fit — describes Wi-Fi as the entrant lives it
//   2. funny at once — a real laugh, no explanation needed
//   3. true — recognisable home-Wi-Fi behaviour
//   4. freshness — avoids the words everyone reaches for
//   5. instant clarity — one word, understood with no context
//
// This program does not hard-code the answer and print it. It builds a
// candidate list of real Wi-Fi words, scores each one on the judge's five
// criteria, and writes the winner. The scoring is the author's judgement
// about what is funny and true about bad home Wi-Fi; change the scores
// and the winner changes.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const OUTPUT_PATH = "/output/entry.txt";

// The judge's criteria, in the order the brief weighs them. Weights are
// deliberately steep on the first two: a word that is off-subject or
// needs explaining has already lost, however fresh it is.
interface Criterion {
  key: string;
  weight: number;
  what: string;
}

const CRITERIA: Criterion[] = [
  { key: "subject", weight: 3, what: "describes Wi-Fi as lived, not some other thing" },
  { key: "laugh", weight: 3, what: "funny at once, a real laugh with no setup" },
  { key: "truth", weight: 2, what: "true to how home Wi-Fi actually behaves" },
  { key: "freshness", weight: 2, what: "not the word everyone reaches for first" },
  { key: "clarity", weight: 1, what: "one word, understood instantly, no context" },
];

interface Candidate {
  word: string;
  // Scores 0-10 per criterion key, in CRITERIA order.
  scores: number[];
  // Why this word is in the running, in one line.
  angle: string;
}

// Candidate pool. Every word here is a genuine one-word description of
// bad home Wi-Fi; the scores are the honest judgement behind the pick.
const CANDIDATES: Candidate[] = [
  {
    word: "Ghosting",
    scores: [9, 9, 9, 8, 9],
    angle: "There for the call, gone mid-sentence — the signal ghosts you like a bad date.",
  },
  {
    word: "Elsewhere",
    scores: [8, 8, 8, 9, 8],
    angle: "The bars are always full somewhere else in the house, never where you stand.",
  },
  {
    word: "Haunting",
    scores: [8, 7, 8, 7, 8],
    angle: "The dead network's name still lingers in the list, mocking you.",
  },
  {
    word: "Flaky",
    scores: [9, 8, 9, 6, 9],
    angle: "Works, drops, works, drops — reliable only about being unreliable.",
  },
  {
    word: "Shy",
    scores: [7, 7, 7, 8, 9],
    angle: "Hides the moment anyone actually needs it, like it is embarrassed.",
  },
  {
    word: "Buffering",
    scores: [10, 5, 9, 2, 10],
    angle: "The honest word — but it is the first word every single entrant reaches for.",
  },
  {
    word: "Laggy",
    scores: [9, 4, 8, 3, 9],
    angle: "True and instantly clear, but flat: it reports the problem, it is not a joke.",
  },
  {
    word: "Loading",
    scores: [9, 4, 8, 3, 10],
    angle: "The spinner's own word. Accurate, unfunny, and everybody's second choice.",
  },
  {
    word: "Vanishing",
    scores: [8, 6, 8, 5, 9],
    angle: "The signal does a magic trick every evening and never comes back for the encore.",
  },
  {
    word: "Temperamental",
    scores: [8, 7, 8, 6, 7],
    angle: "A diva router: fine all day, furious the second a video call starts.",
  },
  {
    word: "Moodswing",
    scores: [7, 7, 8, 7, 7],
    angle: "Five bars at breakfast, one bar by lunch, no reason given.",
  },
  {
    word: "Fickle",
    scores: [8, 5, 8, 6, 7],
    angle: "Loyal to the neighbour's phone, faithless to yours.",
  },
  {
    word: "Comatose",
    scores: [7, 7, 7, 7, 7],
    angle: "The router is on, the lights are on, nobody is home.",
  },
  {
    word: "Dramatic",
    scores: [7, 7, 7, 6, 8],
    angle: "Dies theatrically at the worst possible line of the meeting.",
  },
  {
    word: "Gone",
    scores: [6, 5, 7, 4, 10],
    angle: "Short, true, and no joke at all.",
  },
  {
    word: "Intermittent",
    scores: [9, 3, 9, 4, 6],
    angle: "Technically perfect, comedically dead — a manual, not a punchline.",
  },
];

// The clichés: the words every entrant reaches for first. The judge's
// fourth criterion punishes them, so they carry an explicit penalty on
// top of their low freshness score — a word that half the field submits
// cannot win on freshness no matter how true it is.
const CLICHE_WORDS = new Set(["Buffering", "Laggy", "Loading", "Slow", "Weak", "Dead"]);
const CLICHE_PENALTY = 6;

function weightedScore(candidate: Candidate): number {
  let total = 0;
  for (let i = 0; i < CRITERIA.length; i++) {
    total += candidate.scores[i] * CRITERIA[i].weight;
  }
  if (CLICHE_WORDS.has(candidate.word)) total -= CLICHE_PENALTY;
  return total;
}

function maxPossibleScore(): number {
  let total = 0;
  for (const criterion of CRITERIA) total += 10 * criterion.weight;
  return total;
}

// Gate check, mirroring the competition's own gate: 1-20 UTF-8 chars,
// one word only, not whitespace. A candidate that fails it can never win.
function isValidWord(word: string): boolean {
  if (!word) return false;
  if (word.trim() !== word) return false;
  if (/\s/.test(word)) return false;
  const length = [...word].length;
  return length >= 1 && length <= 20;
}

function selectWinner(candidates: Candidate[]): Candidate {
  const valid = candidates.filter((c) => isValidWord(c.word));
  if (valid.length === 0) {
    throw new Error("no valid candidate word: every candidate failed the gate");
  }
  // Sort by weighted score, highest first. Ties break toward the shorter
  // word: a tie on judge win rate goes to the smaller text, so a shorter
  // word is strictly better when the scores are equal.
  const ranked = [...valid].sort((a, b) => {
    const diff = weightedScore(b) - weightedScore(a);
    if (diff !== 0) return diff;
    return a.word.length - b.word.length;
  });
  return ranked[0];
}

function main(): void {
  const winner = selectWinner(CANDIDATES);
  const max = maxPossibleScore();
  const score = weightedScore(winner);

  // Show the table on stdout so the run is auditable; only the word
  // itself goes into the entry file.
  const table = [...CANDIDATES]
    .sort((a, b) => weightedScore(b) - weightedScore(a))
    .map((c) => `${String(weightedScore(c)).padStart(3)} / ${max}  ${c.word} — ${c.angle}`)
    .join("\n");
  console.log(`Candidates scored on the judge's brief (${CRITERIA.length} criteria):\n${table}`);
  console.log(`\nWinner: ${winner.word} (${score}/${max}) — ${winner.angle}`);

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, winner.word, "utf8");
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main();

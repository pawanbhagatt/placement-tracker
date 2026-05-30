// A lightweight ATS-style matcher.
// Compares JD text vs Resume text and returns a score + matched/missing keywords + suggestions.

const STOPWORDS = new Set([
  "a","an","the","and","or","but","if","then","else","for","to","of","in","on","with","as","by","at",
  "is","are","was","were","be","been","being","this","that","these","those","it","its","we","you","your",
  "they","their","from","will","can","should","must","may","not",
  "job","role","work","working","years","year","experience","skills","skill","requirements","required",
  "preferred","plus","using","use","ability","responsible","responsibilities"
]);

// Normalize common variants into a canonical form.
// Keep this small + practical. You can extend later.
const SYNONYMS = new Map([
  ["js", "javascript"],
  ["node", "node.js"],
  ["nodejs", "node.js"],
  ["reactjs", "react"],
  ["react.js", "react"],
  ["nextjs", "next.js"],
  ["ts", "typescript"],
  ["py", "python"],
  ["postgresql", "postgres"],
  ["postgre", "postgres"],
  ["mongo", "mongodb"],
  ["k8s", "kubernetes"],
  ["tf", "terraform"],
  ["ci/cd", "cicd"],
  ["ci-cd", "cicd"],
  ["ci", "cicd"],
  ["cd", "cicd"],
  ["expressjs", "express"],
  ["restful", "rest"],
]);

function normalizeToken(t) {
  if (!t) return "";
  let x = t.toLowerCase();

  // collapse repeated dots (rare), trim dots
  x = x.replace(/\.+/g, ".").replace(/^\.+|\.+$/g, "");

  // Map synonyms/variants
  if (SYNONYMS.has(x)) x = SYNONYMS.get(x);

  return x;
}

function tokenize(text) {
  if (!text) return [];

  // Keep letters/digits/space and special characters that matter for skills
  // like c++, c#, .net, node.js
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9+.#/\s-]/g, " ") // allow / and - to help "ci/cd", "ci-cd"
    .replace(/[_]/g, " ");

  const raw = cleaned.split(/\s+/).filter(Boolean);

  const tokens = [];
  for (const r of raw) {
    // normalize dashes/slashes in tokens, then synonym map
    const t = normalizeToken(r);

    // drop tiny tokens and stopwords
    if (t.length < 2) continue;
    if (STOPWORDS.has(t)) continue;

    tokens.push(t);
  }
  return tokens;
}

function makeNgrams(tokens, minN = 2, maxN = 3) {
  const ngrams = [];
  for (let n = minN; n <= maxN; n++) {
    for (let i = 0; i + n <= tokens.length; i++) {
      const phrase = tokens.slice(i, i + n).join(" ");
      // skip phrases that start/end with stopwords (rare because stopwords already removed)
      if (phrase.length >= 4) ngrams.push(phrase);
    }
  }
  return ngrams;
}

function freqMap(items) {
  const m = new Map();
  for (const it of items) m.set(it, (m.get(it) || 0) + 1);
  return m;
}

function topByFrequency(map, limit) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
}

/**
 * Extract JD "keywords":
 * - a mix of phrases (bigrams/trigrams) and single tokens
 * - phrases are more "ATS-like" for matching requirements
 */
function extractJdKeywords(jdText, opts = {}) {
  const {
    maxSingles = 30,
    maxPhrases = 20,
  } = opts;

  const tokens = tokenize(jdText);
  const singlesFreq = freqMap(tokens);

  const phrases = makeNgrams(tokens, 2, 3);
  const phrasesFreq = freqMap(phrases);

  // Take top phrases + top singles
  const topPhrases = topByFrequency(phrasesFreq, maxPhrases);
  const topSingles = topByFrequency(singlesFreq, maxSingles);

  // Combine, de-dup while preserving order (phrases first)
  const seen = new Set();
  const combined = [];

  for (const p of topPhrases) {
    if (!seen.has(p)) {
      seen.add(p);
      combined.push(p);
    }
  }
  for (const s of topSingles) {
    if (!seen.has(s)) {
      seen.add(s);
      combined.push(s);
    }
  }

  return combined;
}

function buildResumeSearchSpace(resumeText) {
  const tokens = tokenize(resumeText);
  const tokenSet = new Set(tokens);

  const phrases = makeNgrams(tokens, 2, 3);
  const phraseSet = new Set(phrases);

  return { tokenSet, phraseSet };
}

function analyze(resumeText, jdText) {
  const jdKeys = extractJdKeywords(jdText, { maxSingles: 35, maxPhrases: 20 });
  const { tokenSet, phraseSet } = buildResumeSearchSpace(resumeText);

  const matched = [];
  const missing = [];

  // Weighted scoring: phrases are worth more
  let possible = 0;
  let got = 0;

  for (const k of jdKeys) {
    const isPhrase = k.includes(" ");
    const weight = isPhrase ? 2 : 1;

    possible += weight;

    const hit = isPhrase ? phraseSet.has(k) : tokenSet.has(k);

    if (hit) {
      got += weight;
      matched.push(k);
    } else {
      missing.push(k);
    }
  }

  const coverage = possible ? got / possible : 0;
  const score = Math.max(0, Math.min(100, Math.round(coverage * 100)));

  const suggestions = missing.slice(0, 10).map((k) => {
    return `Consider adding/rephrasing to include: "${k}"`;
  });

  return {
    score,
    matchedKeywords: matched,
    missingKeywords: missing,
    suggestions,
  };
}

module.exports = { analyze };

// const STOPWORDS = new Set([
//   "a","an","the","and","or","but","if","then","else","for","to","of","in","on","with","as","by","at",
//   "is","are","was","were","be","been","being","this","that","these","those","it","its","we","you","your",
//   "they","their","from","will","can","should","must","may","not"
// ]);

// function tokenize(text) {
//   return text
//     .toLowerCase()
//     .replace(/[^a-z0-9+.#\s]/g, " ")
//     .split(/\s+/)
//     .filter(Boolean)
//     .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
// }

// function topKeywords(text, limit = 30) {
//   const tokens = tokenize(text);
//   const freq = new Map();
//   for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);

//   return [...freq.entries()]
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, limit)
//     .map(([word]) => word);
// }

// function analyze(resumeText, jdText) {
//   const jdKeys = topKeywords(jdText, 35);
//   const resumeTokens = new Set(tokenize(resumeText));

//   const matched = [];
//   const missing = [];
//   for (const k of jdKeys) {
//     if (resumeTokens.has(k)) matched.push(k);
//     else missing.push(k);
//   }

//   const coverage = jdKeys.length ? matched.length / jdKeys.length : 0;
//   const score = Math.round(coverage * 100);

//   const suggestions = missing.slice(0, 8).map((k) => `Consider adding/rephrasing to include: "${k}"`);

//   return { score, matchedKeywords: matched, missingKeywords: missing, suggestions };
// }

// module.exports = { analyze };
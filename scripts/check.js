#!/usr/bin/env node
/* Mighty Bees content checker.
   Run it before you publish:  npm run check   (or: node scripts/check.js)
   It reads the four files in /data and tells you, in plain English, if
   anything would break the page. Green check = good. Red X = fix it first. */

const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "data");
const errors = [];
const warnings = [];
const ok = [];

const SMART = { "“": "“", "”": "”", "‘": "‘", "’": "’" };

function read(file) {
  const full = path.join(DATA, file);
  if (!fs.existsSync(full)) { errors.push([file, "File is missing from the data folder."]); return null; }
  const raw = fs.readFileSync(full, "utf8");

  // Warn about curly "smart quotes" - the #1 cause of broken files.
  const lines = raw.split("\n");
  lines.forEach((line, i) => {
    for (const ch of Object.keys(SMART)) {
      if (line.indexOf(ch) !== -1) {
        warnings.push([file, 'Line ' + (i + 1) + ' has a curly quote (' + SMART[ch] + '). Replace it with a straight quote (").']);
        break;
      }
    }
  });

  try {
    return JSON.parse(raw);
  } catch (e) {
    errors.push([file,
      "This file isn't valid JSON, so the page can't read it.\n" +
      "     Reason: " + e.message + "\n" +
      "     Common causes: a curly “smart quote” instead of a straight \", a missing\n" +
      "     comma between items, or an extra comma after the LAST item in a list."]);
    return null;
  }
}

function isNum(n) { return typeof n === "number" && !isNaN(n); }
function isStr(s) { return typeof s === "string" && s.length > 0; }

// ---- goal.json ----
(function () {
  const d = read("goal.json");
  if (!d) return;
  if (typeof d !== "object" || Array.isArray(d)) { errors.push(["goal.json", "Should be a single { ... } block with 'raised' and 'tiers'."]); return; }
  if (!isNum(d.raised) || d.raised < 0) errors.push(["goal.json", "'raised' should be a number of dollars, like 250 (no $ sign, no quotes)."]);
  if (!Array.isArray(d.tiers) || !d.tiers.length) { errors.push(["goal.json", "'tiers' should be a list with at least one goal."]); return; }
  d.tiers.forEach((t, i) => {
    const w = "goal.json tier #" + (i + 1);
    if (!isNum(t.pts)) errors.push([w, "'pts' should be a number (the game points)."]);
    if (!isNum(t.need) || t.need <= 0) errors.push([w, "'need' should be a dollar amount, like 150 (no $ sign, no quotes)."]);
    if (!isNum(t.priority)) warnings.push([w, "'priority' should be a number (what gets funded first)."]);
    if (!isStr(t.label)) errors.push([w, "'label' (the short name) is missing."]);
    if (!isStr(t.note)) warnings.push([w, "'note' (the description) is empty."]);
  });
  ok.push("goal.json - raised $" + d.raised.toLocaleString() + ", " + d.tiers.length + " tiers");
})();

// ---- posts.json ----
(function () {
  const d = read("posts.json");
  if (!d) return;
  if (!Array.isArray(d)) { errors.push(["posts.json", "Should be a list [ ... ] of posts."]); return; }
  let shown = 0, templates = 0;
  d.forEach((p, i) => {
    const w = "posts.json post #" + (i + 1);
    if (!p || typeof p !== "object") { errors.push([w, "This post isn't a proper { ... } block."]); return; }
    if (p.template === true) { templates++; return; }      // the copy-me block; skip strict checks
    shown++;
    if (!isStr(p.date) || !/^\d{4}-\d{2}-\d{2}$/.test(p.date))
      errors.push([w, "'date' should look like \"2026-10-02\" (year-month-day, in quotes)."]);
    if (!isStr(p.by)) warnings.push([w, "'by' (who wrote it) is empty."]);
    const body = Array.isArray(p.body) ? p.body : (isStr(p.body) ? [p.body] : null);
    if (!body || !body.length) errors.push([w, "'body' is empty - add at least one paragraph in quotes."]);
    else body.forEach((para, j) => { if (!isStr(para)) errors.push([w, "paragraph #" + (j + 1) + " should be text in \"quotes\"."]); });
    if (isStr(p.photo)) {
      const img = path.join(__dirname, "..", "photos", p.photo);
      if (!fs.existsSync(img)) warnings.push([w, "photo \"" + p.photo + "\" isn't in the photos/ folder yet, so it won't show."]);
    }
  });
  ok.push("posts.json - " + shown + " post" + (shown === 1 ? "" : "s") + (templates ? " (+" + templates + " template, not published)" : ""));
})();

// ---- thanks.json ----
(function () {
  const d = read("thanks.json");
  if (!d) return;
  if (!Array.isArray(d)) { errors.push(["thanks.json", "Should be a list [ ... ] (use [] when it's empty)."]); return; }
  d.forEach((t, i) => {
    const w = "thanks.json entry #" + (i + 1);
    if (!t || typeof t !== "object") { errors.push([w, "Should be a { \"who\": ..., \"what\": ... } block."]); return; }
    if (!isStr(t.who)) errors.push([w, "'who' (name or \"Anonymous\") is missing."]);
    if (!isStr(t.what)) warnings.push([w, "'what' (e.g. \"donation\") is empty."]);
  });
  ok.push("thanks.json - " + d.length + " thank-you" + (d.length === 1 ? "" : "s"));
})();

// ---- products.json ----
(function () {
  const d = read("products.json");
  if (!d) return;
  if (!Array.isArray(d)) { errors.push(["products.json", "Should be a list [ ... ] of items."]); return; }
  d.forEach((p, i) => {
    const w = "products.json item #" + (i + 1);
    if (!p || typeof p !== "object") { errors.push([w, "Should be a { \"name\": ..., \"description\": ..., \"price\": ... } block."]); return; }
    if (!isStr(p.name)) errors.push([w, "'name' is missing."]);
    if (!isStr(p.description)) warnings.push([w, "'description' is empty."]);
    if (!isStr(p.price) && !isNum(p.price)) warnings.push([w, "'price' is empty (e.g. \"$8\" or \"from $25\")."]);
  });
  ok.push("products.json - " + d.length + " item" + (d.length === 1 ? "" : "s"));
})();

// ---- report ----
console.log("\nChecking Mighty Bees data files...\n");
ok.forEach(line => console.log("  ✓ " + line));
if (warnings.length) {
  console.log("\n  Heads up (not blocking, but worth a look):");
  warnings.forEach(([f, m]) => console.log("  ⚠ " + f + ": " + m));
}
if (errors.length) {
  console.log("\n  Problems to fix before publishing:");
  errors.forEach(([f, m]) => console.log("  ✗ " + f + ": " + m));
  console.log("\nFound " + errors.length + " problem" + (errors.length === 1 ? "" : "s") + ". Fix the red ✗ lines, then run the check again.\n");
  process.exit(1);
}
console.log("\nAll good! Safe to publish. 🐝\n");
process.exit(0);

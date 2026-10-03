# Mighty Bees Robotics - website

The live site: **https://mightybeesrobotics.org**

It's one page. All the words and numbers that change come from four files in the
**`data/`** folder, so you can update the site **without ever touching the code**.
Edit a file on GitHub, commit, and the site updates itself in about a minute.

> **Golden rule:** if a data file has a typo in it, only *that* section of the
> page goes blank - the rest of the site keeps working. So a mistake is never a
> disaster. Still, run the checker (below) before you publish.

---

## Who edits what

| You want to... | Edit this file |
|---|---|
| Add a build-log post | `data/posts.json` |
| Update the money raised or the goals | `data/goal.json` |
| Add a thank-you | `data/thanks.json` |
| Change the shop items | `data/products.json` |

Don't edit `index.html` or anything else unless you mean to.

---

## How to edit on GitHub (no computer setup needed)

1. Go to the file on GitHub (e.g. `data/posts.json`).
2. Click the **pencil ✏️** (top right) to edit.
3. Make your change (see the shapes below).
4. Scroll down, write a short note like "added Oct 10 post", click **Commit changes**.
5. Wait ~1 minute, then refresh the site.

**Three rules that prevent 99% of mistakes:**
- Always use **straight quotes** `"like this"`, never curly “smart quotes”. (Phones and Word love to auto-change them - watch out.)
- Every item in a list is separated by a **comma**, except the **last** one, which has **no** comma after it.
- Don't delete the `[ ]` or `{ }` brackets.

---

## Adding a build-log post (`data/posts.json`)

The **first block in the file is a template** marked `"template": true`. It never
shows on the site - it's there for you to copy. To add a post:

1. Copy the whole template block (from its `{` to its `}`, including the comma after).
2. Paste it right below.
3. Change `"template": true` to `"template": false` (or delete that line).
4. Fill in your words. **Newest posts go at the top.**

A finished post looks like this:

```json
{
  "date": "2026-10-10",
  "by": "Maria",
  "title": "",
  "body": [
    "First paragraph of what happened this week.",
    "Second paragraph. Add as many as you want."
  ],
  "photo": "",
  "caption": ""
}
```

- `date` - `"YYYY-MM-DD"`, e.g. `"2026-10-10"`.
- `by` - your first name (this is the credit that shows on the post).
- `title` - optional headline; leave as `""` if you don't want one.
- `body` - a list of paragraphs, each in quotes. A full web link starting with
  `http` becomes clickable automatically.
- `photo` / `caption` - optional (see Photos below). Leave as `""` if none.

## Money and goals (`data/goal.json`)

```json
{
  "raised": 0,
  "tiers": [
    { "pts": 50, "need": 1020, "priority": 1, "label": "A second robot", "note": "Why it matters." }
  ]
}
```

- `raised` - total raised so far, a plain number of dollars (no `$`, no quotes).
- Each tier: `pts` (game points on the tower), `need` (its cost in dollars),
  `priority` (what the money fills first - 1 before 2 before 3...), `label`, `note`.

## Thank-yous (`data/thanks.json`)

```json
[
  { "who": "The Alvarez family", "what": "donation" },
  { "who": "Anonymous", "what": "sponsorship" }
]
```

Use `"Anonymous"` unless they said it's OK to use their name. Never put an amount.
When it's empty, leave it as `[]` and the section shows "Be the first."

## Shop items (`data/products.json`)

```json
[
  { "name": "Name keychain", "description": "Your name, your colors.", "price": "$8" }
]
```

`price` is text, so `"from $25"` is fine too.

---

## Photos

- Put image files in the **`photos/`** folder, then reference the file name in a
  post's `"photo"` field (e.g. `"photo": "field-build.jpg"`).
- Use **`.jpg`** and keep them reasonably small (phones shoot huge files -
  resize to around 1200px wide so the page loads fast).
- **Shoot the robot and the work, not students' faces,** until media releases are
  confirmed.

---

## Check your work before publishing

If you have Node installed on a computer, from this folder run:

```
npm run check
```

(or `node scripts/check.js`). It reads all four data files and tells you in plain
English if anything's wrong - missing commas, smart quotes, empty fields - and
won't let a broken file reach the site unnoticed. Green ✓ means you're good.

---

## For whoever maintains the code

- Static site, **no build step, no backend, no framework.** Hosted on GitHub
  Pages from `main` at the repo root; a commit to `main` publishes.
- Custom domain via the `CNAME` file; DNS is on Cloudflare (A records → GitHub
  Pages IPs, `www` CNAME → `mighty-bees.github.io`), HTTPS enforced.
- `team@mightybeesrobotics.org` forwards to the coach via Cloudflare Email Routing.
- Config that isn't content (team number, contact email, payment link) lives in a
  small `<script>` block near the top of `index.html`.
- The page `fetch()`es the data files, so to preview locally you need a tiny web
  server (`python3 -m http.server`) - opening `index.html` directly with `file://`
  will show empty sections.

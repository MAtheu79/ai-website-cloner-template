# Page Topology — github.com/fishaudio/fish-speech

Target: GitHub repository landing page (Code tab) for `fishaudio/fish-speech`.
Captured in GitHub's dark theme (`data-color-mode="auto"`, resolved to dark). Light theme was not
extracted — out of scope for this pass; dark is the pixel-perfect reference.

## Sections, top to bottom

1. **TopNav** (flow element, not sticky in observed scroll) — GitHub mark, org/repo
   breadcrumb ("fishaudio / fish-speech"), primary nav (Code, Issues, Pull requests, Discussions,
   Actions, Security and quality, Insights) each with counts where applicable, search box,
   notification/create/actions icons, avatar. bg `#010409`, 1px bottom border `#3d444d` (inset shadow).
2. **RepoHeader** — repo icon + name + "Public" badge (pill, bordered, no fill), right-aligned
   Watch/Fork/Star split-buttons each with dropdown caret and a numeric counter badge.
3. **RepoSubNav** — branch selector ("main", 6 branches), tag count (14 Tags), "Go to file" search
   input, "Add file" dropdown button, green "Code" button (clone/download dropdown).
4. **CommitBar** — author avatar, author name (bold), commit message (link to PR), short commit
   SHA (link), "last month" relative date, right-aligned "732 Commits" link with history icon.
5. **FileTree** — table of rows (folders first, then files), each row: type icon, name (link),
   last commit message (truncated, link to PR), relative last-changed date (right aligned).
6. **ReadmeSection** — tab bar (README / License), edit + outline icons, rendered README.md
   markdown body inside a bordered card.
7. **Sidebar** (right column, flows beside TopNav content down through FileTree/Readme) —
   About (description, website link, topic pills, Readme/License/Activity/Custom properties
   links, star/watch/fork counts, Report repository), Releases (latest + count), Deployments
   (latest + count), Contributors (avatar grid + count), Languages (segmented bar + legend).
8. **Footer** — GitHub mark + copyright, links row (Terms, Privacy, Security, Status, Community,
   Docs, Contact, Manage cookies, Do not share my personal information).

## Layout

- Two-column grid below RepoSubNav: main content ~70%, sidebar ~30%, gap ~24px, both columns
  start at the same top edge; sidebar content is independently stacked (not sticky in this
  capture).
- Content is inset with consistent side padding; no hard max-width beyond the viewport at
  1440–1568px test widths (GitHub's real max-width is ~1280px at larger viewports — implemented
  as `max-w-[1280px] mx-auto`).
- Overlays: none observed static (no open dropdowns captured this pass).

## Interaction model per section

- TopNav: static chrome, hover states on nav items/icons only.
- RepoHeader buttons: click-driven dropdowns (not opened/inspected this pass — treated as
  static split-buttons with a caret, no dropdown content captured).
- FileTree rows: hover background change on row.
- ReadmeSection tabs (README/License): click-driven tab switch.
- Sidebar: static; links have underline-on-hover.
- No scroll-driven behaviors were observed while scrolling this page (no sticky header change,
  no IntersectionObserver-driven animations, no scroll-snap).

## Responsive

Not exhaustively swept at 768/390 this pass (time-boxed). Applying GitHub's well-documented
responsive convention: sidebar collapses below the file tree/readme column on narrow viewports,
TopNav collapses secondary nav items behind a hamburger. Implemented with standard Tailwind
`lg:`/`md:` breakpoints rather than extracted values.

## Real data captured (used verbatim by builders)

- Repo: `fishaudio/fish-speech`, description "SOTA Open Source TTS", homepage
  `https://speech.fish.audio`, topics: `tts`, `transformer`, `llama`, `valle`, `vqvae`, `vits`,
  `vqgan`.
- Stats: 31,122 stars, 2,663 forks, 160 watchers (subscribers_count), 14 open issues, 6 branches,
  14 tags, 732 commits, default branch `main`.
- Latest release: `V1.5.1` on May 31, 2025; 14 releases total (13 more).
- Deployments: `github-pages`, last month; 307 total.
- Contributors: 98 total; top 14 (real logins/avatars downloaded to `public/images/avatars/`):
  leng-yue, AnyaCoder, PoTaTo-Mika, Stardust-minus, Whale-Dolphin, pre-commit-ci[bot], wishhyt,
  Enucatl, Tps-F, v3ucn, PriesiaMioShirakana, Picus303, OedoSoldier, eltociear.
- Languages: Python 80.8%, TypeScript 14.3%, Dockerfile 3.0%, Jupyter Notebook 1.2%, CSS 0.5%,
  JavaScript 0.1%, Other 0.1% (colors: Python `#3572A5`, TypeScript `#3178c6`, Dockerfile
  `#384d54`, Jupyter Notebook `#DA5B0B`, CSS `#563d7c`, JavaScript `#f1e05a`).
- Latest commit bar: author `Kaihui-AMD`, message "Add AMD ROCm Docker support (RDNA3/RDNA4)
  (#1292)", SHA `e5e2926`, "last month".
- Root file/dir listing with real last-commit message + relative date (top to bottom):
  `.github` dir — "[fix]: fix docker push problem (#1121)" — 9 months ago
  `awesome_webui` dir — "Add awesome webui, update readme. (#1211)" — 4 months ago
  `docker` dir — "Add AMD ROCm Docker support (RDNA3/RDNA4) (#1292)" — last month
  `docs` dir — "Add AMD ROCm Docker support (RDNA3/RDNA4) (#1292)" — last month
  `fish_speech` dir — "Adding Local (#1282)" — 2 months ago
  `tools` dir — "fix: update broken import in quantize tool (#1249)" — 4 months ago
  `.dockerignore` — "S2 beta (#1164)" — 4 months ago
  `.gitignore` — "S2 beta (#1167)" — 4 months ago
  `.pre-commit-config.yaml` — "[pre-commit.ci] pre-commit autoupdate (#1259)" — 2 months ago
  `.project-root` — "Handle adaptive number of codebooks" — 2 years ago
  `.readthedocs.yaml` — "Use readthedocs instead of github action" — 3 years ago
  `API_FLAGS.txt` — "fix flags" — last year
  `LICENSE` — "S2 beta (#1164)" — 4 months ago
  `README.md` — "docs: add pointer to vLLM Omni for Fish Audio S2 inferenc…" — 2 months ago
  `compose.base.yml` — "fix(docker): bump CUDA 12.6 → 12.9 for Blackwell (sm_12…" — 4 months ago
  `compose.rocm.yml` — "Add AMD ROCm Docker support (RDNA3/RDNA4) (#1292)" — last month
  `compose.yml` — "Docker overhaul. (#1100)" — 10 months ago
  `dockerfile.dev` — "Fix dockerfile for pyaudio (#623)" — 2 years ago
  `entrypoint.sh` — "Make WebUI and API code cleaner (+ 1.5 fixes) (#703)" — 2 years ago
  `inference.ipynb` — "Docker overhaul. (#1100)" — 10 months ago
  `mkdocs.yml` — "S2 beta (#1167)" — 4 months ago
  `pyproject.toml` — "fix(deps): resolve protobuf conflict from descript-audiotoo…" — 4 months ago
  `pyrightconfig.json` — "Update pre-commit hook" — 3 years ago
  `uv.lock` — "fix(deps): resolve protobuf conflict from descript-audiotoo…" — 4 months ago
- Footer links: Terms, Privacy, Security, Status, Community, Docs, Contact, Manage cookies,
  Do not share my personal information. Copyright: "© 2026 GitHub, Inc."

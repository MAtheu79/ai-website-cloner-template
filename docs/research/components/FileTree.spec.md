# FileTree Specification

## Overview
- **Target file:** `src/components/FileTree.tsx`
- **Screenshot:** none attached — rely on the description below.
- **Interaction model:** static list; each row has a hover background change
  (`hover:bg-[#151b23]` or similar subtle lightening) and the name + commit message are links
  (underline on hover).

## DOM Structure
A table-like list (use a `<div>` with rows, not a real `<table>`, for easier styling) directly
below `RepoHeader`'s Row 3 commit bar, sharing the same bordered box (`border: 1px solid #3d444d`,
no top border since it's contiguous with the commit bar above, `border-radius: 0 0 6px 6px` on
the last row only).

Each row: `[type icon] [name link] .......... [commit message link, truncated] [relative date]`
- Type icon: `FolderIcon` (color `#4493f8`, GitHub's real folder icon is tinted blue) for
  directories, `FileIcon` (color `#9198a1`) for files.
- Name: `color: #4493f8` for directories? No — directory/file NAMES are default text color
  `#f0f6fc` with `hover:underline`, only the folder ICON is blue-tinted.
- Commit message: `color: #9198a1`, `fontSize: 12px`, `whiteSpace: nowrap`, `overflow: hidden`,
  `textOverflow: ellipsis`, takes remaining flexible width between name and date.
- Date: `color: #9198a1`, `fontSize: 12px`, right-aligned, fixed width, no wrap.
- Row height: `~40px`, horizontal padding `16px`, border-bottom `1px solid #3d444d` between rows
  (omit on the very last row).

## Data (real content, render verbatim, folders first then files, in this exact order)

```
type  | name                     | commitMessage                                                        | date
dir   | .github                  | [fix]: fix docker push problem (#1121)                               | 9 months ago
dir   | awesome_webui            | Add awesome webui, update readme. (#1211)                            | 4 months ago
dir   | docker                   | Add AMD ROCm Docker support (RDNA3/RDNA4) (#1292)                    | last month
dir   | docs                     | Add AMD ROCm Docker support (RDNA3/RDNA4) (#1292)                    | last month
dir   | fish_speech              | Adding Local (#1282)                                                 | 2 months ago
dir   | tools                    | fix: update broken import in quantize tool (#1249)                  | 4 months ago
file  | .dockerignore            | S2 beta (#1164)                                                      | 4 months ago
file  | .gitignore               | S2 beta (#1167)                                                      | 4 months ago
file  | .pre-commit-config.yaml  | [pre-commit.ci] pre-commit autoupdate (#1259)                        | 2 months ago
file  | .project-root            | Handle adaptive number of codebooks                                  | 2 years ago
file  | .readthedocs.yaml        | Use readthedocs instead of github action                             | 3 years ago
file  | API_FLAGS.txt            | fix flags                                                            | last year
file  | LICENSE                  | S2 beta (#1164)                                                      | 4 months ago
file  | README.md                | docs: add pointer to vLLM Omni for Fish Audio S2 inference...        | 2 months ago
file  | compose.base.yml         | fix(docker): bump CUDA 12.6 → 12.9 for Blackwell (sm_12...)          | 4 months ago
file  | compose.rocm.yml         | Add AMD ROCm Docker support (RDNA3/RDNA4) (#1292)                    | last month
file  | compose.yml              | Docker overhaul. (#1100)                                             | 10 months ago
file  | dockerfile.dev           | Fix dockerfile for pyaudio (#623)                                    | 2 years ago
file  | entrypoint.sh            | Make WebUI and API code cleaner (+ 1.5 fixes) (#703)                 | 2 years ago
file  | inference.ipynb          | Docker overhaul. (#1100)                                             | 10 months ago
file  | mkdocs.yml               | S2 beta (#1167)                                                      | 4 months ago
file  | pyproject.toml           | fix(deps): resolve protobuf conflict from descript-audiotoo...       | 4 months ago
file  | pyrightconfig.json       | Update pre-commit hook                                               | 3 years ago
file  | uv.lock                  | fix(deps): resolve protobuf conflict from descript-audiotoo...       | 4 months ago
```

Define this as a typed array using the `RepoFileEntry` interface from `@/types/github` (fields:
`name`, `type: "dir" | "file"`, `lastCommitMessage`, `lastCommitDate`), then `.map()` over it to
render rows. Do not hand-write 24 near-identical JSX blocks.

## Responsive Behavior
- **Desktop (1440px):** all four columns visible as described.
- **Tablet (768px):** commit message column may shrink further (still truncates) or hide below
  `sm:` if space is tight — keep name and date visible at minimum.
- **Mobile (390px):** hide the commit-message column entirely (`hidden sm:block` on that cell);
  show only icon, name, and date.
- **Breakpoint:** `sm:` (640px).

## Assets / Imports
- Icons from `@/components/icons`: `FolderIcon`, `FileIcon`.
- Type from `@/types/github`: `RepoFileEntry`.
- Export a default React component `FileTree` with no required props (data is hardcoded inside
  the component as a `const` array — this is real, static repo data, not a generic prop API).
- Verify `npx tsc --noEmit` passes before finishing.

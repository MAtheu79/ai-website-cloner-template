import { FolderIcon, FileIcon } from "@/components/icons";
import type { RepoFileEntry } from "@/types/github";
import { cn } from "@/lib/utils";

const files: RepoFileEntry[] = [
  {
    type: "dir",
    name: ".github",
    lastCommitMessage: "[fix]: fix docker push problem (#1121)",
    lastCommitDate: "9 months ago",
  },
  {
    type: "dir",
    name: "awesome_webui",
    lastCommitMessage: "Add awesome webui, update readme. (#1211)",
    lastCommitDate: "4 months ago",
  },
  {
    type: "dir",
    name: "docker",
    lastCommitMessage: "Add AMD ROCm Docker support (RDNA3/RDNA4) (#1292)",
    lastCommitDate: "last month",
  },
  {
    type: "dir",
    name: "docs",
    lastCommitMessage: "Add AMD ROCm Docker support (RDNA3/RDNA4) (#1292)",
    lastCommitDate: "last month",
  },
  {
    type: "dir",
    name: "fish_speech",
    lastCommitMessage: "Adding Local (#1282)",
    lastCommitDate: "2 months ago",
  },
  {
    type: "dir",
    name: "tools",
    lastCommitMessage: "fix: update broken import in quantize tool (#1249)",
    lastCommitDate: "4 months ago",
  },
  {
    type: "file",
    name: ".dockerignore",
    lastCommitMessage: "S2 beta (#1164)",
    lastCommitDate: "4 months ago",
  },
  {
    type: "file",
    name: ".gitignore",
    lastCommitMessage: "S2 beta (#1167)",
    lastCommitDate: "4 months ago",
  },
  {
    type: "file",
    name: ".pre-commit-config.yaml",
    lastCommitMessage: "[pre-commit.ci] pre-commit autoupdate (#1259)",
    lastCommitDate: "2 months ago",
  },
  {
    type: "file",
    name: ".project-root",
    lastCommitMessage: "Handle adaptive number of codebooks",
    lastCommitDate: "2 years ago",
  },
  {
    type: "file",
    name: ".readthedocs.yaml",
    lastCommitMessage: "Use readthedocs instead of github action",
    lastCommitDate: "3 years ago",
  },
  {
    type: "file",
    name: "API_FLAGS.txt",
    lastCommitMessage: "fix flags",
    lastCommitDate: "last year",
  },
  {
    type: "file",
    name: "LICENSE",
    lastCommitMessage: "S2 beta (#1164)",
    lastCommitDate: "4 months ago",
  },
  {
    type: "file",
    name: "README.md",
    lastCommitMessage:
      "docs: add pointer to vLLM Omni for Fish Audio S2 inference...",
    lastCommitDate: "2 months ago",
  },
  {
    type: "file",
    name: "compose.base.yml",
    lastCommitMessage: "fix(docker): bump CUDA 12.6 → 12.9 for Blackwell (sm_12...)",
    lastCommitDate: "4 months ago",
  },
  {
    type: "file",
    name: "compose.rocm.yml",
    lastCommitMessage: "Add AMD ROCm Docker support (RDNA3/RDNA4) (#1292)",
    lastCommitDate: "last month",
  },
  {
    type: "file",
    name: "compose.yml",
    lastCommitMessage: "Docker overhaul. (#1100)",
    lastCommitDate: "10 months ago",
  },
  {
    type: "file",
    name: "dockerfile.dev",
    lastCommitMessage: "Fix dockerfile for pyaudio (#623)",
    lastCommitDate: "2 years ago",
  },
  {
    type: "file",
    name: "entrypoint.sh",
    lastCommitMessage: "Make WebUI and API code cleaner (+ 1.5 fixes) (#703)",
    lastCommitDate: "2 years ago",
  },
  {
    type: "file",
    name: "inference.ipynb",
    lastCommitMessage: "Docker overhaul. (#1100)",
    lastCommitDate: "10 months ago",
  },
  {
    type: "file",
    name: "mkdocs.yml",
    lastCommitMessage: "S2 beta (#1167)",
    lastCommitDate: "4 months ago",
  },
  {
    type: "file",
    name: "pyproject.toml",
    lastCommitMessage:
      "fix(deps): resolve protobuf conflict from descript-audiotoo...",
    lastCommitDate: "4 months ago",
  },
  {
    type: "file",
    name: "pyrightconfig.json",
    lastCommitMessage: "Update pre-commit hook",
    lastCommitDate: "3 years ago",
  },
  {
    type: "file",
    name: "uv.lock",
    lastCommitMessage:
      "fix(deps): resolve protobuf conflict from descript-audiotoo...",
    lastCommitDate: "4 months ago",
  },
];

export default function FileTree() {
  return (
    <div
      className="overflow-hidden rounded-b-[6px] border border-t-0 border-[#3d444d]"
      role="table"
      aria-label="Repository files"
    >
      {files.map((entry, index) => {
        const isLast = index === files.length - 1;
        const Icon = entry.type === "dir" ? FolderIcon : FileIcon;

        return (
          <div
            key={entry.name}
            role="row"
            className={cn(
              "flex h-10 items-center gap-2 px-4 hover:bg-[#151b23]",
              !isLast && "border-b border-[#3d444d]",
            )}
          >
            <Icon
              className="size-4 shrink-0"
              style={{ color: entry.type === "dir" ? "#4493f8" : "#9198a1" }}
            />
            <a
              href="#"
              className="shrink-0 truncate text-sm text-[#f0f6fc] hover:underline"
            >
              {entry.name}
            </a>
            <a
              href="#"
              className="hidden min-w-0 flex-1 truncate text-xs text-[#9198a1] hover:underline sm:block"
              style={{ whiteSpace: "nowrap" }}
            >
              {entry.lastCommitMessage}
            </a>
            <span className="ml-auto w-24 shrink-0 text-right text-xs whitespace-nowrap text-[#9198a1]">
              {entry.lastCommitDate}
            </span>
          </div>
        );
      })}
    </div>
  );
}

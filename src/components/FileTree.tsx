import { FolderIcon, FileIcon } from "@/components/icons";
import type { RepoFileEntry } from "@/types/github";
import { cn } from "@/lib/utils";

const files: RepoFileEntry[] = [
  {
    type: "dir",
    name: ".github/workflows",
    lastCommitMessage:
      "Fix: Prevent repo linter from crashing on deletion-only PRs (#4283)",
    lastCommitDate: "last month",
  },
  {
    type: "dir",
    name: "media",
    lastCommitMessage: "Meta tweaks",
    lastCommitDate: "2 years ago",
  },
  {
    type: "file",
    name: ".editorconfig",
    lastCommitMessage: "add .editorconfig",
    lastCommitDate: "10 years ago",
  },
  {
    type: "file",
    name: ".gitattributes",
    lastCommitMessage: "Prevent the lint script from affecting repo language stats",
    lastCommitDate: "5 years ago",
  },
  {
    type: "file",
    name: "awesome.md",
    lastCommitMessage: "Fix typo (#3975)",
    lastCommitDate: "5 months ago",
  },
  {
    type: "file",
    name: "code-of-conduct.md",
    lastCommitMessage: "Fix typos (#2835)",
    lastCommitDate: "3 years ago",
  },
  {
    type: "file",
    name: "contributing.md",
    lastCommitMessage: "Improve contribution instructions for beginners (#3856)",
    lastCommitDate: "6 months ago",
  },
  {
    type: "file",
    name: "create-list.md",
    lastCommitMessage: "Remove Yeoman generator suggestion (#4299)",
    lastCommitDate: "last month",
  },
  {
    type: "file",
    name: "license",
    lastCommitMessage: "Use HTTPS links",
    lastCommitDate: "6 years ago",
  },
  {
    type: "file",
    name: "pull_request_template.md",
    lastCommitMessage: "Update GitHub topics docs link (#4146)",
    lastCommitDate: "2 months ago",
  },
  {
    type: "file",
    name: "readme.md",
    lastCommitMessage: "Remove 17 archived awesome lists (#4278)",
    lastCommitDate: "2 months ago",
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

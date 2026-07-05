import Image from "next/image";
import {
  ChevronDownIcon,
  EyeIcon,
  FileIcon,
  GitBranchIcon,
  HistoryIcon,
  RepoForkedIcon,
  SearchIcon,
  StarIcon,
  TagIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

const buttonBase =
  "flex h-7 items-center gap-1 border border-[#3d444d] bg-[#212830] px-3 text-xs font-medium text-[#f0f6fc]";

function SplitCountButton({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: string;
}) {
  return (
    <div className="flex h-7 rounded-md border border-[#3d444d]">
      <button
        type="button"
        className={cn(
          buttonBase,
          "rounded-l-md border-0 border-r border-[#3d444d]"
        )}
      >
        {icon}
        <span className="hidden md:inline">{label}</span>
        <ChevronDownIcon className="size-3" />
      </button>
      <span
        className={cn(
          buttonBase,
          "min-w-[2.5rem] justify-center rounded-r-md border-0"
        )}
      >
        {count}
      </span>
    </div>
  );
}

export default function RepoHeader() {
  return (
    <div className="px-4">
      {/* Row 1 — Repo title bar */}
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileIcon className="size-4 text-[#9198a1]" />
          <h1 className="text-[20px] font-semibold text-[#f0f6fc]">
            fish-speech
          </h1>
          <span className="rounded-full border border-[#3d444d] px-1.5 py-0 text-xs font-medium text-[#9198a1]">
            Public
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SplitCountButton
            icon={<EyeIcon className="size-4" />}
            label="Watch"
            count="160"
          />
          <SplitCountButton
            icon={<RepoForkedIcon className="size-4" />}
            label="Fork"
            count="2.7k"
          />
          <SplitCountButton
            icon={<StarIcon className="size-4" />}
            label="Star"
            count="31.1k"
          />
        </div>
      </div>

      {/* Row 2 — Sub nav */}
      <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="flex h-7 items-center gap-1 rounded-md border border-[#3d444d] bg-[#212830] px-3 text-xs font-medium text-[#f0f6fc]"
          >
            <GitBranchIcon className="size-4" />
            <span>main</span>
            <ChevronDownIcon className="size-3" />
          </button>

          <div className="flex items-center gap-3 border-l border-[#3d444d] pl-3">
            <a
              href="#"
              className="flex items-center gap-1 text-xs font-medium text-[#9198a1] hover:text-[#f0f6fc]"
            >
              <GitBranchIcon className="size-3.5" />
              6 Branches
            </a>
            <a
              href="#"
              className="flex items-center gap-1 text-xs font-medium text-[#9198a1] hover:text-[#f0f6fc]"
            >
              <TagIcon className="size-3.5" />
              14 Tags
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-full items-center gap-2 rounded-full border border-[#3d444d] bg-[#212830] px-3 text-xs text-[#9198a1] sm:w-64"
          >
            <SearchIcon className="size-3.5" />
            <span>Go to file</span>
          </button>

          <button
            type="button"
            className="flex h-7 items-center gap-1 rounded-md border border-[#3d444d] bg-[#212830] px-3 text-xs font-medium text-[#f0f6fc]"
          >
            <span>Add file</span>
            <ChevronDownIcon className="size-3" />
          </button>

          <button
            type="button"
            className="flex h-7 items-center gap-1 rounded-md bg-[#238636] px-3 text-xs font-medium text-[#f0f6fc]"
          >
            <span className="font-mono">{"</>"}</span>
            <span>Code</span>
            <ChevronDownIcon className="size-3" />
          </button>
        </div>
      </div>

      {/* Row 3 — Latest commit bar */}
      <div className="flex flex-col gap-2 rounded-t-md border border-[#3d444d] bg-[#161b22] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <Image
            src="/images/avatars/fishaudio.png"
            alt="Kaihui-AMD"
            width={20}
            height={20}
            className="size-5 shrink-0 rounded-full"
          />
          <span className="shrink-0 font-semibold text-[#f0f6fc]">
            Kaihui-AMD
          </span>
          <span className="truncate text-[#f0f6fc]">
            Add AMD ROCm Docker support (RDNA3/RDNA4){" "}
            <a href="#" className="text-[#4493f8] hover:underline">
              (#1292)
            </a>
          </span>
          <a
            href="#"
            className="shrink-0 font-mono text-[#4493f8] hover:underline"
          >
            e5e2926
          </a>
          <span className="shrink-0 text-[#9198a1]">·</span>
          <span className="shrink-0 text-[#9198a1]">last month</span>
        </div>

        <a
          href="#"
          className="flex shrink-0 items-center gap-1 text-xs text-[#f0f6fc] hover:underline"
        >
          <HistoryIcon className="size-4" />
          732 Commits
        </a>
      </div>
    </div>
  );
}

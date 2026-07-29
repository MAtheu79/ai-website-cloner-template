import Image from "next/image";
import {
  BellIcon,
  ChevronDownIcon,
  FileIcon,
  GitBranchIcon,
  HeartIcon,
  HistoryIcon,
  RepoForkedIcon,
  SearchIcon,
  StarIcon,
  TagIcon,
} from "@/components/icons";

function PillButton({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count?: string;
}) {
  return (
    <button
      type="button"
      className="flex h-7 items-center gap-1 rounded-md border border-[#3d444d] bg-[#212830] px-3 text-xs font-medium text-[#f0f6fc]"
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
      {count ? (
        <span className="ml-1 border-l border-[#3d444d] pl-1.5">
          {count}
        </span>
      ) : null}
    </button>
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
            awesome
          </h1>
          <span className="rounded-full border border-[#3d444d] px-1.5 py-0 text-xs font-medium text-[#9198a1]">
            Public
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PillButton icon={<HeartIcon className="size-4 text-[#db61a2]" />} label="Sponsor" />
          <PillButton icon={<BellIcon className="size-4" />} label="Notifications" />
          <PillButton
            icon={<RepoForkedIcon className="size-4" />}
            label="Fork"
            count="36.1k"
          />
          <PillButton
            icon={<StarIcon className="size-4" />}
            label="Star"
            count="490k"
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
              2 Branches
            </a>
            <a
              href="#"
              className="flex items-center gap-1 text-xs font-medium text-[#9198a1] hover:text-[#f0f6fc]"
            >
              <TagIcon className="size-3.5" />
              0 Tags
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
            src="/images/avatars/dar5hak.png"
            alt="dar5hak"
            width={20}
            height={20}
            className="size-5 shrink-0 rounded-full"
          />
          <span className="shrink-0 font-semibold text-[#f0f6fc]">
            dar5hak
          </span>
          <span className="truncate text-[#f0f6fc]">
            Remove Yeoman generator suggestion{" "}
            <a href="#" className="text-[#4493f8] hover:underline">
              (#4299)
            </a>
          </span>
          <a
            href="#"
            className="shrink-0 font-mono text-[#4493f8] hover:underline"
          >
            7cb5c83
          </a>
          <span className="shrink-0 text-[#9198a1]">·</span>
          <span className="shrink-0 text-[#9198a1]">last month</span>
        </div>

        <a
          href="#"
          className="flex shrink-0 items-center gap-1 text-xs text-[#f0f6fc] hover:underline"
        >
          <HistoryIcon className="size-4" />
          1,206 Commits
        </a>
      </div>
    </div>
  );
}

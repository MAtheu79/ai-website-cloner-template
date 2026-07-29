import Image from "next/image"
import {
  BellIcon,
  ChevronDownIcon,
  MarkGithubIcon,
  PlusIcon,
  SearchIcon,
  ThreeBarsIcon,
} from "@/components/icons"
import { cn } from "@/lib/utils"

interface NavTab {
  label: string
  count?: number
  active?: boolean
}

const NAV_TABS: NavTab[] = [
  { label: "Code", active: true },
  { label: "Issues", count: 16 },
  { label: "Pull requests", count: 82 },
  { label: "Actions" },
  { label: "Security and quality" },
  { label: "Insights" },
]

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M4.72 3.22a.75.75 0 0 1 1.06 1.06L2.06 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L.47 8.53a.75.75 0 0 1 0-1.06Zm6.56 0a.75.75 0 1 0-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06Z" />
    </svg>
  )
}

function IssueOpenedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
    </svg>
  )
}

function GitPullRequestIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
    </svg>
  )
}

function CommentDiscussionIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M1.75 1h8.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 10.25 10H7.061l-2.574 2.573A1.458 1.458 0 0 1 2 11.543V10h-.25A1.75 1.75 0 0 1 0 8.25v-5.5C0 1.784.784 1 1.75 1ZM1.5 2.75v5.5c0 .138.112.25.25.25h1a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h3.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25Z" />
      <path d="M14.5 4.75a.25.25 0 0 0-.25-.25h-.5a.75.75 0 0 1 0-1.5h.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 14.25 12H14v1.543a1.458 1.458 0 0 1-2.487 1.03L9.22 12.28a.75.75 0 1 1 1.06-1.06l2.22 2.22v-2.19a.75.75 0 0 1 .75-.75h1a.25.25 0 0 0 .25-.25Z" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z" />
    </svg>
  )
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="m8.533.133 5.25 1.68A1.75 1.75 0 0 1 15 3.48V7c0 1.566-.32 3.182-1.303 4.682-.983 1.498-2.585 2.813-5.032 3.855a1.7 1.7 0 0 1-1.33 0c-2.447-1.042-4.049-2.357-5.032-3.855C1.32 10.182 1 8.566 1 7V3.48a1.75 1.75 0 0 1 1.217-1.667l5.25-1.68a1.748 1.748 0 0 1 1.066 0Zm-.61 1.429.001.001-5.25 1.68a.25.25 0 0 0-.174.238V7c0 1.358.275 2.666 1.057 3.86.784 1.194 2.121 2.34 4.366 3.297a.2.2 0 0 0 .154 0c2.245-.956 3.582-2.104 4.366-3.298C13.225 9.666 13.5 8.36 13.5 7V3.48a.25.25 0 0 0-.174-.237l-5.25-1.68a.253.253 0 0 0-.153-.001Zm.976 3.588a.75.75 0 0 1 .146 1.052l-2.723 3.63a.75.75 0 0 1-1.078.114l-1.5-1.375a.75.75 0 1 1 1.012-1.106l.917.84 2.174-2.9a.75.75 0 0 1 1.052-.145Z" />
    </svg>
  )
}

function GraphIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 2.28 11.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l5.25-5.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z" />
    </svg>
  )
}

const TAB_ICONS: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  Code: CodeIcon,
  Issues: IssueOpenedIcon,
  "Pull requests": GitPullRequestIcon,
  Discussions: CommentDiscussionIcon,
  Actions: PlayIcon,
  "Security and quality": ShieldCheckIcon,
  Insights: GraphIcon,
}

export default function TopNav() {
  return (
    <header className="w-full bg-gh-header text-[#f0f6fc] border-b border-gh-border text-sm leading-[21px]">
      {/* Row 1: logo, breadcrumb, search, icons, avatar */}
      <div className="flex h-14 items-center gap-2 px-4 md:px-8">
        <button
          type="button"
          aria-label="Toggle navigation"
          className="mr-1 flex h-8 w-8 items-center justify-center rounded-md text-[#f0f6fc] hover:bg-white/10 md:hidden"
        >
          <ThreeBarsIcon className="h-5 w-5" />
        </button>

        <a
          href="#"
          aria-label="Homepage"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full hover:bg-white/10"
        >
          <MarkGithubIcon className="h-6 w-6 text-[#f0f6fc]" />
        </a>

        <div className="hidden items-center gap-1 pl-1 md:flex">
          <a
            href="#"
            className="font-normal text-[#f0f6fc] hover:text-[#4493f8] hover:underline"
          >
            sindresorhus
          </a>
          <span className="text-[#9198a1]">/</span>
          <a
            href="#"
            className="font-semibold text-[#f0f6fc] hover:text-[#4493f8] hover:underline"
          >
            awesome
          </a>
          <button
            type="button"
            aria-label="Switch repository context"
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#9198a1] hover:bg-white/10 hover:text-[#f0f6fc]"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="hidden h-7 w-8 items-center justify-center rounded-md border border-gh-border bg-[#0d1117] text-[#9198a1] hover:border-[#6e7681] md:hidden"
            aria-label="Search"
          >
            <SearchIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            className={cn(
              "hidden h-7 items-center gap-2 rounded-md border border-gh-border bg-[#0d1117] px-3 text-xs text-[#9198a1] hover:border-[#6e7681] lg:flex lg:w-80"
            )}
          >
            <SearchIcon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-left">Type / to search</span>
            <span className="rounded-[3px] border border-gh-border px-1 text-[#9198a1]">/</span>
          </button>

          <button
            type="button"
            aria-label="Search"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#9198a1] hover:bg-white/10 hover:text-[#f0f6fc] lg:hidden"
          >
            <SearchIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Create new"
            className="hidden h-8 items-center gap-1 rounded-md px-2 text-[#9198a1] hover:bg-white/10 hover:text-[#f0f6fc] md:flex"
          >
            <PlusIcon className="h-4 w-4" />
            <ChevronDownIcon className="h-3 w-3" />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="hidden h-8 w-8 items-center justify-center rounded-md text-[#9198a1] hover:bg-white/10 hover:text-[#f0f6fc] md:flex"
          >
            <BellIcon className="h-4 w-4" />
          </button>

          <a href="#" aria-label="View profile" className="flex-shrink-0">
            <Image
              src="/images/avatars/sindresorhus.png"
              alt="sindresorhus"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
          </a>
        </div>
      </div>

      {/* Row 2: nav tabs */}
      <div className="hidden h-10 items-center gap-1 overflow-x-auto px-4 md:flex md:gap-4 lg:gap-1 lg:px-8">
        {NAV_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.label]
          return (
            <a
              key={tab.label}
              href="#"
              className={cn(
                "flex h-10 items-center gap-2 border-b-2 border-transparent px-2 text-sm font-normal text-[#9198a1] hover:text-[#f0f6fc]",
                tab.active && "border-[#4493f8] text-[#f0f6fc]"
              )}
            >
              {Icon ? <Icon className="h-4 w-4 flex-shrink-0" /> : null}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span className="rounded-full bg-[#212830] px-1.5 text-xs text-[#9198a1]">
                  {tab.count}
                </span>
              )}
            </a>
          )
        })}
      </div>
    </header>
  )
}

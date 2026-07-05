import { MarkGithubIcon } from "@/components/icons"

const FOOTER_LINKS = [
  "Terms",
  "Privacy",
  "Security",
  "Status",
  "Community",
  "Docs",
  "Contact",
  "Manage cookies",
  "Do not share my personal information",
] as const

export default function SiteFooter() {
  return (
    <footer className="mt-12 flex flex-col items-center gap-3 px-4 py-10 text-xs text-[#9198a1]">
      <div className="flex items-center gap-2">
        <MarkGithubIcon className="size-4 text-[#9198a1]" />
        <span>&copy; 2026 GitHub, Inc.</span>
      </div>
      <ul className="flex flex-wrap justify-center gap-4">
        {FOOTER_LINKS.map((label) => (
          <li key={label}>
            <a href="#" className="hover:text-foreground hover:underline">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  )
}

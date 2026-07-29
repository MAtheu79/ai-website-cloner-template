import Image from "next/image";
import {
  BookIcon,
  EyeIcon,
  HandshakeIcon,
  HeartIcon,
  LawIcon,
  LinkExternalIcon,
  PeopleIcon,
  PulseIcon,
  RepoForkedIcon,
  StarIcon,
} from "@/components/icons";
import type { Contributor, TopicTag } from "@/types/github";

const topics: TopicTag[] = [
  { label: "awesome", href: "https://github.com/topics/awesome" },
  { label: "awesome-list", href: "https://github.com/topics/awesome-list" },
  { label: "lists", href: "https://github.com/topics/lists" },
  { label: "resources", href: "https://github.com/topics/resources" },
  { label: "unicorns", href: "https://github.com/topics/unicorns" },
];

const contributors: Contributor[] = [
  { login: "sindresorhus", avatarSrc: "/images/avatars/sindresorhus.png" },
  { login: "davisonio", avatarSrc: "/images/avatars/davisonio.png" },
  { login: "RichardLitt", avatarSrc: "/images/avatars/RichardLitt.png" },
  { login: "arthurvr", avatarSrc: "/images/avatars/arthurvr.png" },
  { login: "kdeldycke", avatarSrc: "/images/avatars/kdeldycke.png" },
  { login: "AllThingsSmitty", avatarSrc: "/images/avatars/AllThingsSmitty.png" },
  { login: "PatrickJS", avatarSrc: "/images/avatars/PatrickJS.png" },
  { login: "RayBB", avatarSrc: "/images/avatars/RayBB.png" },
  { login: "stevestock", avatarSrc: "/images/avatars/stevestock.png" },
  { login: "johnjago", avatarSrc: "/images/avatars/johnjago.png" },
  { login: "fabacab", avatarSrc: "/images/avatars/fabacab.png" },
  { login: "egeerardyn", avatarSrc: "/images/avatars/egeerardyn.png" },
  { login: "mischah", avatarSrc: "/images/avatars/mischah.png" },
  { login: "vinkla", avatarSrc: "/images/avatars/vinkla.png" },
];

function CountBadge({ count }: { count: number }) {
  return (
    <span
      className="rounded-full text-[#9198a1]"
      style={{ fontSize: 12, backgroundColor: "#212830", padding: "0 6px" }}
    >
      {count}
    </span>
  );
}

function SidebarHeading({
  children,
  count,
}: {
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <h2
      className="flex items-center gap-2"
      style={{ fontSize: 16, fontWeight: 600 }}
    >
      {children}
      {count !== undefined ? <CountBadge count={count} /> : null}
    </h2>
  );
}

export default function RepoSidebar() {
  return (
    <div className="flex w-full flex-col">
      {/* Section 1 — About */}
      <section
        className="flex flex-col"
        style={{ borderBottom: "1px solid #3d444d", padding: "16px 0" }}
      >
        <SidebarHeading>About</SidebarHeading>
        <p style={{ fontSize: 16, color: "#f0f6fc", margin: "8px 0" }}>
          😎 Awesome lists about all kinds of interesting topics
        </p>

        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 8 }}>
          {topics.map((topic) => (
            <a
              key={topic.label}
              href={topic.href}
              className="flex items-center hover:underline"
              style={{
                backgroundColor: "rgba(56,139,253,0.1)",
                color: "#4493f8",
                borderRadius: 24,
                padding: "0 10px",
                height: 24,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {topic.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col" style={{ marginTop: 12, gap: 8 }}>
          <a
            href="#readme"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <BookIcon width={16} height={16} />
            Readme
          </a>
          <a
            href="#CC0-1.0-1-ov-file"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <LawIcon width={16} height={16} />
            CC0-1.0 license
          </a>
          <a
            href="#coc-ov-file"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <HandshakeIcon width={16} height={16} />
            Code of conduct
          </a>
          <a
            href="#contributing-ov-file"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <PeopleIcon width={16} height={16} />
            Contributing
          </a>
          <a
            href="#activity"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <PulseIcon width={16} height={16} />
            Activity
          </a>
        </div>

        <div className="flex flex-col" style={{ marginTop: 12, gap: 8 }}>
          <a
            href="#stargazers"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <StarIcon width={16} height={16} />
            490.3k stars
          </a>
          <a
            href="#watchers"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <EyeIcon width={16} height={16} />
            8.3k watching
          </a>
          <a
            href="#forks"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <RepoForkedIcon width={16} height={16} />
            36.1k forks
          </a>
        </div>

        <a
          href="#report-repository"
          className="hover:underline"
          style={{ fontSize: 14, color: "#9198a1", marginTop: 12 }}
        >
          Report repository
        </a>
      </section>

      {/* Section 2 — Sponsor this project */}
      <section
        className="flex flex-col"
        style={{ borderBottom: "1px solid #3d444d", padding: "16px 0" }}
      >
        <SidebarHeading>Sponsor this project</SidebarHeading>

        <div
          className="flex items-center justify-between"
          style={{ marginTop: 12 }}
        >
          <a
            href="https://github.com/sindresorhus"
            className="flex items-center hover:underline"
            style={{ gap: 8 }}
          >
            <Image
              src="/images/avatars/sindresorhus.png"
              alt="@sindresorhus"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span style={{ fontSize: 14 }}>
              <strong style={{ color: "#f0f6fc" }}>sindresorhus</strong>{" "}
              <span style={{ color: "#9198a1" }}>Sindre Sorhus</span>
            </span>
          </a>
          <a
            href="https://github.com/sponsors/sindresorhus"
            aria-label="Sponsor @sindresorhus"
            className="flex items-center justify-center rounded-md border border-[#3d444d]"
            style={{ width: 32, height: 32, color: "#db61a2" }}
          >
            <HeartIcon width={16} height={16} />
          </a>
        </div>

        <div className="flex flex-col" style={{ marginTop: 12, gap: 10 }}>
          <a
            href="https://opencollective.com/sindresorhus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:underline"
            style={{ gap: 8, fontSize: 14, color: "#f0f6fc" }}
          >
            <Image
              src="/images/badges/open-collective.svg"
              alt=""
              width={20}
              height={20}
            />
            opencollective.com/sindresorhus
          </a>
          <a
            href="https://buymeacoffee.com/sindresorhus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:underline"
            style={{ gap: 8, fontSize: 14, color: "#f0f6fc" }}
          >
            <Image
              src="/images/badges/buy-me-a-coffee.svg"
              alt=""
              width={20}
              height={20}
            />
            buymeacoffee.com/sindresorhus
          </a>
          <a
            href="https://sindresorhus.com/donate"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:underline"
            style={{ gap: 8, fontSize: 14, color: "#f0f6fc" }}
          >
            <LinkExternalIcon width={16} height={16} />
            sindresorhus.com/donate
          </a>
        </div>

        <a
          href="/sponsors"
          className="hover:underline"
          style={{ fontSize: 14, color: "#4493f8", marginTop: 12 }}
        >
          Learn more about GitHub Sponsors
        </a>
      </section>

      {/* Section 3 — Contributors */}
      <section className="flex flex-col" style={{ padding: "16px 0" }}>
        <SidebarHeading count={621}>Contributors</SidebarHeading>

        <div className="flex flex-wrap" style={{ marginTop: 12, gap: 4 }}>
          {contributors.map((contributor) => (
            <a
              key={contributor.login}
              href={`https://github.com/${contributor.login}`}
              title={contributor.login}
            >
              <Image
                src={contributor.avatarSrc}
                alt={contributor.login}
                width={28}
                height={28}
                className="rounded-full"
              />
            </a>
          ))}
        </div>

        <a
          href="https://github.com/sindresorhus/awesome/graphs/contributors"
          className="hover:underline"
          style={{ fontSize: 14, color: "#4493f8", marginTop: 12 }}
        >
          + 607 contributors
        </a>
      </section>
    </div>
  );
}

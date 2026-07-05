import Image from "next/image";
import {
  BookIcon,
  EyeIcon,
  LinkExternalIcon,
  ListUnorderedIcon,
  PulseIcon,
  RepoForkedIcon,
  ShieldIcon,
  StarIcon,
  TagIcon,
} from "@/components/icons";
import type { Contributor, LanguageStat, TopicTag } from "@/types/github";

const topics: TopicTag[] = [
  { label: "tts", href: "https://github.com/topics/tts" },
  { label: "transformer", href: "https://github.com/topics/transformer" },
  { label: "llama", href: "https://github.com/topics/llama" },
  { label: "valle", href: "https://github.com/topics/valle" },
  { label: "vqvae", href: "https://github.com/topics/vqvae" },
  { label: "vits", href: "https://github.com/topics/vits" },
  { label: "vqgan", href: "https://github.com/topics/vqgan" },
];

const contributors: Contributor[] = [
  { login: "leng-yue", avatarSrc: "/images/avatars/leng-yue.png" },
  { login: "AnyaCoder", avatarSrc: "/images/avatars/AnyaCoder.png" },
  { login: "PoTaTo-Mika", avatarSrc: "/images/avatars/PoTaTo-Mika.png" },
  { login: "Stardust-minus", avatarSrc: "/images/avatars/Stardust-minus.png" },
  { login: "Whale-Dolphin", avatarSrc: "/images/avatars/Whale-Dolphin.png" },
  { login: "pre-commit-ci", avatarSrc: "/images/avatars/pre-commit-ci.png" },
  { login: "wishhyt", avatarSrc: "/images/avatars/wishhyt.png" },
  { login: "Enucatl", avatarSrc: "/images/avatars/Enucatl.png" },
  { login: "Tps-F", avatarSrc: "/images/avatars/Tps-F.png" },
  { login: "v3ucn", avatarSrc: "/images/avatars/v3ucn.png" },
  {
    login: "PriesiaMioShirakana",
    avatarSrc: "/images/avatars/PriesiaMioShirakana.png",
  },
  { login: "Picus303", avatarSrc: "/images/avatars/Picus303.png" },
  { login: "OedoSoldier", avatarSrc: "/images/avatars/OedoSoldier.png" },
  { login: "eltociear", avatarSrc: "/images/avatars/eltociear.png" },
];

const languages: LanguageStat[] = [
  { name: "Python", percent: 80.8, color: "#3572A5" },
  { name: "TypeScript", percent: 14.3, color: "#3178c6" },
  { name: "Dockerfile", percent: 3.0, color: "#384d54" },
  { name: "Jupyter Notebook", percent: 1.2, color: "#DA5B0B" },
  { name: "CSS", percent: 0.5, color: "#563d7c" },
  { name: "JavaScript", percent: 0.1, color: "#f1e05a" },
  { name: "Other", percent: 0.1, color: "#8256d0" },
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
          SOTA Open Source TTS
        </p>

        <div className="flex items-center gap-2">
          <LinkExternalIcon
            width={16}
            height={16}
            style={{ color: "#4493f8" }}
          />
          <a
            href="https://speech.fish.audio"
            className="hover:underline"
            style={{ color: "#4493f8", fontSize: 14 }}
          >
            speech.fish.audio
          </a>
        </div>

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
            href="#license"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <ShieldIcon width={16} height={16} />
            View license
          </a>
          <a
            href="#activity"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <PulseIcon width={16} height={16} />
            Activity
          </a>
          <a
            href="#custom-properties"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <ListUnorderedIcon width={16} height={16} />
            Custom properties
          </a>
        </div>

        <div className="flex flex-col" style={{ marginTop: 12, gap: 8 }}>
          <a
            href="#stargazers"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <StarIcon width={16} height={16} />
            31.1k stars
          </a>
          <a
            href="#watchers"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <EyeIcon width={16} height={16} />
            160 watching
          </a>
          <a
            href="#forks"
            className="flex items-center hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", gap: 8 }}
          >
            <RepoForkedIcon width={16} height={16} />
            2.7k forks
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

      {/* Section 2 — Releases */}
      <section
        className="flex flex-col"
        style={{ borderBottom: "1px solid #3d444d", padding: "16px 0" }}
      >
        <SidebarHeading count={14}>Releases</SidebarHeading>

        <div style={{ marginTop: 12 }}>
          <a
            href="#latest-release"
            className="flex items-center hover:underline"
            style={{ gap: 8 }}
          >
            <TagIcon width={16} height={16} style={{ color: "#3fb950" }} />
            <span style={{ fontSize: 14, color: "#f0f6fc" }}>V1.5.1</span>
            <span
              className="rounded-full"
              style={{
                backgroundColor: "rgba(63,185,80,0.1)",
                color: "#3fb950",
                fontSize: 12,
                padding: "0 8px",
              }}
            >
              Latest
            </span>
          </a>
          <p style={{ fontSize: 12, color: "#9198a1", marginTop: 4 }}>
            on May 31, 2025
          </p>
        </div>

        <a
          href="#releases"
          className="hover:underline"
          style={{ fontSize: 14, color: "#4493f8", marginTop: 12 }}
        >
          + 13 releases
        </a>
      </section>

      {/* Section 3 — Deployments */}
      <section
        className="flex flex-col"
        style={{ borderBottom: "1px solid #3d444d", padding: "16px 0" }}
      >
        <SidebarHeading count={307}>Deployments</SidebarHeading>

        <div className="flex items-center" style={{ marginTop: 12, gap: 8 }}>
          <span
            className="rounded-full"
            style={{
              width: 8,
              height: 8,
              backgroundColor: "#3fb950",
              display: "inline-block",
            }}
          />
          <a
            href="#deployments"
            className="hover:underline"
            style={{ fontSize: 14, color: "#f0f6fc", fontWeight: 500 }}
          >
            github-pages
          </a>
          <span style={{ fontSize: 14, color: "#9198a1" }}>last month</span>
        </div>

        <a
          href="#deployments"
          className="hover:underline"
          style={{ fontSize: 14, color: "#4493f8", marginTop: 12 }}
        >
          + 306 deployments
        </a>
      </section>

      {/* Section 4 — Contributors */}
      <section
        className="flex flex-col"
        style={{ borderBottom: "1px solid #3d444d", padding: "16px 0" }}
      >
        <SidebarHeading count={98}>Contributors</SidebarHeading>

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
          href="#contributors"
          className="hover:underline"
          style={{ fontSize: 14, color: "#4493f8", marginTop: 12 }}
        >
          + 84 contributors
        </a>
      </section>

      {/* Section 5 — Languages */}
      <section className="flex flex-col" style={{ padding: "16px 0" }}>
        <SidebarHeading>Languages</SidebarHeading>

        <div
          className="flex overflow-hidden"
          style={{ height: 8, borderRadius: 9999, marginTop: 12 }}
        >
          {languages.map((language) => (
            <span
              key={language.name}
              style={{
                width: `${language.percent}%`,
                backgroundColor: language.color,
              }}
            />
          ))}
        </div>

        <div
          className="flex flex-wrap"
          style={{ marginTop: 12, columnGap: 16, rowGap: 8 }}
        >
          {languages.map((language) => (
            <div
              key={language.name}
              className="flex items-center"
              style={{ width: "45%", gap: 6, fontSize: 12 }}
            >
              <span
                className="rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: language.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "#f0f6fc" }}>{language.name}</span>
              <span style={{ color: "#9198a1" }}>{language.percent}%</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState, type ReactNode, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import {
  BookIcon,
  ShieldIcon,
  PencilIcon,
  ListUnorderedIcon,
  InfoIcon,
  AlertIcon,
} from "@/components/icons";

interface ReadmeTabsProps {
  readmeContent: string;
}

type TabId = "readme" | "license";

type AlertKind = "IMPORTANT" | "WARNING";

const ALERT_CONFIG: Record<
  AlertKind,
  { label: string; color: string; background: string; icon: typeof InfoIcon }
> = {
  IMPORTANT: {
    label: "Important",
    color: "#8957e5",
    background: "rgba(137,87,229,0.1)",
    icon: InfoIcon,
  },
  WARNING: {
    label: "Warning",
    color: "#d29922",
    background: "rgba(210,153,34,0.1)",
    icon: AlertIcon,
  },
};

/**
 * Recursively extracts the plain-text content of a React node tree.
 * Used to detect the `[!IMPORTANT]` / `[!WARNING]` marker line that
 * remark-gfm leaves untouched inside blockquote children.
 */
function extractText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  if (
    typeof node === "object" &&
    "props" in node &&
    node.props !== null &&
    typeof node.props === "object" &&
    "children" in node.props
  ) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

function detectAlertKind(children: ReactNode): AlertKind | null {
  const text = extractText(children).trim();
  if (text.startsWith("[!IMPORTANT]")) return "IMPORTANT";
  if (text.startsWith("[!WARNING]")) return "WARNING";
  return null;
}

/**
 * Strips the leading `[!IMPORTANT]` / `[!WARNING]` marker paragraph from a
 * blockquote's children, since it's rendered separately as a labeled header.
 */
function stripMarkerLine(children: ReactNode): ReactNode {
  const nodes = Array.isArray(children) ? children : [children];
  const [first, ...rest] = nodes;

  if (
    first !== null &&
    typeof first === "object" &&
    "props" in first &&
    first.props !== null &&
    typeof first.props === "object" &&
    "children" in first.props
  ) {
    const innerChildren = (first.props as { children?: ReactNode }).children;
    const innerNodes = Array.isArray(innerChildren) ? innerChildren : [innerChildren];
    const [, ...innerRest] = innerNodes;
    const strippedFirst = { ...first, props: { ...first.props, children: innerRest } };
    return [strippedFirst, ...rest];
  }

  return rest;
}

type BlockquoteProps = ComponentPropsWithoutRef<"blockquote"> & ExtraProps;

function Blockquote({ children, node, ...props }: BlockquoteProps) {
  void node;
  const alertKind = detectAlertKind(children);

  if (alertKind) {
    const config = ALERT_CONFIG[alertKind];
    const AlertGlyph = config.icon;
    const content = stripMarkerLine(children);

    return (
      <div
        className="mb-4 rounded-md py-2 px-4"
        style={{
          borderLeft: `4px solid ${config.color}`,
          backgroundColor: config.background,
          borderRadius: "6px",
          padding: "8px 16px",
        }}
      >
        <p
          className="mb-2 flex items-center gap-2 font-semibold"
          style={{ color: config.color }}
        >
          <AlertGlyph style={{ color: config.color }} />
          {config.label}
        </p>
        {content}
      </div>
    );
  }

  return <blockquote {...props}>{children}</blockquote>;
}

export default function ReadmeTabs({ readmeContent }: ReadmeTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("readme");

  return (
    <div
      className="rounded-b-md"
      style={{ border: "1px solid #3d444d", borderRadius: "0 0 6px 6px" }}
    >
      <div
        className="flex h-12 items-center justify-between px-4"
        style={{ borderBottom: "1px solid #3d444d" }}
      >
        <div className="flex h-full items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("readme")}
            className={cn(
              "flex h-full items-center gap-2 border-b-2 text-sm font-medium",
              activeTab === "readme" ? "border-current" : "border-transparent",
            )}
            style={{
              color: activeTab === "readme" ? "#f0f6fc" : "#9198a1",
              borderBottomColor: activeTab === "readme" ? "#f0f6fc" : "transparent",
            }}
            aria-pressed={activeTab === "readme"}
          >
            <BookIcon />
            README
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("license")}
            className={cn(
              "flex h-full items-center gap-2 border-b-2 text-sm font-medium",
              activeTab === "license" ? "border-current" : "border-transparent",
            )}
            style={{
              color: activeTab === "license" ? "#f0f6fc" : "#9198a1",
              borderBottomColor: activeTab === "license" ? "#f0f6fc" : "transparent",
            }}
            aria-pressed={activeTab === "license"}
          >
            <ShieldIcon />
            License
          </button>
        </div>
        <div className="flex items-center gap-4" style={{ color: "#9198a1" }}>
          <button type="button" aria-label="Edit file" className="flex items-center">
            <PencilIcon />
          </button>
          <button type="button" aria-label="Outline" className="flex items-center">
            <ListUnorderedIcon />
          </button>
        </div>
      </div>

      {activeTab === "readme" ? (
        <div className="p-4 sm:p-8">
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{ blockquote: Blockquote }}
            >
              {readmeContent}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-8">
          <div className="markdown-body">
            <p>
              This repository is released under the{" "}
              <strong>FISH AUDIO RESEARCH LICENSE</strong>. See the LICENSE file
              in the repository for full terms.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

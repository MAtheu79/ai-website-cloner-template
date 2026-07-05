import fs from "fs";
import path from "path";
import ReadmeTabs from "@/components/ReadmeTabs";

export default async function ReadmeSection() {
  const readmeContent = fs.readFileSync(
    path.join(process.cwd(), "src/content/fish-speech-readme.md"),
    "utf-8",
  );

  return <ReadmeTabs readmeContent={readmeContent} />;
}

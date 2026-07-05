import TopNav from "@/components/TopNav";
import RepoHeader from "@/components/RepoHeader";
import FileTree from "@/components/FileTree";
import RepoSidebar from "@/components/RepoSidebar";
import ReadmeSection from "@/components/ReadmeSection";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <TopNav />
      <div className="mx-auto max-w-[1280px]">
        <RepoHeader />
        <div className="grid grid-cols-1 gap-6 px-4 pb-10 lg:grid-cols-[1fr_296px]">
          <div className="min-w-0 space-y-6">
            <FileTree />
            <ReadmeSection />
          </div>
          <RepoSidebar />
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

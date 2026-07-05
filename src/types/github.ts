export interface RepoFileEntry {
  name: string;
  type: "dir" | "file";
  lastCommitMessage: string;
  lastCommitDate: string;
}

export interface Contributor {
  login: string;
  avatarSrc: string;
}

export interface LanguageStat {
  name: string;
  percent: number;
  color: string;
}

export interface TopicTag {
  label: string;
  href: string;
}

export interface RepoMeta {
  owner: string;
  name: string;
  description: string;
  homepage: string;
  topics: TopicTag[];
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  openPullRequests: number;
  branchCount: number;
  tagCount: number;
  releaseCount: number;
  latestReleaseVersion: string;
  latestReleaseDate: string;
  deploymentCount: number;
  contributorCount: number;
  defaultBranch: string;
  totalCommits: number;
}

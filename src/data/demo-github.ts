export type DemoGithubSnapshot = {
  memberId: string;
  date: string;
  summaryText: string;
};

const D = "2026-02-18";

export const demoGithub: DemoGithubSnapshot[] = [
  {
    memberId: "m1",
    date: D,
    summaryText: `- Reviewed PR #184: "Unify token refresh middleware" (left comments on retry policy)
- Opened issue #92: "Add request tracing + request-id propagation"
- Commented on PR #181: "Dashboard evidence modal UX fixes"`,
  },
  {
    memberId: "m2",
    date: D,
    summaryText: `- Pushed 3 commits to backend/auth: add refresh endpoint, cache refresh token results, add request-id header
- Opened PR #184: "Unify token refresh middleware"
- Commented on issue #77: "429 spike investigation"`,
  },
  {
    memberId: "m3",
    date: D,
    summaryText: `- Merged PR #181: "Dashboard table + evidence modal"
- Opened PR #186: "Search dialog UI + alpha slider"
- 2 commits to ui/standup-drawer: polish submission flow and empty states`,
  },
  {
    memberId: "m4",
    date: D,
    summaryText: `- Opened draft PR #183: "GitHub OAuth callback route skeleton"
- 2 commits to client/http: experimental 401 retry wrapper (needs alignment with backend middleware)
- Commented on PR #184 about removing duplicate refresh logic`,
  },
  {
    memberId: "m5",
    date: D,
    summaryText: `- Updated CI config: added logs for random seed + parallelism flags
- Added prisma migration script and SQLite dev setup
- Added script: load-demo-data (resets DB and seeds demo team + standups)`,
  },
  {
    memberId: "m6",
    date: D,
    summaryText: `- Created experiment branch: extraction-evidence-first
- Added JSON schema draft for ExtractedUpdate (yesterday/today/blockers + evidence ids)
- Opened issue #95: "Duplicate/conflict heuristic for tasks"`,
  },
  {
    memberId: "m7",
    date: D,
    summaryText: `- Opened bug #96: "Evidence modal shows wrong member name sometimes"
- Added regression test draft for /api/extract/run output shape
- Commented on CI flake issue with reproduction steps`,
  },
  {
    memberId: "m8",
    date: D,
    summaryText: `- Updated README with demo script and success criteria
- Added copy for Integrations tab (Hyperspell GitHub/Notion)
- Created demo-notes.md with timed click path for live presentation`,
  },
];

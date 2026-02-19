export type DemoStandup = {
  memberId: string;
  date: string;
  transcriptText: string;
};

const D = "2026-02-18";

export const demoStandups: DemoStandup[] = [
  {
    memberId: "m1",
    date: D,
    transcriptText: `Yesterday I did three things.
First, I reviewed the auth flow changes from Ben and Diego. We currently have two parallel implementations of token refresh logic, and that's risky.
Second, I drafted a short ADR for how we should handle rate limits consistently: where we retry, where we fail fast, and how we surface it in the UI.
Third, I helped Grace reproduce the flaky CI test. It's the same spec failing in two different ways, which smells like test isolation issues.
Today I want to converge the auth refresh logic into a single module with clear ownership, and I'll pair with Ben on the backend piece.
I'll also align with Chloe on the error messaging for rate limit vs auth expired, so we don't confuse users.
Blockers: I still don't have clarity on whether our rate limit spikes come from our own retry storms or from the upstream provider. We need better request tracing.`,
  },
  {
    memberId: "m2",
    date: D,
    transcriptText: `Yesterday I implemented a token refresh endpoint on the backend and added a small in-memory cache to avoid hammering the auth provider.
I also adjusted the API client to include a request id header so we can correlate logs later.
Finally I investigated the rate limit errors: I believe they're mostly caused by our own retries stacking up when the provider returns 429.
Today I'll refactor the auth refresh into a single middleware so the rest of the API routes don't each reinvent the wheel.
I'll also add basic metrics: refresh attempts, refresh success rate, and 429 counts by route.
Blockers: I need someone to confirm the frontend behavior when refresh fails. Right now the UI sometimes loops and that could be amplifying the retry storm.`,
  },
  {
    memberId: "m3",
    date: D,
    transcriptText: `Yesterday I worked on the dashboard layout: member rows, Yesterday/Today/Blockers columns, and the evidence modal.
I also added a top search bar with filters for member and source, and a semantic weight slider, though it's not wired to a real semantic backend yet.
I fixed a UI bug where the extraction status badge didn't update after running extraction.
Today I'll polish the standup submission drawer: better empty states, and a "paste transcript" flow that's fast.
I'll also implement the jump-to-evidence interaction so when you click a search result it opens the correct member and highlights the chunk.
Blockers: I'm blocked on the final shape of the ExtractedUpdate JSON. I need a stable schema for yesterday/today/blockers plus evidence ids.`,
  },
  {
    memberId: "m4",
    date: D,
    transcriptText: `Yesterday I tried wiring the OAuth callback route for the GitHub integration. I got the redirect working end-to-end, but token storage is still stubbed.
I also wrote a quick parser that takes a transcript and extracts candidate tasks by looking for verbs and bullet-like phrasing.
Separately, I started an alternative approach for token refresh on the client side, using a fetch wrapper that retries once on 401.
Today I'll remove the duplicate client refresh logic if we agree backend middleware is the single source of truth.
I'll help Ethan with a small endpoint to ingest GitHub activity summaries into chunks, so we can search them.
Blockers: I'm not sure if our 429s are from the upstream provider or from GitHub itself. The error payloads look inconsistent, so we should normalize them.`,
  },
  {
    memberId: "m5",
    date: D,
    transcriptText: `Yesterday I looked into the flaky CI pipeline. The failures correlate with parallel test runs, so I suspect shared state in the test DB.
I also created a lightweight SQLite dev database setup with Prisma migrations to match production shape.
And I added a "Load Demo Data" script so we can reset the environment quickly for demos.
Today I'll isolate the flaky spec by forcing serial execution for that test suite and adding a random seed log so we can reproduce.
I'll also add request tracing middleware and propagate request ids into server logs.
Blockers: I need agreement on what we consider a pass for today's demo. If we can't ship real OAuth, we should keep Live mode returning 501 but make Demo mode flawless.`,
  },
  {
    memberId: "m6",
    date: D,
    transcriptText: `Yesterday I prototyped the extraction step. I used an evidence-first approach: split transcript into chunks, retrieve likely sentences for yesterday/today/blockers, then format into a JSON object.
I also drafted a simple dedupe strategy: compute similarity between tasks and flag potential duplicates if overlap is high.
Today I'll refine the output schema: each item should include a short action statement plus references to evidence chunk ids.
If we have time, I'll add a lightweight "topic cluster" view so we can see what themes multiple people mention.
Blockers: Without a real semantic search service, the retrieval step is currently keyword based. That's okay for demo, but we should keep the interface compatible with Moss later.`,
  },
  {
    memberId: "m7",
    date: D,
    transcriptText: `Yesterday I tested the end-to-end flow in Demo mode. I found two UX issues: after submission, the member status doesn't instantly flip to "submitted", and evidence modal sometimes shows wrong member name.
I also reproduced the flaky CI test locally. It fails when run after the auth tests, which suggests leftover env variables or shared mocks.
Today I'll write a small checklist for demo readiness: reset data, submit 2 members, run extraction, show dashboard, then show search and evidence.
I'll also add one integration test for the /api/extract/run route so we don't break the JSON shape.
Blockers: I need the final "duplicate/conflict" logic definition. Even a simple heuristic is fine, but we should be consistent in what we call duplication.`,
  },
  {
    memberId: "m8",
    date: D,
    transcriptText: `Yesterday I aligned the story for the demo. The narrative is: engineers hate synchronous standups, so we turn them into async updates that are searchable and evidence-backed.
I also wrote the copy for the Integrations tab to explain why Hyperspell matters: connect GitHub and Notion, then the dashboard becomes a living team memory.
Finally, I collected a few example queries for search like "auth refresh", "rate limit", "flaky CI", and "demo mode".
Today I'll run the demo dry-run with the team and time it to under two minutes.
I'll also define success criteria: show one member submission, one GitHub snapshot, run extraction, show duplicates/conflicts, then search and open evidence.
Blockers: None technically. The main risk is spending too long on Live integrations. I'd rather we keep Live as a visible but optional path.`,
  },
];

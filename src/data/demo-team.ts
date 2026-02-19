export type DemoMember = {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
};

export const demoTeam: DemoMember[] = [
  { id: "m1", name: "Ava", role: "Tech Lead" },
  { id: "m2", name: "Ben", role: "Backend Engineer" },
  { id: "m3", name: "Chloe", role: "Frontend Engineer" },
  { id: "m4", name: "Diego", role: "Full-stack Engineer" },
  { id: "m5", name: "Ethan", role: "Infra / DevOps" },
  { id: "m6", name: "Fatima", role: "ML / Data" },
  { id: "m7", name: "Grace", role: "QA Engineer" },
  { id: "m8", name: "Hiro", role: "PM" },
];

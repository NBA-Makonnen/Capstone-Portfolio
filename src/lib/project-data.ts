export type ProjectCategory = "AWS" | "Front-end";

export interface ProjectRecord {
  title: string;
  category: ProjectCategory;
  summary: string;
  highlights: string[];
  hasLiveDemo: boolean;
}

// Kept small and honest on purpose: every field here is a field the model
// could otherwise hallucinate if it had to guess. highlights stays short —
// 2-3 concrete points, not a full case study dump.
export const projects: ProjectRecord[] = [
  {
    title: "Serverless Web Application",
    category: "AWS",
    summary:
      "A fully serverless app on S3, CloudFront, Lambda, and DynamoDB — no dedicated servers.",
    highlights: [
      "Frontend served from S3 via CloudFront for low-latency delivery",
      "Lambda handles requests; DynamoDB handles CRUD operations",
    ],
    hasLiveDemo: false,
  },
  {
    title: "Static Web Hosting",
    category: "AWS",
    summary: "A static site on S3 with cross-region replication and lifecycle-managed storage.",
    highlights: [
      "Cross-Region Replication for disaster recovery",
      "Versioning and lifecycle policies to control storage cost",
    ],
    hasLiveDemo: false,
  },
  {
    title: "Dynamic Website",
    category: "AWS",
    summary: "A café app on EC2, deployed across two AWS regions for resilience.",
    highlights: [
      "AMI replicated cross-region for failover",
      "Secrets Manager centralizes credentials in both regions",
    ],
    hasLiveDemo: false,
  },
  {
    title: "Migrating a database to Amazon RDS",
    category: "AWS",
    summary: "Migrated a web app's database from local MariaDB to RDS in a private subnet.",
    highlights: [
      "Credentials moved to Secrets Manager",
      "EC2 access via Systems Manager Session Manager, not SSH",
    ],
    hasLiveDemo: false,
  },
  {
    title: "Creating a VPC Network Environment",
    category: "AWS",
    summary: "A VPC with public and private subnets, secured with a Bastion Host and NAT Gateway.",
    highlights: [
      "Bastion Host allows SSH to the private instance without direct exposure",
      "NAT Gateway allows outbound-only internet access from the private subnet",
    ],
    hasLiveDemo: false,
  },
  {
    title: "Creating a Scalable & Highly Available Environment",
    category: "AWS",
    summary: "A multi-AZ VPC with load-balanced, auto-scaling app servers.",
    highlights: [
      "Application Load Balancer distributes traffic across an Auto Scaling Group",
      "Tested by generating load and watching instances scale dynamically",
    ],
    hasLiveDemo: false,
  },
  {
    title: "My Portfolio",
    category: "Front-end",
    summary: "This site itself — Next.js App Router, TypeScript, Tailwind CSS, deployed on Vercel.",
    highlights: [
      "Server Components by default, Client Components only where interactive",
      "Includes this AI chat feature, streaming responses via Gemini",
    ],
    hasLiveDemo: true,
  },
  {
    title: "React Movie Search",
    category: "Front-end",
    summary: "A movie search app using the OMDB API, built with an MVVM architecture.",
    highlights: ["MVVM separation of view and logic", "Search against the OMDB API"],
    hasLiveDemo: false,
  },
  {
    title: "Accessible Components Playground",
    category: "Front-end",
    summary:
      "Three ARIA-compliant components (modal, tabs, disclosure) built from scratch, compared against shadcn/ui.",
    highlights: [
      "Correct roles and full keyboard support on all three components",
      "Found and fixed a focus-management bug in the Modal, with a regression test proving it",
    ],
    hasLiveDemo: false,
  },
];

export function findProject(name: string): ProjectRecord | undefined {
  const normalized = name.trim().toLowerCase();
  return projects.find(
    (p) =>
      p.title.toLowerCase() === normalized ||
      p.title.toLowerCase().includes(normalized) ||
      normalized.includes(p.title.toLowerCase())
  );
}
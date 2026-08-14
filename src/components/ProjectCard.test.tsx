import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ProjectRecord } from "@/lib/project-data";
import { ProjectCard } from "./ProjectCard";

const baseProject: ProjectRecord = {
  title: "Static Web Hosting",
  category: "AWS",
  summary: "A static site on S3 with cross-region replication.",
  highlights: [
    "Cross-Region Replication for disaster recovery",
    "Versioning and lifecycle policies to control storage cost",
  ],
  hasLiveDemo: false,
};

describe("ProjectCard", () => {
  it("renders the project title, category, and summary", () => {
    render(<ProjectCard project={baseProject} />);

    expect(screen.getByRole("heading", { level: 4, name: "Static Web Hosting" })).toBeInTheDocument();
    expect(screen.getByText("AWS")).toBeInTheDocument();
    expect(
      screen.getByText("A static site on S3 with cross-region replication.")
    ).toBeInTheDocument();
  });

  it("renders every highlight as a list item", () => {
    render(<ProjectCard project={baseProject} />);

    const list = screen.getByRole("list");
    const items = screen.getAllByRole("listitem");

    expect(list).toBeInTheDocument();
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Cross-Region Replication for disaster recovery");
    expect(items[1]).toHaveTextContent(
      "Versioning and lifecycle policies to control storage cost"
    );
  });

  it("shows the 'no live demo' note when hasLiveDemo is false", () => {
    render(<ProjectCard project={baseProject} />);

    expect(screen.getByText("No live demo link available.")).toBeInTheDocument();
  });

  it("does not show the 'no live demo' note when hasLiveDemo is true", () => {
    render(<ProjectCard project={{ ...baseProject, hasLiveDemo: true }} />);

    expect(screen.queryByText("No live demo link available.")).not.toBeInTheDocument();
  });
});

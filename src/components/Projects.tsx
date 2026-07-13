const projects = [
  {
    title: "AI Project Showcase",
    description:
      "Interactive portfolio entries with AI-generated summaries baked in as static content.",
    tags: ["React", "TypeScript", "Tailwind"],
  },
  {
    title: "AWS Certifications",
    description:
      "Credential display for Cloud Practitioner and related certifications.",
    tags: ["AWS", "Static Site"],
  },
];

export function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-2xl font-bold text-white">Projects</h2>
      <p className="mt-2 text-slate-400">
        Work from my AI Fluency / front-end engineering track.
      </p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <li
            key={project.title}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <h3 className="font-semibold text-white">{project.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{project.description}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

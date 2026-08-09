import { ProjectRecord } from "@/lib/project-data";

export function ProjectCard({ project }: { project: ProjectRecord }) {
  return (
    <div className="rounded-lg border border-brand/30 dark:border-brand-dark/40 bg-canvas dark:bg-canvas-dark overflow-hidden max-w-full">
      <div className="flex items-center justify-between px-3 py-2 bg-brand/10 dark:bg-brand-dark/20">
        <h4 className="font-heading text-sm font-bold">{project.title}</h4>
        <span className="text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 bg-brand dark:bg-brand-dark text-white whitespace-nowrap">
          {project.category}
        </span>
      </div>
      <div className="px-3 py-2 text-sm">
        <p className="opacity-80 mb-2">{project.summary}</p>
        <ul className="list-disc list-inside space-y-1 text-xs opacity-70">
          {project.highlights.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {!project.hasLiveDemo && (
          <p className="text-[10px] opacity-50 mt-2 italic">No live demo link available.</p>
        )}
      </div>
    </div>
  );
}
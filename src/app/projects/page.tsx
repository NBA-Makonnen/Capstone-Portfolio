const projects = [
  "Serverless Web Application",
  "Static Web Hosting",
  "Dynamic Website",
  "Migrating a database to Amazon RDS",
  "Creating a VPC Network Environment",
  "Creating a Scalable & Highly Available Environment",
];

export default function ProjectsPage() {
  return (
    <section className="px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">Projects</h1>
      <ul className="grid gap-6 sm:grid-cols-2">
        {projects.map((title) => (
          <li key={title} className="border border-brand/20 rounded p-6">
            <h2 className="font-heading text-xl">{title}</h2>
            <p className="opacity-60 text-sm mt-2">Case study coming soon.</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
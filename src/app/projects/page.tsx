const awsProjects = [
  "Serverless Web Application",
  "Static Web Hosting",
  "Dynamic Website",
  "Migrating a database to Amazon RDS",
  "Creating a VPC Network Environment",
  "Creating a Scalable & Highly Available Environment",
];

const frontendProjects = [
  "My Portfolio",
  "React Movie Search",
  "Accessible Components Playground",
];

export default function ProjectsPage() {
  return (
    <section className="px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">Projects</h1>

      <h2 className="text-2xl font-heading mb-4">AWS Projects</h2>
      <ul className="grid gap-6 sm:grid-cols-2 mb-12">
        {awsProjects.map((title) => (
          <li key={title} className="border border-brand/20 rounded p-6">
            <h3 className="font-heading text-xl">{title}</h3>
            <p className="opacity-60 text-sm mt-2">Case study coming soon.</p>
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-heading mb-4">Front-end Projects</h2>
      <ul className="grid gap-6 sm:grid-cols-2">
        {frontendProjects.map((title) => (
          <li key={title} className="border border-brand/20 rounded p-6">
            <h3 className="font-heading text-xl">{title}</h3>
            <p className="opacity-60 text-sm mt-2">Case study coming soon.</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
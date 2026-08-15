import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
      <h1 className="text-4xl font-bold max-w-2xl">
        A front-end AI engineer focused on building things that work.
      </h1>
      <p className="text-lg opacity-80 max-w-xl">
        AWS Certified Cloud Practitioner. Currently interning at FlyRank AI.
      </p>
      <Link
        href="/projects"
        className="bg-brand dark:bg-brand-dark text-white px-6 py-3 rounded font-body"
      >
        See the work
      </Link>
    </section>
  );
}
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
      <h1 className="text-4xl font-bold max-w-2xl">
        I build cloud infrastructure that survives failure — because I've broken it myself and fixed it.
      </h1>
      <p className="text-lg opacity-80 max-w-xl">
        AWS Cloud Practitioner. Currently in a front-end AI engineering internship.
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
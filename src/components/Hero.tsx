import { siteConfig } from "../data/site";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <p className="mb-3 text-sm font-medium uppercase tracking-widest text-indigo-400">
        Portfolio
      </p>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {siteConfig.name}
      </h1>
      <p className="mt-4 max-w-xl text-lg text-slate-400">{siteConfig.tagline}</p>
      <a
        href="#contact"
        className="mt-8 inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
      >
        Get in touch
      </a>
    </section>
  );
}

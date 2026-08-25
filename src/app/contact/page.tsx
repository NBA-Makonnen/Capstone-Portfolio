import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Makonnen Mulima",
  description: "Get in touch with Makonnen Mulima — book a call, download the resume, or reach out directly by email or LinkedIn.",
};

const contactLinkClasses =
  "inline-flex items-center rounded border border-brand/40 dark:border-brand-dark/40 px-4 py-2 text-sm font-medium text-ink dark:text-ink-dark hover:bg-brand/10 dark:hover:bg-brand-dark/10 transition-colors";

export default function ContactPage() {
  return (
    <section className="px-6 py-16 max-w-2xl mx-auto flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold mb-4">About &amp; Contact</h1>
        <p className="opacity-80">
          I&apos;m Makonnen Mulima, a certified AWS Cloud Practitioner and Front-end AI Engineer Intern who learns best by building things
          and troubleshooting what breaks along the way. This site is proof of both.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <a href="/resume.pdf" className={contactLinkClasses}>
            Download CV <span className="opacity-70 ml-1">(PDF)</span>
          </a>
          <a
            href="https://calendly.com/bundamulima/30min"
            target="_blank"
            rel="noopener noreferrer"
            className={contactLinkClasses}
          >
            Book a call
          </a>
          <a href="mailto:bundamulima@gmail.com" className={contactLinkClasses}>
            Email me
          </a>
          <a
            href="https://www.linkedin.com/in/makonnen-mulima-b9a685231"
            target="_blank"
            rel="noopener noreferrer"
            className={contactLinkClasses}
          >
            LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <section className="px-6 py-16 max-w-2xl mx-auto flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold mb-4">About &amp; Contact</h1>
        <p className="opacity-80">
          I&apos;m Makonnen Mulima, a certified AWS Cloud Practitioner and Front-end AI Engineer Intern who learns best by building things
          and troubleshooting what breaks along the way. This site is proof of both.
        </p>
        <a
          href="/resume.pdf"
          className="inline-block mt-4 rounded border border-brand/40 dark:border-brand-dark/40 px-4 py-2 text-sm font-medium text-brand dark:text-brand-dark hover:bg-brand/10 dark:hover:bg-brand-dark/10 transition-colors"
        >
          Download CV
        </a>
        <a
          href="https://calendly.com/bundamulima/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 ml-3 rounded border border-brand/40 dark:border-brand-dark/40 px-4 py-2 text-sm font-medium text-brand dark:text-brand-dark hover:bg-brand/10 dark:hover:bg-brand-dark/10 transition-colors"
        >
          Book a call
        </a>
      </div>
      <ContactForm />
    </section>
  );
}
import type { Metadata } from "next";
import { GlassAnchor } from "@/components/ui/GlassAnchor";

export const metadata: Metadata = {
  title: "Contact — Makonnen Mulima",
  description: "Get in touch with Makonnen Mulima — book a call, download the resume, or reach out directly by email or LinkedIn.",
};

export default function ContactPage() {
  return (
    <section className="px-6 py-16 max-w-2xl mx-auto flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold mb-4">About &amp; Contact</h1>
        <p className="opacity-80">
          I&apos;m Makonnen Mulima, a certified AWS Cloud Practitioner and Front-end AI Engineer who learns best by building things
          and troubleshooting what breaks along the way. This site is proof of both.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <GlassAnchor href="/resume.pdf">
            Download CV <span className="opacity-70 ml-1">(PDF)</span>
          </GlassAnchor>
          <GlassAnchor
            href="https://calendly.com/bundamulima/30min"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a call
          </GlassAnchor>
          <GlassAnchor href="mailto:bundamulima@gmail.com">Email me</GlassAnchor>
          <GlassAnchor
            href="https://www.linkedin.com/in/makonnen-mulima-b9a685231"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </GlassAnchor>
        </div>
      </div>
    </section>
  );
}

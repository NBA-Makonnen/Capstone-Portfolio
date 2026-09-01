import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificates — Makonnen Mulima",
  description: "Completed certifications for Makonnen Mulima, front-end AI engineer and AWS Certified Cloud Practitioner.",
};

const certifications = [
  { name: "Front-end AI Engineering (FlyRank AI)", date: "August 2026" },
  { name: "Python Developer", date: "July 2026" },
  { name: "Full Stack Development", date: "July 2025" },
  { name: "Microsoft AI Fluency", date: "May 2025" },
  { name: "Cybersecurity Essentials", date: "April 2025" },
  { name: "AWS Cloud Computing", date: "December 2024" },
  { name: "AWS Certified Cloud Practitioner", date: "August 2024" },
  { name: "AI Career Essentials (AiCE)", date: "May 2024" },
  { name: "AWS Cloud Quest (Cloud Practitioner)", date: "February 2024" },
];

export default function CertificatesPage() {
  return (
    <section className="px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">Certificates</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {certifications.map((cert) => (
          <li key={cert.name} className="border border-brand/20 rounded p-4">
            <h2 className="font-heading">{cert.name}</h2>
            <p className="opacity-70 text-sm">{cert.date}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
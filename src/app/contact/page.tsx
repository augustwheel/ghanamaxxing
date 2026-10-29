import type { Metadata } from "next";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with the Ghanamaxxing team." };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10">
      <h1 className="font-display text-5xl font-bold tracking-tight">Contact</h1>
      <p className="mt-6 text-lg text-chalk/90">
        Questions, partnerships or press: email{" "}
        <a href={`mailto:${SITE.contactEmail}`} className="underline decoration-line underline-offset-4 hover:decoration-chalk">
          {SITE.contactEmail}
        </a>
        .
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = { title: "Add yours", description: "Add an app or startup from Ghana to Ghanamaxxing." };

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 sm:pt-14">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Add a launch</h1>
      <p className="mt-3 text-lg text-muted">
        Built something, or know a Ghanaian app or startup we&apos;re missing? Add it here. No account needed. We take a
        quick look before it goes on the board.
      </p>
      <SubmitForm />
    </div>
  );
}

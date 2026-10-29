import { ImportForm } from "./import-form";
import { SEED_DEFAULT_AGE_DAYS } from "@/config/rankings";

export default function AdminImportPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">Import seeded launches</h1>
      <p className="mt-2 text-sm text-muted">
        Upload a CSV or JSON file. You&apos;ll see a preview before anything is saved. Imported launches are approved
        straight away and labelled &quot;Added by Ghanamaxxing&quot;. Rows without a <code>launched_at</code> date are
        dated {SEED_DEFAULT_AGE_DAYS} days ago so they don&apos;t flood this week&apos;s rankings. Download the{" "}
        <a href="/launches-template.csv" className="text-gold underline">CSV template</a>.
      </p>
      <ImportForm />
    </div>
  );
}

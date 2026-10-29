import { AddLaunchForm } from "./add-form";

export default function AdminNewLaunchPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Add a seeded launch</h1>
      <p className="mt-2 text-sm text-muted">Goes live straight away, labelled &quot;Added by Ghanamaxxing&quot;.</p>
      <AddLaunchForm />
    </div>
  );
}

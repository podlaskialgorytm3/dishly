import { PageForm } from "../PageForm";

export default function NewPagePage() {
  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Dodaj nową stronę</h1>
      <div className="bg-card border rounded-lg p-6">
        <PageForm />
      </div>
    </div>
  );
}

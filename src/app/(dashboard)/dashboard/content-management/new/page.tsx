import { PageForm } from "../PageForm";

export default function NewPagePage() {
  return (
    <div>
      {/* Topbar */}
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-[#1F1F1F]">
            Dodaj nową stronę
          </h1>
          <p className="mt-1 text-sm text-[#8C8C8C]">
            Utwórz nową stronę statyczną w serwisie
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <PageForm />
          </div>
        </div>
      </div>
    </div>
  );
}

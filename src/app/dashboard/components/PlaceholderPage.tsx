import Image from "next/image";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center min-h-[60vh]">
      <Image src="/logo.png" alt="Gigante Logo" width={240} height={80} className="mb-8 opacity-90" />
      <h2 className="text-3xl font-bold text-teal-600 mb-4">{title}</h2>
      <div className="bg-teal-50 px-6 py-3 rounded-full border border-teal-100">
        <span className="text-teal-800 font-semibold tracking-wide text-lg">Próxima etapa do projeto</span>
      </div>
      <p className="mt-6 text-slate-500 max-w-md">
        Esta página está planejada para ser desenvolvida e receberá os gráficos e tabelas detalhadas correspondentes em breve.
      </p>
    </div>
  );
}

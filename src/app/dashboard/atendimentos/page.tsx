import { getAtendimentosMetrics } from "./actions";
import AtendimentosDashboard from "./components/AtendimentosDashboard";

export const dynamic = "force-dynamic";

export default async function AtendimentosPage() {
  const metrics = await getAtendimentosMetrics();

  return <AtendimentosDashboard initialData={metrics} />;
}

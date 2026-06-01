import { getDashboardMetrics } from "./actions";
import DashboardContent from "./components/DashboardContent";

export const dynamic = "force-dynamic";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  
  const startParam = resolvedSearchParams.start as string;
  const endParam = resolvedSearchParams.end as string;
  
  const startDate = startParam ? new Date(startParam + "T00:00:00") : undefined;
  const endDate = endParam ? new Date(endParam + "T23:59:59.999") : undefined;

  const metrics = await getDashboardMetrics(startDate, endDate);

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardContent metrics={metrics} />
    </div>
  );
}

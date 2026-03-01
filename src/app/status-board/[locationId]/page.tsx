import { getStatusBoardOrders } from "@/actions/kitchen";
import StatusBoardClient from "./StatusBoardClient";

export const dynamic = "force-dynamic";

export default async function StatusBoardPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const data = await getStatusBoardOrders(locationId);

  return <StatusBoardClient locationId={locationId} initialData={data} />;
}

import { getStationById } from '@/lib/data';
import type { ApiResponse } from '@/types';
import type { MonitoringStation } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return Response.json({ success: false, error: 'Невірний ідентифікатор', code: 400 }, { status: 400 });
  }

  const station = getStationById(id);
  if (!station) {
    return Response.json({ success: false, error: `Станцію з id "${id}" не знайдено`, code: 404 }, { status: 404 });
  }

  const body: ApiResponse<MonitoringStation> = { success: true, data: station };
  return Response.json(body);
}

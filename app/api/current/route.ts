import { NextRequest } from 'next/server';
import { stations, getStationById } from '@/lib/data';
import type { ApiResponse, AirQualityData } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const stationId = searchParams.get('stationId');

  if (stationId) {
    const station = getStationById(stationId);
    if (!station) {
      return Response.json({ success: false, error: `Станцію "${stationId}" не знайдено`, code: 404 }, { status: 404 });
    }
    const body: ApiResponse<AirQualityData> = { success: true, data: station.currentData };
    return Response.json(body);
  }

  const all = stations.map((s) => ({ stationId: s.id, city: s.city, name: s.name, ...s.currentData }));
  const body: ApiResponse<typeof all> = { success: true, data: all };
  return Response.json(body);
}

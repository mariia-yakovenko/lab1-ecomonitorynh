import { NextRequest } from 'next/server';
import { measurementsDb, getStationById } from '@/lib/data';
import type { ApiResponse, ResponseMeta, Measurement } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const stationId = searchParams.get('stationId');
  const from = searchParams.get('from');
  const to  = searchParams.get('to');
  const page = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '24', 10)));

  if (!stationId) {
    return Response.json({ success: false, error: 'Параметр stationId є обов\'язковим', code: 400 }, { status: 400 });
  }

  if (!getStationById(stationId)) {
    return Response.json({ success: false, error: `Станцію "${stationId}" не знайдено`, code: 404 }, { status: 404 });
  }

  let measurements: Measurement[] = measurementsDb[stationId] ?? [];

  if (from) {
    const fromDate = new Date(from);
    if (isNaN(fromDate.getTime())) {
      return Response.json({ success: false, error: 'Невірний формат параметра from (очікується ISO 8601)', code: 400 }, { status: 400 });
    }
    measurements = measurements.filter((m) => new Date(m.timestamp) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    if (isNaN(toDate.getTime())) {
      return Response.json({ success: false, error: 'Невірний формат параметра to (очікується ISO 8601)', code: 400 }, { status: 400 });
    }
    measurements = measurements.filter((m) => new Date(m.timestamp) <= toDate);
  }

  const total = measurements.length;
  const totalPages = Math.ceil(total / limit);
  const data = measurements.slice((page - 1) * limit, page * limit);

  const meta: ResponseMeta = { total, page, limit, totalPages };
  const body: ApiResponse<Measurement[]> = { success: true, data, meta };

  return Response.json(body);
}

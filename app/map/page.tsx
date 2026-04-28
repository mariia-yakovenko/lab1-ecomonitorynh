import type { Metadata } from 'next';
import { stations, measurementsDb } from '@/lib/data';
import MapPageClient from '@/components/MapPageClient';

export const metadata: Metadata = { title: 'карта станцій' };

export default function MapPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>карта станцій</h1>
          <p
            style={{
              color: 'var(--color-muted)',
              fontSize: '0.9rem',
              marginTop: '0.5rem',
            }}
          >
            інтерактивна карта моніторингових станцій України
          </p>
        </div>
      </section>

      <MapPageClient stations={stations} measurements={measurementsDb} />
    </>
  );
}

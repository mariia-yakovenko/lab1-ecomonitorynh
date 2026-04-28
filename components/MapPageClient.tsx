"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { MonitoringStation, Measurement } from "@/types";
import { AqiBadge } from "./AqiBadge";
import StationCharts from "./StationCharts";

const StationMap = dynamic(() => import("./StationMap"), { ssr: false });

interface Props {
  stations: MonitoringStation[];
  measurements: Record<string, Measurement[]>;
}

export default function MapPageClient({ stations, measurements }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = stations.find((s) => s.id === selectedId) ?? null;
  const selectedMeasurements = selectedId
    ? (measurements[selectedId] ?? [])
    : [];

  return (
    <div style={{ padding: "2rem 0" }}>
      <div className="container">
        <h2 className="section-title mb-1">інтерактивна карта</h2>
        <p className="section-sub">
          оберіть станцію на карті для перегляду графіків
        </p>

        <div
          style={{
            height: 480,
            overflow: "hidden",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <StationMap
            stations={stations}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {selected && (
          <div className="mt-4">
            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  color: "var(--color-primary)",
                }}
              >
                {selected.city}
              </span>
              <strong>{selected.name}</strong>
              <AqiBadge category={selected.currentData.category} />
              <span style={{ fontWeight: 800, color: "var(--color-primary)" }}>
                AQI {selected.currentData.aqi}
              </span>
              <button
                onClick={() => setSelectedId(null)}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "99px",
                  padding: "0.18rem 0.65rem",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  background: "transparent",
                  color: "var(--color-muted)",
                  fontFamily: "inherit",
                  fontWeight: 600,
                }}
              >
                × скасувати
              </button>
            </div>

            <StationCharts
              station={selected}
              measurements={selectedMeasurements}
            />
          </div>
        )}
      </div>
    </div>
  );
}

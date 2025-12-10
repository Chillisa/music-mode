// src/components/LineChart.js
import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

export default function LineChart({ dataPoints }) {
  // dataPoints is array like:
  // [{ date: "2025-01-03", totalPlays: 12 }, ... ]

  const labels = dataPoints.map((d) => d.date);
  const values = dataPoints.map((d) => d.totalPlays);

  return (
    <div style={{ width: "100%", maxWidth: "900px", margin: "20px auto" }}>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Daily Plays",
              data: values,
              fill: true,
              borderColor: "#9d4bff",
              backgroundColor: "rgba(157, 75, 255, 0.2)",
              tension: 0.4,
              pointRadius: 3,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) => `Plays: ${ctx.raw}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "#ccc",
              },
            },
            x: {
              ticks: {
                color: "#ccc",
              },
            },
          },
        }}
      />
    </div>
  );
}

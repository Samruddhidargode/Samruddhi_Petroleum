import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

/**
 * SparklineChart - Tiny 7-day trend line (Chart.js)
 * Props:
 *   - data: array of 7 numbers representing daily values
 *   - label: chart label (e.g., "Sales Trend")
 *   - color: line color (hex or rgb)
 *   - height: height in pixels (default 20)
 */
export default function SparklineChart({ data, label, color = "#0066CC", height = 20 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    // Destroy previous chart instance
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");

    // Generate labels for 7 days
    const labels = Array(data.length)
      .fill(null)
      .map((_, i) => `D${i + 1}`);

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: color,
            backgroundColor: `${color}10`, // 10% opacity for fill
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: color,
            pointBorderColor: "#fff",
            pointBorderWidth: 1.5,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: "#fff",
            titleColor: "#000",
            bodyColor: "#000",
            borderColor: color,
            borderWidth: 1,
            padding: 8,
            cornerRadius: 4,
            callbacks: {
              label: (context) => {
                return `₹${Number(context.parsed.y || 0).toLocaleString("en-IN", {
                  maximumFractionDigits: 0
                })}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false,
            beginAtZero: true
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, label, color]);

  return (
    <div style={{ width: "100%", height: `${height}px` }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

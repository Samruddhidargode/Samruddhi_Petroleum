import { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function LineChart({ labels, datasets, title, height = 250 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !labels || labels.length === 0) return;

    // Destroy previous chart instance
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    
    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets.map((ds, idx) => ({
          ...ds,
          tension: 0.4,
          fill: false,
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: ds.borderColor,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              font: { size: 12 },
              color: '#64748b',
              usePointStyle: true,
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(100, 116, 139, 0.3)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                return `${context.dataset.label}: ₹${value.toLocaleString('en-IN')}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(100, 116, 139, 0.1)',
              drawBorder: false,
            },
            ticks: {
              color: '#64748b',
              font: { size: 11 },
              callback: function(value) {
                return '₹' + value.toLocaleString('en-IN');
              }
            }
          },
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: '#64748b',
              font: { size: 11 }
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [labels, datasets]);

  if (!labels || labels.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <p className="text-sm text-slate-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <canvas ref={canvasRef} height={height} />
    </div>
  );
}

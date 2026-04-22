import { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ data, title, height = 300 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const palette = [
    '#0066CC', // primary blue
    '#007C3F', // green
    '#FF6B35', // orange
    '#FFA500', // yellow
    '#00A3E0', // light blue
    '#6EC6F1', // sky blue
  ];

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    // Destroy previous chart instance
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    
    chartRef.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(item => item.label),
        datasets: [{
          data: data.map(item => item.value),
          backgroundColor: palette.slice(0, data.length),
          borderColor: '#fff',
          borderWidth: 2,
          hoverOffset: 8,
        }]
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
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(100, 116, 139, 0.3)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
              }
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
  }, [data]);

  if (!data || data.length === 0) {
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

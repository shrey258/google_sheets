import React, { useEffect, useRef } from 'react';
import { CellData } from '../../types';

interface ChartProps {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  data: {
    labels: string[];
    values: number[];
  };
  title?: string;
  width?: number;
  height?: number;
  colors?: string[];
}

const Chart: React.FC<ChartProps> = ({ 
  type, 
  data, 
  title = 'Chart', 
  width = 400, 
  height = 300,
  colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8AB4F8', '#F06B59', '#F7CB4D', '#0F9D58']
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Draw title
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, 20);
    
    // Calculate chart area
    const chartArea = {
      x: 50,
      y: 40,
      width: width - 70,
      height: height - 70
    };
    
    // Draw chart based on type
    switch (type) {
      case 'bar':
        drawBarChart(ctx, data, chartArea, colors);
        break;
      case 'line':
        drawLineChart(ctx, data, chartArea, colors);
        break;
      case 'pie':
        drawPieChart(ctx, data, chartArea, colors);
        break;
      case 'scatter':
        drawScatterChart(ctx, data, chartArea, colors);
        break;
      case 'area':
        drawAreaChart(ctx, data, chartArea, colors);
        break;
    }
    
    // Draw legend
    drawLegend(ctx, data, chartArea, colors);
    
  }, [type, data, title, width, height, colors]);
  
  // Export chart as PNG
  const exportAsPNG = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };
  
  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={width} height={height} />
      <div className="flex gap-2 mt-4">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={exportAsPNG}
        >
          Export as PNG
        </button>
      </div>
    </div>
  );
};

// Helper function to draw a bar chart
const drawBarChart = (
  ctx: CanvasRenderingContext2D, 
  data: { labels: string[]; values: number[] }, 
  chartArea: { x: number; y: number; width: number; height: number },
  colors: string[]
) => {
  const { labels, values } = data;
  const { x, y, width, height } = chartArea;
  
  // Find max value for scaling
  const maxValue = Math.max(...values, 0);
  const barWidth = width / labels.length * 0.8;
  const barSpacing = width / labels.length * 0.2;
  
  // Draw axes
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.stroke();
  
  // Draw bars
  values.forEach((value, index) => {
    const barHeight = (value / maxValue) * height;
    const barX = x + (index * (barWidth + barSpacing)) + barSpacing / 2;
    const barY = y + height - barHeight;
    
    // Set color
    ctx.fillStyle = colors[index % colors.length];
    
    // Draw bar
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Draw value on top of bar
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(value.toString(), barX + barWidth / 2, barY - 5);
    
    // Draw label below bar
    ctx.fillText(labels[index], barX + barWidth / 2, y + height + 15);
  });
};

// Helper function to draw a line chart
const drawLineChart = (
  ctx: CanvasRenderingContext2D, 
  data: { labels: string[]; values: number[] }, 
  chartArea: { x: number; y: number; width: number; height: number },
  colors: string[]
) => {
  const { labels, values } = data;
  const { x, y, width, height } = chartArea;
  
  // Find max value for scaling
  const maxValue = Math.max(...values, 0);
  const pointSpacing = width / (labels.length - 1);
  
  // Draw axes
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.stroke();
  
  // Draw line
  ctx.beginPath();
  ctx.strokeStyle = colors[0];
  ctx.lineWidth = 2;
  
  values.forEach((value, index) => {
    const pointX = x + (index * pointSpacing);
    const pointY = y + height - (value / maxValue) * height;
    
    if (index === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
    
    // Draw point
    ctx.fillStyle = colors[index % colors.length];
    ctx.beginPath();
    ctx.arc(pointX, pointY, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw value above point
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(value.toString(), pointX, pointY - 10);
    
    // Draw label below point
    ctx.fillText(labels[index], pointX, y + height + 15);
  });
  
  ctx.stroke();
};

// Helper function to draw a pie chart
const drawPieChart = (
  ctx: CanvasRenderingContext2D, 
  data: { labels: string[]; values: number[] }, 
  chartArea: { x: number; y: number; width: number; height: number },
  colors: string[]
) => {
  const { labels, values } = data;
  const { x, y, width, height } = chartArea;
  
  // Calculate total
  const total = values.reduce((sum, value) => sum + value, 0);
  
  // Calculate center and radius
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radius = Math.min(width, height) / 2;
  
  // Draw pie slices
  let startAngle = 0;
  
  values.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    
    // Set color
    ctx.fillStyle = colors[index % colors.length];
    
    // Draw slice
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    
    // Draw label line and text
    const midAngle = startAngle + sliceAngle / 2;
    const labelX = centerX + Math.cos(midAngle) * (radius + 20);
    const labelY = centerY + Math.sin(midAngle) * (radius + 20);
    
    ctx.beginPath();
    ctx.moveTo(centerX + Math.cos(midAngle) * radius, centerY + Math.sin(midAngle) * radius);
    ctx.lineTo(labelX, labelY);
    ctx.strokeStyle = '#000';
    ctx.stroke();
    
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = midAngle < Math.PI ? 'left' : 'right';
    ctx.fillText(`${labels[index]} (${Math.round(value / total * 100)}%)`, labelX, labelY);
    
    startAngle = endAngle;
  });
};

// Helper function to draw a scatter chart
const drawScatterChart = (
  ctx: CanvasRenderingContext2D, 
  data: { labels: string[]; values: number[] }, 
  chartArea: { x: number; y: number; width: number; height: number },
  colors: string[]
) => {
  const { labels, values } = data;
  const { x, y, width, height } = chartArea;
  
  // Find max value for scaling
  const maxValue = Math.max(...values, 0);
  const pointSpacing = width / (labels.length - 1);
  
  // Draw axes
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.stroke();
  
  // Draw points
  values.forEach((value, index) => {
    const pointX = x + (index * pointSpacing);
    const pointY = y + height - (value / maxValue) * height;
    
    // Set color
    ctx.fillStyle = colors[index % colors.length];
    
    // Draw point
    ctx.beginPath();
    ctx.arc(pointX, pointY, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw value above point
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(value.toString(), pointX, pointY - 10);
    
    // Draw label below point
    ctx.fillText(labels[index], pointX, y + height + 15);
  });
};

// Helper function to draw an area chart
const drawAreaChart = (
  ctx: CanvasRenderingContext2D, 
  data: { labels: string[]; values: number[] }, 
  chartArea: { x: number; y: number; width: number; height: number },
  colors: string[]
) => {
  const { labels, values } = data;
  const { x, y, width, height } = chartArea;
  
  // Find max value for scaling
  const maxValue = Math.max(...values, 0);
  const pointSpacing = width / (labels.length - 1);
  
  // Draw axes
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.stroke();
  
  // Draw area
  ctx.beginPath();
  ctx.fillStyle = colors[0];
  ctx.moveTo(x, y + height);
  
  values.forEach((value, index) => {
    const pointX = x + (index * pointSpacing);
    const pointY = y + height - (value / maxValue) * height;
    
    ctx.lineTo(pointX, pointY);
  });
  
  ctx.lineTo(x + width, y + height);
  ctx.closePath();
  ctx.fill();
  
  // Draw line
  ctx.beginPath();
  ctx.strokeStyle = colors[0];
  ctx.lineWidth = 2;
  
  values.forEach((value, index) => {
    const pointX = x + (index * pointSpacing);
    const pointY = y + height - (value / maxValue) * height;
    
    if (index === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
    
    // Draw point
    ctx.fillStyle = colors[index % colors.length];
    ctx.beginPath();
    ctx.arc(pointX, pointY, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw value above point
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(value.toString(), pointX, pointY - 10);
    
    // Draw label below point
    ctx.fillText(labels[index], pointX, y + height + 15);
  });
  
  ctx.stroke();
};

// Helper function to draw legend
const drawLegend = (
  ctx: CanvasRenderingContext2D, 
  data: { labels: string[]; values: number[] }, 
  chartArea: { x: number; y: number; width: number; height: number },
  colors: string[]
) => {
  // Only draw legend for pie charts
  if (data.labels.length <= 5) return;
  
  const { x, width } = chartArea;
  const legendY = chartArea.y + chartArea.height + 30;
  
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  
  data.labels.forEach((label, index) => {
    const legendX = x + (width / data.labels.length) * index;
    
    // Set color
    ctx.fillStyle = colors[index % colors.length];
    
    // Draw color box
    ctx.fillRect(legendX, legendY, 10, 10);
    
    // Draw label
    ctx.fillStyle = '#000';
    ctx.fillText(label, legendX + 15, legendY + 9);
  });
};

export default Chart;

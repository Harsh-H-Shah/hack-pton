'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  transport: '#10b981',
  food:      '#f59e0b',
  energy:    '#3b82f6',
  waste:     '#8b5cf6',
  shopping:  '#ec4899',
};

export default function CategoryChart({ breakdown }) {
  if (!breakdown?.length) return (
    <div className="chart-empty">Log some actions to see your breakdown!</div>
  );

  const data = breakdown.map(b => ({
    name: b.category.charAt(0).toUpperCase() + b.category.slice(1),
    value: +b.co2.toFixed(2),
    category: b.category,
  }));

  return (
    <div className="category-chart">
      <h3 className="chart-title">CO₂ Saved by Category</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
               innerRadius={60} outerRadius={100} paddingAngle={3}>
            {data.map((d) => (
              <Cell key={d.category} fill={COLORS[d.category] ?? '#6b7280'} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [`${v} kg CO₂`, '']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

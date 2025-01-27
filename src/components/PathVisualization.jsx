import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

function PathVisualization({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map(entry => ({
    company: entry.path,
    count: entry.count,
  }));

  return (
    <div className="visualization-wrapper">
      <h3>Path Visualization</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="company" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#4CAF50" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PathVisualization;

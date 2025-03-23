// RequisitionChart.js
import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const RequisitionChart = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384'];

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        cx={200}
        cy={200}
        labelLine={false}
        label={entry => entry.name}
        outerRadius={80}
        fill="#8884d8"
        dataKey="count"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
};

export default RequisitionChart;
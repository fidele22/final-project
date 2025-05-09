import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const colors = {
  Received: "#8884d8",
  Pending: "#ffcc00",
  Verified: "#00c49f",
  Rejected: "#ff4d4d",
  Approved: "#82ca9d"
};

const MonthlyRequisitionChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="department" />
        <YAxis />
        <Tooltip />
        <Legend />
        {Object.keys(colors).map((status) => (
          <Bar key={status} dataKey={status} stackId="a" fill={colors[status]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyRequisitionChart;

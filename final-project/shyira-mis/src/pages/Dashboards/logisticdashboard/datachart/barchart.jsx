// RequisitionBarChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const RequisitionBarChart = ({ data }) => {
  return (
    <BarChart width={600} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <CartesianGrid strokeDasharray="3 3" />
      <Legend />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>
  );
};

export default RequisitionBarChart;
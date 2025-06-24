import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MonthlyRequisitionChart from '../datachart/monthlyChart';
import './dataAnalysis.css';

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DashboardOverview = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); 
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const token = sessionStorage.getItem(`token_${sessionStorage.getItem('currentTab')}`);

  useEffect(() => {
    const fetchMonthlyCounts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/UserRequest/monthly-count/${currentMonth + 1}/${currentYear}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMonthlyData(response.data);
      } catch (error) {
        console.error('Error fetching monthly requisition counts:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyCounts();
  }, [currentMonth, currentYear, token]);

  return (
    <div className="overview-content">
      <div className="select-month">
        <div>
          <label htmlFor="month-select">Select Month:</label>
          <select id="month-select" value={currentMonth} onChange={(e) => setCurrentMonth(parseInt(e.target.value))}>
            {monthNames.map((month, index) => <option key={index} value={index}>{month}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="year-select">Select Year:</label>
          <select id="year-select" value={currentYear} onChange={(e) => setCurrentYear(parseInt(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <p>
        This chart displays the total number of requisitions for different items by department, categorized by status 
        (Pending, Verified, Rejected, Approved, and Received) for  partcular month and year selected .
      </p>

      <MonthlyRequisitionChart data={monthlyData} />
      <h3>Chart data of {monthNames[currentMonth]} {currentYear}</h3>
{monthlyData.length > 0 && (
  <div className="monthly-summary">
    <h4>Summary of Requisitions in {monthNames[currentMonth]} {currentYear}:</h4>
    <ul>
      {monthlyData.map((entry) => {
        const statuses = ['Pending', 'Verified', 'Approved', 'Rejected', 'Received'];
        const total = statuses.reduce((sum, status) => sum + (entry[status] || 0), 0);

        return (
          <li key={entry.department}>
            <strong>{entry.department}:</strong>{" "}
            {statuses.map((status, idx) => (
              <span key={status}>
                {entry[status] || 0} {status}{idx < statuses.length - 1 ? ', ' : ''}
              </span>
            ))}
            <br />
            <strong>Total:</strong> {total} requisition(s)
          </li>
        );
      })}
    </ul>
    <p>
      <strong>Overall Total:</strong>{" "}
      {monthlyData.reduce((sum, entry) => {
        return (
          sum +
          ['Pending', 'Verified', 'Approved', 'Rejected', 'Received'].reduce(
            (subSum, key) => subSum + (entry[key] || 0),
            0
          )
        );
      }, 0)} requisitions across all departments.
    </p>
  </div>
)}


    </div>
  );
};

export default DashboardOverview;

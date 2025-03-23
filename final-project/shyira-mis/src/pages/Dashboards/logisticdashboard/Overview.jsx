import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RequisitionChart from './datachart/chartData'; // Import the chart component
import RequisitionBarChart from './datachart/barchart';

const DashboardOverview = () => {
  const [userName, setLastName] = useState('');
  const [requestCounts, setRequestCounts] = useState({
    pending: 0,
    verified: 0,
    approved: 0,
    rejected: 0,
    received: 0,
  });
  const [user, setUser ] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`);

  useEffect(() => {
    const fetchUser  = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser (response.data);
        setLastName(response.data.lastName);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchRequestCounts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/UserRequest/count`);
        setRequestCounts(response.data); // Assuming the response structure matches the state
      } catch (error) {
        console.error('Error fetching request counts:', error);
      }
    };

    fetchUser ();
    fetchRequestCounts();
  }, []);

  // Prepare data for the chart
  const chartData = [
    { name: 'Pending', count: requestCounts.pending },
    { name: 'Verified', count: requestCounts.verified },
    { name: 'Approved', count: requestCounts.approved },

  ];

  return (
    <div className="overview-content">
      <div className="welcome-nav">
        <h1>Welcome back, {userName}!</h1>
      </div>
     {/* Chart Section */}
     <h2>Requisition Status charts  Overview</h2>
     <section className="chart-section">
      <div>
      <RequisitionChart data={chartData} />
      </div>
      <div>
     

        <p>Here you can find essential logistic information relevant to hospital operations.</p>
        <div className="logistic-overview-widgets">
          <div className="widget">
            <h3>Number of user's requisition pending:</h3>
            <p>Here is the total number of user requisitions for items that have been sent from different department which are still awaiting to be verified.</p>
            <label>{requestCounts.pending}</label>
          </div>
          <div className="widget">
            <h3>Number of user's requisition verified:</h3>
            <p>Here is the total number of user requisitions for items that have been verified but are still awaiting to be approved .</p>
            <label>{requestCounts.verified}</label>
          </div>
          <div className="widget">
            <h3>Number of user's requisition approved:</h3>
            <p>Here is the total number of user requisitions for items that have been approved but are still awaiting receipt by the owner of the requisition.</p>
            <label>{requestCounts.approved}</label>
          </div>
        </div>
        </div>
      </section>

 
      {/* Additional Sections */}
      <section className="additional-section">
        <h2>Additional Information</h2>
        <p>Explore more functionalities and resources available in the logistic dashboard.</p>
        <ul>
          <li>View All Requests</li>
          <li>Inventory Management</li>
          <li>Reports and Analytics</li>
        </ul>
      </section>
    </div>
  );
};

export default DashboardOverview;
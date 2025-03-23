import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../dafdashboard/contentCss/overview.css';

const DashboardOverview = () => {
  const [user, setUser ] = useState({});
  const [loading, setLoading] = useState(true);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`); 
  const [lastName, setLastName] = useState('');
  const [requestCounts, setRequestCounts] = useState({
    pending: 0,
    verified: 0,
    approved: 0,
    rejected: 0,
    received: 0,
  });


  const [missingEntries, setMissingEntries] = useState([]);
  const [isReminderVisible, setIsReminderVisible] = useState(false);
  
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchUser  = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data); // Store the whole user data
        setLastName(response.data.lastName); // Extract and set the lastName
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser ();

    const fetchRequestCounts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/UserRequest/user-count`, {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure the token is sent with the request
          },
        });
        setRequestCounts(response.data); // Assuming the response structure matches the state
      } catch (error) {
        console.error('Error fetching request counts:', error);
      }
    };
    //reminder message 
    const fetchMissingEntries = async () => {
      const currentDate = new Date();
      const day = currentDate.getDate();

      // Display the reminder only between the 20th and the end of the month
      if (day >= 20) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/usercar-data/check-reminders`
          );
          if (response.status === 200) {
            setMissingEntries(response.data.missingEntries);
            setIsReminderVisible(response.data.missingEntries.length > 0);
          }
        } catch (error) {
          console.error('Error fetching missing entries:', error);
        }
      }
    };

    fetchMissingEntries();
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
        <h1>Welcome back to our system, <br /><span>--- {lastName} ---</span></h1>
      </div>
      {isReminderVisible && (
        <marquee className="reminder-message">
          {`Reminder: Data of kilometer covered and remaining liters in this month are missing for the following register numbers: ${missingEntries.join(', ')}`}
        </marquee>
      )}

      <section className="overview-section">
        <h2>Here are user's Overview:</h2>

        <p>Here you can find essential logistic information relevant to hospital operations.</p>
        <label htmlFor="">Item requisition status overview</label>
        <div className="logistic-overview-widgets">
          <div className="widget">
            <h3>Number of requisition you sent waited to be verified</h3>
            <label>{requestCounts.pending}</label>
          </div>
         
          <div className="widget">
            <h3>Number of verified Requisition for Item</h3>
            <label>{requestCounts.verified}</label>
          </div>

          <div className="widget">
            <h3>Number of Approved Requisition for Item</h3>
            <label>{requestCounts.approved}</label>
          </div>
        </div>
      </section>

      <section className="additional-section">
        <h2>Additional Information</h2>
        <p>Explore more functionalities and resources available in the Navigation bar on your dashboard.</p>
        <ul>
          <li>View All items available to request</li>
          <li>Check your requisition status</li>
          <li>Manage your account details</li>
        </ul>
      </section>
    </div>
  );
};

export default DashboardOverview;

import React, { useState } from 'react';
import axios from 'axios';
import CarPlaqueList from './FuelFullReport'; // Import the CarPlaqueList component
import './FuelReport.css'
const StockReportTable = () => {
  const [carPlaque, setCarPlaque] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [totalFuelConsumed, setTotalFuelConsumed] = useState(0);
  const [totalAverageCovered, setTotalAverageCovered] = useState(0);

  const [carInfo, setCarInfo] = useState({});
  const [showCarPlaqueList, setShowCarPlaqueList] = useState(false);

  const fetchStockReport = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/fuel/stock-report`, {
        params: { carPlaque, startDate, endDate }
      });
      setReportData(response.data.reportData || []);
      setTotalFuelConsumed(response.data.totalFuelConsumed || 0);
      setTotalAverageCovered(response.data.totalAverageCovered || 0);
      setCarInfo(response.data.carInfo || {});
    } catch (error) {
      console.error('Error fetching stock report:', error);
      setReportData([]);  
    }
  };

  return (
    <div >
      {showCarPlaqueList ? (
        <CarPlaqueList onBack={() => setShowCarPlaqueList(false)} /> // Show CarPlaqueList component
      ) : (
        <div className='stock-report-container'>
          <div className="fuel-report-header">
          <button onClick={() => setShowCarPlaqueList(true)}>View Full Report</button>
          <h2>Stock Report</h2>
          </div>
          
          <div className='fuel-filter-input'>
            <div>
            <label htmlFor="">Enter Car Plaque</label>
            <input
              type="text"
              value={carPlaque}
              placeholder="Enter Car Plaque"
              onChange={(e) => setCarPlaque(e.target.value)}
            />
            </div>
         <div>
          <label htmlFor="">star date</label>
         <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
         </div>
        <div>
          <label htmlFor="">End date</label>
        <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
        </div>
         
            <button onClick={fetchStockReport}>Fetch Report</button>
          </div>
          {reportData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Register Number</th>
                  <th>Mode of Vehicle</th>
                  <th>Date of Reception</th>
                  <th>Destination</th>
                  <th>Litre Consumed</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row.registerNumber}</td>
                    <td>{row.modeOfVehicle}</td>
                    <td>{new Date(row.dateOfReception).toLocaleDateString()}</td>
                    <td>{row.destination}</td>
                    <td>{row.litreConsumed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data available for the selected filters.</p>
          )}
          <h3>Total Fuel Consumed: {totalFuelConsumed} liters</h3>
          <h5>Total Distance Covered: {totalAverageCovered} Km/l</h5>
          <div>
            <h4>Car Information:</h4>
            <p>Register Number: {carInfo.registerNumber}</p>
            <p>Mode of Vehicle: {carInfo.modeOfVehicle}</p>
            <p>Date of Reception: {new Date(carInfo.dateOfReception).toLocaleDateString()}</p>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default StockReportTable;

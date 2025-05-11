import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FuelRequestReport = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const fetchReport = async () => {
    if (!startDate || !endDate) return alert("Please select both dates.");

    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/fuel/generate-repo?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
    const data = await res.json();
    console.log("Fetched Data:", data);
    setReportData(data);

    // Calculate total quantity received
    const total = data.reduce((sum, req) => sum + (req.quantityReceived || 0), 0);
    setTotalQuantity(total);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Fuel Received Report</h2>

      <div className="flex items-center gap-4 mb-4">
        <div>
          <label>Start Date:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="border p-2"
            dateFormat="dd-MM-yyyy"
          />
        </div>
        <div>
          <label>End Date:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            className="border p-2"
            dateFormat="dd-MM-yyyy"
          />
        </div>
        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generate Report
        </button>
      </div>

 

      <table className="table-auto w-full border-collapse border border-gray-300">
      <thead>
  <tr className="bg-gray-200">
    <th className="border p-2">Requested Date</th>
    <th className="border p-2">Car Plaque</th>
    <th className="border p-2">Mode of Vehicle</th>
    <th className="border p-2">Date of Reception</th>
    <th className="border p-2">Department</th>
    <th className="border p-2">Liter(s) of fuel consumed</th>
    <th className="border p-2">Price Per Liter</th>
    <th className="border p-2">Total Cost consumed (FRW)</th>
  </tr>
</thead>

        <tbody>
          {reportData.map((req) => (
            <tr key={req._id}>
                <td className="border p-2">
                {new Date(req.RequestedDate).toLocaleDateString()}
              </td>
              <td className="border p-2">{req.carPlaque}</td>
              <td className="border p-2">{req.carInfo?.modeOfVehicle || "N/A"}</td>
              <td className="border p-2">
                {req.carInfo?.dateOfReception
                  ? new Date(req.carInfo.dateOfReception).toLocaleDateString()
                  : "N/A"}
              </td>
              <td className="border p-2">{req.carInfo?.depart || "N/A"}</td>
              <td className="border p-2">{req.quantityReceived}</td>
              <td className="border p-2">{req.pricePerLiter?.toLocaleString() || "N/A"}</td>
              <td className="border p-2">{req.totalCostConsumedFRW?.toLocaleString() || "N/A"}</td>
    
              
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="mb-2 font-semibold">
        Total liter(s) consumed: {totalQuantity}
      </h3>
    </div>
  );
};

export default FuelRequestReport;

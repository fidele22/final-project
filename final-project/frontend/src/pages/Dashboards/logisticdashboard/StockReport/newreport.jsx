import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FuelRequestReport = () => {
    const [mode, setMode] = useState("range"); // 'range' or 'month'
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [reportData, setReportData] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    const fetchReport = async () => {
        let url = `${process.env.REACT_APP_BACKEND_URL}/api/fuel/generate-repo`;
      
        if (mode === "range") {
          if (!startDate || !endDate)
            return alert("Please select both start and end dates.");
          url += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        } else if (mode === "month") {
          if (!selectedMonth || !selectedYear)
            return alert("Please select both month and year.");
          url += `?month=${selectedMonth}&year=${selectedYear}`;
        }
      
        const res = await fetch(url);
        const data = await res.json();
        console.log("Fetched Data:", data);
      
        // 👉 Sort the data by RequestedDate ascending
        const sortedData = data.sort((a, b) => new Date(a.RequestedDate) - new Date(b.RequestedDate));
        setReportData(sortedData);
      
        // Recalculate totals
        const totalQuantityCalc = sortedData.reduce(
          (sum, req) => sum + (req.litersConsumed || 0),
          0
        );
        const totalCostCalc = sortedData.reduce(
          (sum, req) => sum + (req.totalCost || 0),
          0
        );
      
        setTotalQuantity(totalQuantityCalc);
        setTotalCost(totalCostCalc);
      };
      

  const months = [
    { name: "January", value: 0 },
    { name: "February", value: 1 },
    { name: "March", value: 2 },
    { name: "April", value: 3 },
    { name: "May", value: 4 },
    { name: "June", value: 5 },
    { name: "July", value: 6 },
    { name: "August", value: 7 },
    { name: "September", value: 8 },
    { name: "October", value: 9 },
    { name: "November", value: 10 },
    { name: "December", value: 11 },
  ];
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Fuel Received Report</h2>

      <div className="select-option">
        <label className="">
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          Date Range
        </label>
        <label className="">
          <input
            type="radio"
            value="month"
            checked={mode === "month"}
            onChange={() => setMode("month")}
          />
          Month & Year
        </label>
      </div>
<hr />
      {mode === "range" ? (
        <div className="filter-fuel-date-range flex gap-4 mb-4">
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
        </div>
      ) : (
        <div className="filter-fuel-date-range">
          <div>
            <label>Month:</label>
            <select
              className="border p-2"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Select Month</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Year:</label>
            <input
              type="number"
              className="border p-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder="e.g., 2024"
            />
          </div>
        </div>
      )}

      <button onClick={fetchReport} className="generate-fuel-report-btn">
        Generate Report
      </button>

 

      <table className="table-auto w-full border-collapse border border-gray-300">
      <thead>
  <tr className="bg-gray-200">
    <th className="border p-2">Requested Date</th>
    <th className="border p-2">Car Plaque</th>
    <th className="border p-2">Mode of Vehicle</th>
    <th className="border p-2">Date of Reception</th>
    <th className="border p-2">Department</th>
    <th className="border p-2">Mileage At Beginning</th>
    <th className="border p-2">Mileage At End</th>
    <th className="border p-2">Distance Covered</th>
    <th className="border p-2">Liter(s) of fuel consumed</th>
    <th className="border p-2">Price Per Liter</th>
    <th className="border p-2">Total Cost consumed (FRW)</th>
  </tr>
</thead>
<tbody>
  {reportData.map((req) => (
    <tr key={req._id}>
      <td className="border p-2">{new Date(req.requestedDate).toLocaleDateString()}</td>
      <td className="border p-2">
  {req.carPlaque || req.carInfo?.registerNumber || "N/A"}
</td>

      <td className="border p-2">{req.modeOfVehicle || "N/A"}</td>
      <td className="border p-2">
        {req.dateOfReception
          ? new Date(req.dateOfReception).toLocaleDateString()
          : "N/A"}
      </td>
      <td className="border p-2">{req.department|| "N/A"}</td>
      <td className="border p-2">{req.mileageAtBeginning}</td>
      <td className="border p-2">{req.mileageAtEnd}</td>
      <td className="border p-2">{req.distanceCovered}</td>
      <td className="border p-2">{req.litersConsumed}</td>
      <td className="border p-2">{req.pricePerLiter?.toLocaleString() || "N/A"}</td>
      <td className="border p-2">{req.totalCost?.toLocaleString() || "N/A"}</td>
    </tr>
  ))}
</tbody>

        <tfoot>
    <tr className="font-bold bg-gray-100">
      <td className="border p-2" colSpan={8}>Total</td>
      <td className="border p-2">{totalQuantity.toLocaleString()} Liters</td>
      <td className="border p-2">-</td>
      <td className="border p-2">{totalCost.toLocaleString()} FRW</td>
    </tr>
  </tfoot>
      </table>
      
    </div>
  );
};

export default FuelRequestReport;

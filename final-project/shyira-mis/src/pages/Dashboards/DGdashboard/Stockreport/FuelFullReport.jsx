import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const FuelFullReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [carPlaqueData, setCarPlaqueData] = useState([]);
  const [month, setMonth] = useState(''); // New state for month

  const [year, setYear] = useState(''); // New state for year
  const [fuelStocks, setFuelStocks] = useState([]);
  const [pricePerUnit, setPricePerUnit] = useState(null); // To store the price per unit
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFuelStocks();
  }, []);

  // Fetch fuel stock data and set a default price per unit
  const fetchFuelStocks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/fuel`);
      setFuelStocks(response.data);
      if (response.data.length > 0) {
        setPricePerUnit(response.data[0].pricePerUnit); // Set price per unit from the first fuel stock
      }
    } catch (error) {
      console.error('Error fetching fuel stocks:', error);
      setError('Error fetching fuel stocks');
    }
  };

  const fetchCarPlaqueData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/fuel/fuelFull-Report`, {
        params: month && year ? { month, year } : { startDate, endDate }
      });
      setCarPlaqueData(response.data.carPlaqueData || []);
      setError('');
    
      // Fetch total cost repairs for each car plaque
      const updatedCarPlaqueData = await Promise.all(response.data.carPlaqueData.map(async (data) => {
        const repairsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/fuel/totalCostRepairs`, {
       params: { month, year, carPlaque: data.registerNumber } // Pass month and year here as well 
        });
        return {
          ...data,
          totalCostRepairs: repairsResponse.data.totalCostRepairs
        };
      }));
    
      setCarPlaqueData(updatedCarPlaqueData);
    } catch (error) {
      console.error('Error fetching car plaque data:', error);
      setError('Failed to fetch data');
    }
  };
  //dowload pdf file
const downloadPDF = async () => {
  const input = document.getElementById('report-content');
  if (!input) {
    console.error('Element with ID report-content not found');
    return;
  }

  try {

    
    const canvas = await html2canvas(input, {
       scale: 2,
       allowTaint: true,
       useCORS: true,
     }); // Increase scale for better quality
    const data = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('l', 'mm', 'a4'); // Define page size and orientation
    const imgProps = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 10;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    let position = 0;

    // Add images to multiple pages if needed
    while (position < imgHeight) {
      pdf.addImage(data, 'PNG', 5, -position, imgWidth, imgHeight);
      position += pdfHeight - 10;
      if (position < imgHeight) pdf.addPage();
    }

    pdf.save('fuel_Stock_Report.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

const downloadExcel = () => {
  const table = document.getElementById("report-content");

  // Check if the table exists
  if (!table) {
    console.error("Table with ID report-content not found");
    return;
  }

  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Convert the table to a worksheet (header + data)
    const ws = XLSX.utils.table_to_sheet(table);

    // Create the title
    const title = `MONTHLY FLEET AND FUEL UTILIZATION REPORT OF ${new Date(
      year,
      month - 1
    ).toLocaleString("default", { month: "long" })} ${year}`;
    // Add the title row at the top
    const titleRow = [[title]]; // Title as a single row array
    // Prepend the title row to the worksheet (shift existing data down by 1 row)
    const wsWithTitle = XLSX.utils.aoa_to_sheet([ ...titleRow, ...XLSX.utils.sheet_to_json(ws, { header: 1 }) ]);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, wsWithTitle, "Stock History");

    // Set a meaningful file name
    const fileName = `fuel_report_of_${year}_${month}.xlsx`;

    // Trigger the download
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error("Error during Excel file generation:", error);
  }
};


  
  return (
    <div className='fuel-full-report'>
      <h2>Fuel Stock Report Generation</h2>
      <button className='download-history-btn' onClick={downloadPDF}>Download Report Pdf</button>
      <button className='download-exl-btn' onClick={downloadExcel}>Export excel file</button>
      {/* <div className='fuel-filter-input'>
        <div>
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button onClick={fetchCarPlaqueData}>Fetch Report</button>
      </div> */}

      <div className='fuel-filter-input'>

    <div>
    
      <label>Month</label>
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        <option value="">Select Month</option>
    
        {Array.from({ length: 12 }, (_, i) => (
    
          <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
    
        ))}
      </select>
    
    </div>
    
    <div>
      <label>Year</label>
      <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="YYYY" />
    
    </div>
    
    <button onClick={fetchCarPlaqueData}>Generate Report</button>
    
    </div>
          {carPlaqueData.length > 0 ? (
            <div id='report-content'> 
             <div className="imag-logo">
          <img src="/image/logo2.png" alt="Logo" className="log"  />
          </div>  
          <div className="fuel-report-titles">
            <p>MINISTRY OF HEALTH</p>
            <p>DISTRICT OF NYABIHU</p>
            <p>HOSPITAL OF SHYIRA</p>
            <h2>
         MONTHLY FLEET AND FUEL UTILIZATION REPORT OF <b>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</b> <b>{year}</b>
           </h2>
           {/* <h3>{title}</h3> */}
          </div>

          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Register Number</th>
                <th>Mode of Vehicle</th>
                <th>Date of Reception</th>
                <th>Department</th>
                <th>Destination</th>
                <th>Mileage at beginning of month.</th>
                <th>Mileage at End of month </th>
                <th>Liter of Fuel Consumed</th>
                <th>Unity Cost per Litre</th>
                <th>Total Cost Consumed (FRW)</th>
                <th>Distance Covered (Km/L)</th>
                <th>Total Cost Repairs</th>
                <th>Full Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {carPlaqueData.map((data, index) => {
                const totalCostConsumed = (pricePerUnit && data.totalFuelConsumed) ? (pricePerUnit * data.totalFuelConsumed) : 0;
                const fullTotalCost = totalCostConsumed + (data.totalCostRepairs || 0);

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{data.registerNumber}</td>
                    <td>{data.modeOfVehicle}</td>
                    <td>{new Date(data.dateOfReception).toLocaleDateString()}</td>
                    <td>{data.depart}</td>
                    <td>{data.destination}</td>
                    <td>{data.mileageAtBeginning || "N/A"}</td>
                    <td>{data.mileageAtEnd || "N/A"}</td>
                    <td>{data.fuelConsumed}</td>
                    <td>{pricePerUnit}</td> 
                    <td>{totalCostConsumed}</td> 
                    <td>{data.distanceCovered?.toFixed(2) || "0.00"}</td>
                    <td>{data.totalCostRepairs}</td>
                    <td>{fullTotalCost}</td> 
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className='footer-img'>
         <img src="/image/footerimg.png" alt="Logo" className="logo" />
         </div>
        </div>
      ) : (
        <p>{error || 'No data available for the selected date range.'}</p>
      )}
    </div>
  );
};

export default FuelFullReport;

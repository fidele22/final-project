import React, { useEffect, useRef,useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2'; 
import html2canvas from 'html2canvas';

import './itemreport.css';

const StockHistoryTable = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
 const [loading, setLoading] = useState(true);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`); 
  const [currentStock, setCurrentStock] = useState([]);
  const [previousStock, setPreviousStock] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);

const tableRef = useRef(null);
  const [aggregatedStock, setAggregatedStock] = useState([]);
  const [totals, setTotals] = useState({
    openingQuantity: 0,
    openingTotalAmount: 0,
    entryQuantity: 0,
    entryTotalAmount: 0,
    exitQuantity: 0,
    exitTotalAmount: 0,
    balanceQuantity: 0,
    balanceTotalAmount: 0,
  });


  // State for signature


  const fetchStockData = async () => {
    try {

      // Fetch all items
  
      const allItemsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks`);
  
      const allItems = allItemsResponse.data;
  
  
      // Prepare the query parameters for the date range
  
      const queryParams = startDate && endDate ? `?start=${startDate}&end=${endDate}` : '';
  
  
      // Fetch current month's stock history
  
      const currentResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks/history/${year}/${month}${queryParams}`);
  
      setCurrentStock(currentResponse.data);
  
      
  
      // Fetch previous month's stock history
  
      const previousMonth = month === 1 ? 12 : month - 1;
  
      const previousYear = month === 1 ? year - 1 : year;
  
      const previousResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks/history/${previousYear}/${previousMonth}${queryParams}`);
  
      setPreviousStock(previousResponse.data);
  
  
      // Combine all items with current and previous stock data
  
      aggregateStockData(currentResponse.data, previousResponse.data, allItems, year, month);

  
    } catch (error) {
  
      console.error('Error fetching stock history:', error);
  
    }
  
  };
  

// Function to fetch the latest stock BEFORE a specific year and month
const fetchLatestStock = async (itemId, year, month) => {
  try {
    // Calculate the first day of the given month
    const endDate = new Date(year, month - 1, 1);
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/stocks/history/latest/${itemId}/${year}/${month}`
    );

    const stock = response.data;

    return {
      balanceQuantity: stock?.balance?.quantity || 0,
      balanceTotalAmount: stock?.balance?.totalAmount || 0,
      pricePerUnit: stock?.balance?.pricePerUnit || stock?.entry?.pricePerUnit || 0,
    };
  } catch (error) {
    console.warn(`No previous stock for item ${itemId}:`, error?.response?.data?.message || error.message);
    return { balanceQuantity: 0, balanceTotalAmount: 0, pricePerUnit: 0 };
  }
};


useEffect(() => {
  fetchStockData();
  fetchSignatures();
}, [year, month]);


  const handleYearChange = (e) => setYear(e.target.value);
  const handleMonthChange = (e) => setMonth(e.target.value);

const aggregateStockData = async (currentData, previousData, allItems, year, month) => {
  const aggregatedData = {};

  // Step 1: Initialize all items with default opening values
  for (const item of allItems) {
    const itemId = item._id;
    aggregatedData[itemId] = {
      itemName: item.name,
      openingQuantity: 0,
      openingTotalAmount: 0,
      openingPricePerUnit: item.pricePerUnit || 0,
      entryQuantity: 0,
      lastEntryPricePerUnit: item.pricePerUnit || 0,
      entryTotalAmount: 0,
      exitQuantity: 0,
      exitTotalAmount: 0,
      balanceQuantity: 0,
      balanceTotalAmount: 0
    };
  }

  // Step 2: Fill in opening from previous month's stock if available
  previousData.forEach(stock => {
    const itemId = stock.itemId._id;
    if (aggregatedData[itemId] && stock.balance) {
      aggregatedData[itemId].openingQuantity = stock.balance.quantity;
      aggregatedData[itemId].openingTotalAmount = stock.balance.totalAmount;
      aggregatedData[itemId].openingPricePerUnit = stock.balance.pricePerUnit || aggregatedData[itemId].openingPricePerUnit;
    }
  });

  // Step 3: Fill in missing openings from latest available previous stock (older than selected month)
  const fetchMissingOpenings = await Promise.all(
    Object.entries(aggregatedData).map(async ([itemId, data]) => {
      if (data.openingQuantity === 0) {
        console.log(`Fetching previous stock for itemId: ${itemId}, year: ${year}, month: ${month - 1}`);
        try {
          const latestStock = await fetchLatestStock(itemId, year, month - 1); // Fetch from the previous month
          console.log(`Fetched latestStock for ${itemId}:`, latestStock);
          if (latestStock.balanceQuantity > 0) {
            return {
              itemId,
              ...latestStock,
            };
          }
        } catch (error) {
          console.error(`Error fetching latest stock for itemId ${itemId}:`, error);
        }
      }
      return null;
    })
  );

  // Step 4: Apply the fetched latest stock data to aggregatedData
  fetchMissingOpenings.forEach((result) => {
    if (result) {
      const { itemId, balanceQuantity, balanceTotalAmount, pricePerUnit } = result;
      aggregatedData[itemId].openingQuantity = balanceQuantity;
      aggregatedData[itemId].openingTotalAmount = balanceTotalAmount;
      aggregatedData[itemId].openingPricePerUnit = pricePerUnit;
    }
  });

  // Step 5: Process current month's transactions and calculate balances
  currentData.forEach(stock => {
    const itemId = stock.itemId._id;
    if (aggregatedData[itemId]) {
      if (stock.entry) {
        aggregatedData[itemId].entryQuantity += stock.entry.quantity || 0;
        aggregatedData[itemId].entryTotalAmount += stock.entry.totalAmount || 0;
        aggregatedData[itemId].lastEntryPricePerUnit = stock.entry.pricePerUnit || aggregatedData[itemId].lastEntryPricePerUnit;
      }
      if (stock.exit) {
        aggregatedData[itemId].exitQuantity += stock.exit.quantity || 0;
        aggregatedData[itemId].exitTotalAmount += stock.exit.totalAmount || 0;
      }

      // Calculate current balance
      aggregatedData[itemId].balanceQuantity = 
        aggregatedData[itemId].openingQuantity +
        aggregatedData[itemId].entryQuantity - 
        aggregatedData[itemId].exitQuantity;
      
      aggregatedData[itemId].balanceTotalAmount = 
        aggregatedData[itemId].openingTotalAmount +
        aggregatedData[itemId].entryTotalAmount - 
        aggregatedData[itemId].exitTotalAmount;
    }
  });

  // Final: Update state
  setAggregatedStock(Object.values(aggregatedData));
};


  
  const calculateTotalsFromDOM = () => {
    const table = tableRef.current;
    if (!table) return;
  
    let totals = {
      openingQuantity: 0,
      openingTotalAmount: 0,
      entryQuantity: 0,
      entryTotalAmount: 0,
      exitQuantity: 0,
      exitTotalAmount: 0,
      balanceQuantity: 0,
      balanceTotalAmount: 0,
    };
  
    // Loop through all table rows except the header/footer
    const rows = table.querySelectorAll('tbody tr');
  
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 8) {
        totals.openingQuantity += parseFloat(cells[1].textContent) || 0;
        totals.openingTotalAmount += parseFloat(cells[3].textContent) || 0;
        totals.entryQuantity += parseFloat(cells[4].textContent) || 0;
        totals.entryTotalAmount += parseFloat(cells[6].textContent) || 0;
        totals.exitQuantity += parseFloat(cells[7].textContent) || 0;
        totals.exitTotalAmount += parseFloat(cells[9].textContent) || 0;
        totals.balanceQuantity += parseFloat(cells[10].textContent) || 0;
        totals.balanceTotalAmount += parseFloat(cells[12].textContent) || 0;
      }
    });
  
    return totals;
  };
  
  const footerTotals = calculateTotalsFromDOM() || totals;

// filter and display month
const monthNames = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const formattedMonth = monthNames[month - 1];
const reportTitle = `RAPORO YA STOCK Y'IBIKORESHO BYO MUBIRO UKWEZI KWA ${formattedMonth} ${year}`;

//download excel file 
const downloadExcel = () => {
  const table = document.getElementById("report-content");

  // Check if the table exists
  if (!table) {
    console.error('Table with ID report-content not found');
    return;
  }

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Prepare the title row with the reportTitle
  const reportTitle = `RAPORO YA STOCK Y'IBIKORESHO BYO MUBIRO UKWEZI KWA ${monthNames[month - 1]} ${year}`;
  const titleRow = [ [reportTitle] ]; // Title row as an array

  // Convert the table to a worksheet
  const ws = XLSX.utils.table_to_sheet(table);

  // Prepend the title row to the worksheet
  const wsWithTitle = XLSX.utils.aoa_to_sheet([ ...titleRow, ...XLSX.utils.sheet_to_json(ws, { header: 1 }) ]);

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, wsWithTitle, "Stock History");

  // Set a meaningful file name
  const fileName = `Stock_History_${year}_${monthNames[month - 1]}.xlsx`;

  // Trigger the download
  XLSX.writeFile(wb, fileName);
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

    pdf.save('Stock_Report.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

const handlePrepareReport = async () => {
  try {
    // Check if a report for the selected month and year exists
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/reportSignature/getSignature/${year}/${month}`);
    
    if (response.data.exists) {
      Swal.fire({
        title: 'Report Already Prepared!',
        text: 'A report for this month has already been prepared.',
        icon: 'info'
      });
      return; // Stop further execution
    }

    // Ask for confirmation before preparing the report
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to prepare and sign this report?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, sign it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/reportSignature/sign`, {
            year,
            month,
            preparedBy: {
              firstName: user.firstName,
              lastName: user.lastName,
              signature: user.signature
            }
          });

          Swal.fire({
            title: 'Success!',
            text: 'Report prepared successfully.',
            icon: 'success'
          });
        } catch (error) {
          console.error('Error preparing report:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Something went wrong while preparing the report.',
            icon: 'error'
          });
        }
      }
    });

  } catch (error) {
    console.error('Error checking report status:', error);
    Swal.fire({
      title: 'Error!',
      text: 'Failed to verify report status.',
      icon: 'error'
    });
  }
};

  //fetching signature
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [signatures, setSignatures] = useState([]); // Initialize as an empty array

  const fetchSignatures = async () => {

    try {

      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/reportSignature/displaySignature/${year}/${month}`);

      console.log(response.data); // Log the response data

      setSignatures(response.data); // Set the signatures directly

    } catch (error) {

      console.error('Error fetching signatures:', error);

    }

  };

  useEffect(() => {
    const fetchUser  = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser (response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };




   
    fetchUser ();
  }, [token]);

  return (
    <div className="report-content">
  <h1>Get stock report</h1>
  <button className='download-history-btn' onClick={downloadPDF}>Download Report Pdf</button>
  <button className='download-exl-btn' onClick={downloadExcel}>Export excel file</button>
    <div className="stock-history-container">
      <div className="stock-history-header" >
        <label>
          Year:
          <input type="number" value={year} onChange={handleYearChange} />
        </label>
        <label>
          Month:
          <input type="number" value={month} onChange={handleMonthChange} min="1" max="12" />
        </label>
        <div className="date-range-filter">

        <button className='verify-requisition' onClick={handlePrepareReport}>Prepare Report</button>


</div>
       
      </div>
      <div className="stock-report" id='report-content' >

    
      {/* <div className="imag-logo">
          <img src="/image/logo2.png" alt="Logo" className="log"  />
          </div> */}

      <div className="report-title">
         <p>HOPITAL DE SHYIRA</p>                                                                           
         <p>BP 56 MUSANZE</p>
         <p>SERVICE LOGISTIQUE</p>
         <h3>{reportTitle}</h3>

         
 
      </div>
      <table className="stock-history-table"  ref={tableRef}>
      
        <thead>
          <tr className='main-table-header'>
            <th></th>
            <th colSpan="3">OPENING STOCK</th>
            <th colSpan="3">ENTRY</th>
            <th colSpan="3">EXIT</th>
            <th colSpan="3">BALANCE</th>
          </tr>

          <tr>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Price Per Unit</th>
            <th>Total Amount</th>
            <th>Quantity</th>
            <th>Price Per Unit</th>
            <th>Total Amount</th>
            <th>Quantity</th>
            <th>Price Per Unit</th>
            <th>Total Amount</th>
            <th>Quantity</th>
            <th>Price Per Unit</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {aggregatedStock.map((stock, index) => (
            <tr key={index}>
              <td>{stock.itemName}</td>
              <td>{stock.openingQuantity}</td>
              <td>{stock.openingPricePerUnit}</td>
              <td>{stock.openingTotalAmount}</td>
              <td>{stock.entryQuantity}</td>
              <td>{stock.lastEntryPricePerUnit}</td>
              <td>{stock.entryTotalAmount}</td>
              <td>{stock.exitQuantity}</td>
              <td>{stock.lastEntryPricePerUnit}</td>
              <td>{stock.exitTotalAmount}</td>
              <td>{stock.openingQuantity + stock.entryQuantity - stock.exitQuantity}</td>
              <td>{stock.lastEntryPricePerUnit}</td>
              <td>{stock.openingTotalAmount + stock.entryTotalAmount - stock.exitTotalAmount}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
  <tr>
    <td><strong>Total</strong></td>
    <td>-</td>
    <td>-</td>
    <td>{footerTotals.openingTotalAmount.toFixed(2)}</td>
    <td>-</td>
    <td>-</td>
    <td>{footerTotals.entryTotalAmount.toFixed(2)}</td>
    <td>-</td>
    <td>-</td>
    <td>{footerTotals.exitTotalAmount.toFixed(2)}</td>
    <td>-</td>
    <td>-</td>
    <td>{((footerTotals.openingTotalAmount + footerTotals.entryTotalAmount) - footerTotals.exitTotalAmount).toFixed(2)}</td>

  </tr>
</tfoot>

      </table>
      <div className="report-footer">
        <div className='logistic-office'>
       
       <div className="report-signature-section">
        <div className="item-report-signature">
        
        <ul>

{Array.isArray(signatures) && signatures.length > 0 ? (

  signatures.map((report) => (

    <p key={report._id}>
   <h4>LOGISTIC OFFICER</h4>
    <label>prepared by: </label>
     
      <p>{report.preparedBy.firstName} {report.preparedBy.lastName}</p>

      <img src={`${process.env.REACT_APP_BACKEND_URL}/${report.preparedBy.signature}`} alt="Signature"  className='report-signature'  />

      {/* <p><strong>Signed At:</strong> {new Date(report.createdAt).toLocaleString()}</p> */}

    </p>

  ))

) : (

  <li>No signatures found.</li> // Fallback message

)}

</ul>
        {/* name and signature */}
        </div>
      <div className="daf-officer">
     
      <ul>

{Array.isArray(signatures) && signatures.length > 0 ? (

  signatures.map((report) => (

    <p key={report._id}>
  <h4>DAF OFFICER</h4>
  <label>Verified by: </label>
     
      <p>{report.verifiedBy.firstName} {report.verifiedBy.lastName}</p>

      <img src={`${process.env.REACT_APP_BACKEND_URL}/${report.verifiedBy.signature}`} alt=" "  className='report-signature' />

      {/* <p><strong>Signed At:</strong> {new Date(report.createdAt).toLocaleString()}</p> */}

    </p>

  ))

) : (

  <li>No signatures found.</li> // Fallback message

)}

</ul>
        {/* name and signature */}
      </div>
      <div className="dg-officer">
      <ul>

{Array.isArray(signatures) && signatures.length > 0 ? (

  signatures.map((report) => (

    <p key={report._id}>
  <h4>DG OFFICER</h4>
  <label>Approved by: </label>
     
      <p>{report.approvedBy.firstName} {report.approvedBy.lastName}</p>

      <img src={`${process.env.REACT_APP_BACKEND_URL}/${report.approvedBy.signature}`} alt=" " className='report-signature'  />

      {/* <p><strong>Signed At:</strong> {new Date(report.createdAt).toLocaleString()}</p> */}

    </p>

  ))

) : (

  <li>No signatures found.</li> // Fallback message

)}

</ul>
        {/* name and signature */}
      </div>
       </div>
     
       



        </div>
    
      </div>
      <div className='footer-img'>
         <img src="/image/footerimg.png" alt="Logo" className="logo" />
         </div>
  </div>
     
    </div>
    </div>
  );
};

export default StockHistoryTable;

// src/components/FuelStockList.js
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash,FaTimes,FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import the autotable plugin
import html2canvas from 'html2canvas'; 
import html2pdf from 'html2pdf.js';
import * as XLSX from "xlsx";

const FuelStockList = () => {
  const [fuelStocks, setFuelStocks] = useState([]);
  const [history, setHistory] = useState([]);
  const [showAddFuelTypeForm, setShowAddFuelTypeForm] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFuelStock, setNewFuelStock] = useState({
    fuelType: '',
    quantity: '',
    pricePerUnit: '',
  });
  const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10); // Number of items per page
  const [isFiltered, setIsFiltered] = useState(false); // New state to track if filter is applied

  useEffect(() => {
    fetchFuelStocks();
    fetchHistory(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchFuelStocks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/fuel`);
      setFuelStocks(response.data);
    } catch (error) {
      console.error('Error fetching fuel stocks:', error);
      setError('Error fetching fuel stocks');
    }
  };

  const fetchHistory = async (page, limit, startDate = '', endDate = '') => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/fuel/fuel-history`, {
        params: {
          page,
          limit,
          startDate,
          endDate,
        },
      });
      setHistory(response.data.history);
      setTotalPages(Math.ceil(response.data.total / limit));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fuel stock history:', error);
      setError('Error fetching fuel stock history');
      setLoading(false);
    }
  };
 // New function to fetch all filtered history

 const fetchFilteredData = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/fuel/fuel-history`, {
      params: {
        startDate,
        endDate,
        fetchAll: true, // Skip pagination and fetch all data
      },
    });

    if (response.data.history && response.data.history.length > 0) {
      return response.data.history;
    } else {
      alert('No data available for the selected date range');
      return [];
    }
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    alert('Error fetching filtered data');
    return [];
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewFuelStock({
      ...newFuelStock,
      [name]: value,
    });
  };

  const handleAddFuelStock = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/fuel/add-fuel`, newFuelStock);
      alert('Fuel data added successfully');
      setNewFuelStock({
        fuelType: '',
        quantity: '',
        pricePerUnit: '',
      });
      fetchFuelStocks();
    } catch (error) {
      console.error('Error adding fuel stock:', error);
      alert('Error adding fuel stock');
    }
  };

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };


  const downloadExcel = async () => {
    // Fetch all filtered history
    const allFilteredHistory = await fetchFilteredData(startDate, endDate);
    
    if (allFilteredHistory.length === 0) {
      alert('No data available for the selected date range');
      return;
    }
  
    // Transform the data into a flat structure
    const transformedData = allFilteredHistory.map(record => ({
      lastUpdated: new Date(record.updatedAt).toLocaleString(), // Format date as needed
      carplaque: record.carplaque,
      entryQuantity: record.entry.quantity,
      entryPricePerUnit: record.entry.pricePerUnit,
      entryTotalAmount: record.entry.totalAmount,
      exitQuantity: record.exit.quantity,
      exitPricePerUnit: record.exit.pricePerUnit,
      exitTotalAmount: record.exit.totalAmount,
      balanceQuantity: record.balance.quantity,
      balancePricePerUnit: record.balance.pricePerUnit,
      balanceTotalAmount: record.balance.totalAmount,
    }));
  
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    // Create the title rows

    const titleRows = [

      ["REPUBLIC OF RWANDA"],
  
      ["NYABIHU DISTRICT"],
  
      ["SHYIRA DISTRICT HOSPITAL"],
  
      ["BP S6 MUSANZE"],
  
      [""], // Empty row for spacing
  
      ["Store Card for Fuel cards"],
  
      [""], // Empty row for spacing
  
    ];
  
    // Create the header rows
    const headerRow1 = [
      "Last Updated", 
      "Car Plaque", 
      "Entry ", 
      "", 
      "", 
      "Exit", 
      "", 
      "", 
      "Balance", 
      "", 
      ""
    ];
  
    const headerRow2 = [
      "", // Placeholder for Last Updated
      "", // Placeholder for Car Plaque
      "Quantity", 
      "Price Per Unit", 
      "Total Amount", 
      "Quantity", 
      "Price Per Unit", 
      "Total Amount", 
      "Quantity", 
      "Price Per Unit", 
      "Total Amount"
    ];
  
    // Create a worksheet with the headers
    const worksheetData = [ ...titleRows,headerRow1, headerRow2, ...transformedData.map(record => [
      record.lastUpdated,
      record.carplaque,
      record.entryQuantity,
      record.entryPricePerUnit,
      record.entryTotalAmount,
      record.exitQuantity,
      record.exitPricePerUnit,
      record.exitTotalAmount,
      record.balanceQuantity,
      record.balancePricePerUnit,
      record.balanceTotalAmount,
    ])];
  
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
    // Set the column widths for better readability
    worksheet['!cols'] = [
      { wpx: 120 }, // Last Updated
      { wpx: 100 }, // Car Plaque
      { wpx: 80 },  // Entry Quantity
      { wpx: 80 },  // Entry Price Per Unit
      { wpx: 80 },  // Entry Total Amount
      { wpx: 80 },  // Exit Quantity
      { wpx: 80 },  // Exit Price Per Unit
      { wpx: 80 },  // Exit Total Amount
      { wpx: 80 },  // Balance Quantity
      { wpx: 80 },  // Balance Price Per Unit
      { wpx: 80 },  // Balance Total Amount
    ];
  
    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fuel Stock History");
  
    // Write the file
    XLSX.writeFile(workbook, "fuel_stock_history.xlsx");
  };
 

  const handleFilter = () => {

    fetchHistory(1, pageSize, startDate, endDate); // Fetch history with filter applied

    setCurrentPage(1); // Reset to the first page

    setIsFiltered(true); // Set filter state to true

  };






  return (
    <div className='fuel-stock-managment'>
      <div className="fuel-stock">
      <button className='add-new-user-btn' onClick={() => setShowAddFuelTypeForm(true)}>
      <FaPlus /> Add new Item</button>

      <div className="stock-updated">
        <h1>Fuel Stock Update</h1>
        {fuelStocks.length > 0 ? (
          fuelStocks.map((stock) => (
            <div key={stock._id} className='fuelStock-data'>
            {/* <p>Type of Fuel: {stock.fuelType}</p>*/} 
             <div>
             <p>Quantity Liters:</p>
             <label htmlFor=""> {stock.quantity}</label>
             </div>
             <div>
             <p>Price Per Liter: </p>
             <label htmlFor="">{stock.pricePerUnit}</label>
             </div> 
             <div>
             <p>Total Amount (Frw):</p>
             <label htmlFor=""> {stock.totalAmount}</label>
             </div>
             
            </div>
          ))
        ) : (
          <p>No fuel stocks available</p>
        )}
      </div>
      <div className="stock-updated">
        <h1>Amount Stock Update</h1>
        {fuelStocks.length > 0 ? (
          fuelStocks.map((stock) => (
            <div key={stock._id}>
              <p>Total Amount (Frw):</p>
              <label htmlFor=""> {stock.totalAmount}</label>
            </div>
          ))
        ) : (
          <p>No fuel stocks available</p>
        )}
      </div>
      </div>
       {/* Date Filter */}

    <div className="date-filter-store-card">
        <div className="filter-title">
        <p>Generate the store card according to date range you want to filter</p>
        </div>
         <div className="input-date">
         <label htmlFor="startDate">Start Date:</label>

<input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

<label htmlFor="endDate">End Date:</label>

<input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

<button onClick={handleFilter}>GENERATE</button>
         </div>
         
       
          </div>
          
          
          {/* Download Buttons */}
          
          <div className="download-buttons">
       
          <button className='download-exl-btn' onClick={downloadExcel}>Download Excel</button>
          
          </div>

      {/* fuel store card */}
      <div className="fuel-store-card">
        <div id='pdf-content'>

        <div className="form-title">
          <p>REPUBLIC OF RWANDA</p>
          <p>NYABIHU DISTRICT</p>
          <p>SHYIRA DISTRICT HOSPITAL</p>
          <p>BP S6 MUSANZE</p>
        </div>
      <h2>Store Card for Fuel cards</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
              <th rowSpan={2}>Last Updated</th>
                <th rowSpan={2}>Car Plaque</th>
                <th colSpan={3}>Entry Quantity</th>
                <th colSpan={3}>Exit Quantity</th>
                <th colSpan={3}>Balance Quantity</th>
                
              </tr>
              <tr>
             
              
                <th>Quantity</th>
                <th>pricePerUnit</th>
                <th>Total Amount</th>
                <th>Quantity</th>
                <th>pricePerUnit</th>
                <th>Total Amount</th>
                <th>Quantity</th>
                <th>pricePerUnit</th>
                <th>Total Amount</th>
              
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((record) => (
                  <tr key={record._id}>
                    <td>{new Date(record.updatedAt).toLocaleString()}</td>
                    <td>{record.carplaque}</td>
                    <td>{record.entry.quantity}</td>
                    <td>{record.entry.pricePerUnit}</td>
                    <td>{record.entry.totalAmount}</td>

                    <td>{record.exit.quantity}</td>
                    <td>{record.exit.pricePerUnit}</td>
                    <td>{record.exit.totalAmount}</td>
                    <td>{record.balance.quantity}</td>
                    <td>{record.balance.pricePerUnit}</td>
                    <td>{record.balance.totalAmount}</td>
                 
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No history available</td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="pagination">
            <button 
              onClick={() => handlePageChange('prev')} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => handlePageChange('next')} 
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        
        </>
      )}
      </div>
      </div>
      {showAddFuelTypeForm && (
          <div className="add-overlay">
            <div className="add-user-form-container">
              <button className="close-form-btn" onClick={() => setShowAddFuelTypeForm(false)}>
                <FaTimes size={32} />
              </button>
              <div className="additem">
        <h1>Add Fuel Type</h1>
        <form onSubmit={handleAddFuelStock}>
          <label htmlFor="">Fuel type:</label>
          <input
            type="text"
            name="fuelType"
            value={newFuelStock.fuelType}
            onChange={handleChange}
            placeholder="Fuel Type"
            required
          />
          <label htmlFor="">Quantity in Liters</label>
          <input
            type="number"
            name="quantity"
            value={newFuelStock.quantity}
            onChange={handleChange}
            placeholder="Quantity in Liters"
            required
          />
          <label htmlFor="">Price Per Unit</label>
          <input
            type="number"
            name="pricePerUnit"
            value={newFuelStock.pricePerUnit}
            onChange={handleChange}
            placeholder="Price Per Liter"
            required
          />
          <button type="submit">Add Fuel Stock</button>
        </form>
      </div>

            </div>
          </div>
        )}
    </div>
  );
};

export default FuelStockList;

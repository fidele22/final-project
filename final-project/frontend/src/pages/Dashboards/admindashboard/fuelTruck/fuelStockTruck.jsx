// src/components/FuelStockList.js
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash,FaTimes,FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import the autotable plugin
import html2canvas from 'html2canvas'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import * as XLSX from "xlsx";
import './fuelTruck.css';


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
const [editingRowId, setEditingRowId] = useState(null); // ID of row being edited
const [editedRow, setEditedRow] = useState({});


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
        params: { page, limit, startDate, endDate },
      });
  
      console.log("Fuel history API response:", response.data);
  
      if (Array.isArray(response.data.history)) {
        setHistory(response.data.history);
        setTotalPages(Math.ceil(response.data.total / limit));
      } else {
        setHistory([]);
        setError('Invalid data format received');
      }
      
  
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

    if (Array.isArray(response.data.history) && response.data.history.length > 0)
      {
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
      toast.success('Fuel data added successfully');
      setNewFuelStock({
        fuelType: '',
        quantity: '',
        pricePerUnit: '',
      });
      fetchFuelStocks();
    } catch (error) {
      console.error('Error adding fuel stock:', error);
      toast.error('Error fuel type added already exist');
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
    const allFilteredHistory = await fetchFilteredData(startDate, endDate);
  
    if (allFilteredHistory.length === 0) {
      alert('No data available for the selected date range');
      return;
    }
  
    // Sort by requestedDate in ascending order
    allFilteredHistory.sort((a, b) => new Date(a.requestedDate) - new Date(b.requestedDate));
  
    const transformedData = allFilteredHistory.map(record => ({
      lastUpdated: new Date(record.updatedAt).toLocaleString(),
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
const handleEditClick = (record) => {
  setEditingRowId(record._id);
  setEditedRow({
    entry: {
      quantity: record.entry.quantity,
      pricePerUnit: record.entry.pricePerUnit,
    },
    exit: {
      quantity: record.exit.quantity,
      pricePerUnit: record.exit.pricePerUnit,
    }
  });
};
const handleCancelEdit = () => {
  setEditingRowId(null);
  setEditedRow({});
};

const handleSaveEdit = async (recordId) => {
  try {
    await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/fuel/updated-fuel-history/${recordId}`, {
  entry: editedRow.entry,
  exit: editedRow.exit,
});

    toast.success('Fuel records updated!');
    fetchHistory(currentPage, pageSize); // Refresh table
    setEditingRowId(null);
    setEditedRow({});
  } catch (err) {
    console.error(err);
    toast.error('Update failed');
  }
};

const handleFieldChange = (section, field, value) => {
  setEditedRow((prev) => ({
    ...prev,
    [section]: {
      ...prev[section],
      [field]: value,
    },
  }));
};






  return (
    <div className='fuel-stock-managment'>
      <div className="fuel-stock">

      <div className="stock-updated">
        <h1>Fuel Stock Update</h1>
        {Array.isArray(fuelStocks) && fuelStocks.length > 0 ? (
  fuelStocks.map((stock) => (
    <div key={stock._id} className='fuelStock-data'>
      <div>
        <p>Quantity Liters:</p>
        <label>{stock.quantity}</label>
      </div>
      <div>
        <p>Price Per Liter:</p>
        <label>{stock.pricePerUnit}</label>
      </div>
      <div>
        <p>Total Amount (Frw):</p>
        <label>{stock.totalAmount}</label>
      </div>
    </div>
  ))
) : (
  <p>No fuel stock data available.</p>
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

<button className='generate-stock-card-btn' onClick={handleFilter}>GENERATE</button>
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
              <th rowSpan={2}>Date</th>
                <th rowSpan={2}>Car Plaque</th>
                <th colSpan={3}>Entry Quantity</th>
                <th colSpan={3}>Exit Quantity</th>
                <th colSpan={3}>Balance Quantity</th>
                <th rowSpan={2}>Action</th>
                
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
  {Array.isArray(history) && history.length > 0 ? (
    history.map((record) => {
      const isEditing = editingRowId === record._id;
      return (
        <tr key={record._id}>
          <td>{new Date(record.updatedAt).toLocaleDateString()}</td>
          <td>{record.carplaque}</td>

          {/* Entry Fields */}
          <td>
            {isEditing ? (
              <input
                type="number"
                value={editedRow.entry.quantity}
                onChange={(e) => handleFieldChange("entry", "quantity", e.target.value)}
              />
            ) : (
              record.entry.quantity
            )}
          </td>
          <td>
            {isEditing ? (
              <input
                type="number"
                value={editedRow.entry.pricePerUnit}
                onChange={(e) => handleFieldChange("entry", "pricePerUnit", e.target.value)}
              />
            ) : (
              record.entry.pricePerUnit
            )}
          </td>
          <td>{record.entry.totalAmount}</td>

          {/* Exit Fields */}
          <td>
            {isEditing ? (
              <input
                type="number"
                value={editedRow.exit.quantity}
                onChange={(e) => handleFieldChange("exit", "quantity", e.target.value)}
              />
            ) : (
              record.exit.quantity
            )}
          </td>
          <td>
            {isEditing ? (
              <input
                type="number"
                value={editedRow.exit.pricePerUnit}
                onChange={(e) => handleFieldChange("exit", "pricePerUnit", e.target.value)}
              />
            ) : (
              record.exit.pricePerUnit
            )}
          </td>
          <td>{record.exit.totalAmount}</td>

          {/* Balance (Read-only) */}
          <td>{record.balance.quantity}</td>
          <td>{record.balance.pricePerUnit}</td>
          <td>{record.balance.totalAmount}</td>

          {/* Action Buttons */}
          <td>
            {isEditing ? (
              <>
                <button onClick={() => handleSaveEdit(record._id)}
                  style={{backgroundColor:'green'}} >Save</button>
                <button onClick={handleCancelEdit}
                style={{backgroundColor:'red'}}>Cancel</button>
              </>
            ) : (
              <button onClick={() => handleEditClick(record)}
               style={{backgroundColor:'black'}}>
                <FaEdit /> Edit
              </button>
            )}
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="12">No history available</td>
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
    

      {/* to add new fuel type */}
      {showAddFuelTypeForm && (
          <div className="add-overlay">
            <div className="add-user-form-container">
           
          <div className="additem">
                   <button className="close-addfuel-form" onClick={() => setShowAddFuelTypeForm(false)}>
                <FaTimes size={32} />
              </button>
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

        <ToastContainer />

    </div>
  );
};

export default FuelStockList;

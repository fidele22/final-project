// StockHistory.js
import React, { useState } from 'react';
import { FaTimes,FaExclamationTriangle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; 
import axios from 'axios';


const StockHistory = ({ item, onClose }) => {
  const [stockHistory, setStockHistory] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStockHistory = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks/history/${item._id}`, {
        params: { startDate, endDate }
      });
      setStockHistory(response.data);
    } catch (error) {
      console.error('Error fetching stock history:', error);
    }
  };
const [editingIndex, setEditingIndex] = useState(null);
const [editData, setEditData] = useState({ entry: {}, exit: {} });

// Helper to calculate total
const calculateTotal = (qty, price) => qty * price;

// Handle edit click
const handleEditClick = (index, entry) => {
  setEditingIndex(index);
  setEditData({
    entry: { ...entry.entry },
    exit: { ...entry.exit }
  });
};

// Handle update
const handleUpdate = async (id) => {
  const updatedEntry = {
    entry: {
      quantity: Number(editData.entry.quantity),
      pricePerUnit: Number(editData.entry.pricePerUnit),
      totalAmount: calculateTotal(editData.entry.quantity, editData.entry.pricePerUnit)
    },
    exit: {
      quantity: Number(editData.exit.quantity),
      pricePerUnit: Number(editData.exit.pricePerUnit),
      totalAmount: calculateTotal(editData.exit.quantity, editData.exit.pricePerUnit)
    }
  };

  try {
    await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/stocks/history/update/${id}`, updatedEntry);
    toast.success("Update records successful!");
    setEditingIndex(null);
    fetchStockHistory();
  } catch (error) {
    toast.error("Update records failed!");
    console.error(error);
  }
};
////

  return (
    <div className="stockHistory-overlay">
      <div className="stock-history">

          <div className="history-filter">
           <div className="warning">
            <FaExclamationTriangle color='brown' size={20}/>
           <label htmlFor="">Filter history of item by selecting date range / by default click 
            <span>view history</span> button to filter all history</label>
           </div>
            <div className="start-date">
            <label>
              Start Date:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <button className='view-history-btn' onClick={fetchStockHistory}>View History</button>
            </div>
            <div className="end-date">
            <label>
              End Date:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          
            </div>
            <p className='history-closes-btn' onClick={onClose}><FaTimes /></p>
          </div>
          <div id='history-content'>
          <h2>Stock sheet of {item.name}</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th colSpan="3">ENTRY</th>
                <th colSpan="3">EXIT</th>
                <th colSpan="3">BALANCE</th>
                <th>Action</th>
              </tr>
              <tr>
                <th>Updated on</th>
                <th>Quantity</th>
                <th>Price per Unit</th>
                <th>Total Amount</th>
                <th>Quantity</th>
                <th>Price per Unit</th>
                <th>Total Amount</th>
                <th>Quantity</th>
                <th>Price per Unit</th>
                <th>Total Amount</th>
                <th></th>
              </tr>
            </thead>
        <tbody>
  {stockHistory.map((entry, index) => (
    <tr key={index}>
      <td>{new Date(entry.updatedAt).toLocaleString()}</td>

      {editingIndex === index ? (
        <>
          {/* ENTRY */}
          <td><input type="number" value={editData.entry.quantity} onChange={(e) => setEditData({ ...editData, entry: { ...editData.entry, quantity: e.target.value } })} /></td>
          <td><input type="number" value={editData.entry.pricePerUnit} onChange={(e) => setEditData({ ...editData, entry: { ...editData.entry, pricePerUnit: e.target.value } })} /></td>
          <td>{calculateTotal(editData.entry.quantity, editData.entry.pricePerUnit)}</td>

          {/* EXIT */}
          <td><input type="number" value={editData.exit.quantity} onChange={(e) => setEditData({ ...editData, exit: { ...editData.exit, quantity: e.target.value } })} /></td>
          <td><input type="number" value={editData.exit.pricePerUnit} onChange={(e) => setEditData({ ...editData, exit: { ...editData.exit, pricePerUnit: e.target.value } })} /></td>
          <td>{calculateTotal(editData.exit.quantity, editData.exit.pricePerUnit)}</td>

          {/* BALANCE (read-only) */}
          <td colSpan="3" style={{ textAlign: 'center', fontStyle: 'italic' }}>Will be recalculated</td>

          {/* Save + Cancel */}
          <td>
            <button style={{backgroundColor:'green',color:'white'}} onClick={() => handleUpdate(entry._id)}>Update</button>
            <button style={{backgroundColor:'rgb(196, 36, 36)',color:'white'}} onClick={() => setEditingIndex(null)}>Cancel</button>
          </td>
        </>
      ) : (
        <>
          {/* Display mode */}
          <td>{entry.entry.quantity}</td>
          <td>{entry.entry.pricePerUnit}</td>
          <td>{entry.entry.totalAmount}</td>
          <td>{entry.exit.quantity}</td>
          <td>{entry.exit.pricePerUnit}</td>
          <td>{entry.exit.totalAmount}</td>
          <td>{entry.balance.quantity}</td>
          <td>{entry.balance.pricePerUnit}</td>
          <td>{entry.balance.totalAmount}</td>
          <td><button 
          style={{backgroundColor:'rgb(83, 82, 82)', color:'white'}} onClick={() => handleEditClick(index, entry)}>Edit</button></td>
        </>
      )}
    </tr>
  ))}
</tbody>

          </table>
        </div>
 
      </div>
    </div>
  );
};

export default StockHistory;
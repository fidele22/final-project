// StockDetails.js
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const StockDetails = ({ item, onClose }) => {
  const [stockDetails, setStockDetails] = useState([]);
  const [editedStock, setEditedStock] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getStockHistory/${item._id}`);
        setStockDetails(response.data);
      } catch (error) {
        console.error('Error fetching stock details:', error);
      }
    };

    fetchStockDetails();
  }, [item]);

  const handleEditStock = (stock) => {
    setEditedStock({ ...stock });
  };

  const handleInputChange = (e, section, field) => {
    const { value } = e.target;
    setEditedStock((prevStock) => ({
      ...prevStock,
      [section]: {
        ...prevStock[section],
        [field]: value,
      },
    }));
  };

  const handleUpdateStock = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/stocks/${editedStock._id}`, editedStock);
      setStockDetails(stockDetails.map((entry) => (entry._id === editedStock._id ? editedStock : entry)));
      setModalMessage('Update stock done successfully');
      setIsSuccess(true);
      setShowModal(true);
    } catch (error) {
      console.error('Error updating stock:', error);
      setModalMessage('Failed to update stock');
      setIsSuccess(false);
      setShowModal(true);
    }
  };

  return (
    <div className="stockDetails-overlay">
  
      <div className="stock-details">
      <p className="detail-close-btn" onClick={onClose}><FaTimes /></p>
        <h2>Item Details for {item.name}</h2>
        <table>
          <thead>
            <tr>
              <th rowSpan={2}>Date</th>
              <th colSpan="3">ENTRY</th>
              <th colSpan="3">EXIT</th>
              <th colSpan="3">BALANCE</th>
              <th rowSpan={2}>Actions</th>
            </tr>
            <tr>
              <th>Quantity</th>
              <th>Price per Unit</th>
              <th>Total Amount</th>
              <th>Quantity</th>
              <th>Price per Unit</th>
              <th>Total Amount</th>
              <th>Quantity</th>
              <th>Price per Unit</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {stockDetails.map((entry, index) => (
              <tr key={index}>
                <td>{new Date(entry.updatedAt).toLocaleString()}</td>
                <td>
                  {editedStock && editedStock._id === entry._id ? (
                    <input
                      type="number"
                      value={editedStock.entry.quantity}
                      onChange={(e) => handleInputChange(e, 'entry', 'quantity')}
                    />
                  ) : (
                    entry.entry.quantity
                  )}
                </td>
                <td>
                  {editedStock && editedStock._id === entry._id ? (
                    <input
                      type="number"
                      value={editedStock.entry.pricePerUnit}
                      onChange={(e) => handleInputChange(e, 'entry', 'pricePerUnit')}
                    />
                  ) : (
                    entry.entry.pricePerUnit
                  )}
                </td>
                <td>{entry.entry.totalAmount}</td>
                <td>
                  {editedStock && editedStock._id === entry._id ? (
                    <input
                      type="number"
                      value={editedStock.exit.quantity}
                      onChange={(e) => handleInputChange(e, 'exit', 'quantity')}
                    />
                  ) : (
                    entry.exit.quantity
                  )}
                </td>
                <td>{entry.exit.pricePerUnit}</td>
                <td>{entry.exit.totalAmount}</td>
                <td>{entry.balance.quantity}</td>
                <td>{entry.balance.pricePerUnit}</td>
                <td>{entry.balance.totalAmount}</td>
                <td>
                  {editedStock && editedStock._id === entry._id ? (
                    <>
                      <button onClick={handleUpdateStock}>Update</button>
                      <button onClick={() => setEditedStock(null)}>Cancel</button>
                    </>
                  ) : (
                    <button>Edit</button>
                    // <button onClick={() => handleEditStock(entry)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              {isSuccess ? (
                <div className="modal-success">
                  <FaCheckCircle size={54} color="green" />
                  <p>{modalMessage}</p>
                </div>
              ) : (
                <div className="modal-error">
                  <FaTimesCircle size={54} color="red" />
                  <p>{modalMessage}</p>
                </div>
              )}
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockDetails;
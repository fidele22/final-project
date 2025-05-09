// StockHistory.js
import React, { useState } from 'react';
import { FaTimes,FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

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

  const downloadPDF = async () => {
    const input = document.getElementById('history-content');
    if (!input) {
      console.error('Element with ID history-content not found');
      return;
    }

    try {
      const canvas = await html2canvas(input);
      const data = canvas.toDataURL('image/png');

      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 15;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(data, 'PNG', 5, 5, imgWidth, imgHeight);
      pdf.save('Fiche de stock.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const downloadExcel = () => {
    const table = document.getElementById("history-content").getElementsByTagName("table")[0];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);

    XLSX.utils.book_append_sheet(wb, ws, "Stock History");

    XLSX.writeFile(wb, `Stock_History_${item.name}_${startDate}_to_${endDate}.xlsx`);
  };

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
            <p className='history-close-btn' onClick={onClose}><FaTimes /></p>
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
              </tr>
            </thead>
            <tbody>
              {stockHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.updatedAt).toLocaleString()}</td>
                  <td>{entry.entry.quantity}</td>
                  <td>{entry.entry.pricePerUnit}</td>
                  <td>{entry.entry.totalAmount}</td>
                  <td>{entry.exit.quantity}</td>
                  <td>{entry.exit.pricePerUnit}</td>
                  <td>{entry.exit.totalAmount}</td>
                  <td>{entry.balance.quantity}</td>
                  <td>{entry.balance.pricePerUnit}</td>
                  <td>{entry.balance.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className='download-btn' onClick={downloadPDF}>Download PDF</button>
        <button className='download-xcl' onClick={downloadExcel}>Download Excel</button>
        
      </div>
    </div>
  );
};

export default StockHistory;
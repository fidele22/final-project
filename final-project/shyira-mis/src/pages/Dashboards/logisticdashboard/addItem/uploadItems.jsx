import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { FaFileExcel } from 'react-icons/fa';
import Swal from 'sweetalert2'; // Import SweetAlert2

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [existingItems, setExistingItems] = useState([]); // State to hold existing items

  // Fetch existing items when the component mounts
  const fetchExistingItems = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks`);
      setExistingItems(response.data.map(item => item.name.toLowerCase())); // Store existing item names in lowercase for comparison
    } catch (error) {
      console.error('Error fetching existing items:', error);
    }
  };

  // Call fetchExistingItems when the component mounts
  React.useEffect(() => {
    fetchExistingItems();
  }, []);

  // Handle file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      console.log(jsonData); // Log the data to see its structure

      // Check for duplicates
      const duplicateItems = jsonData.filter(item => existingItems.includes(item.name.toLowerCase()));
      if (duplicateItems.length > 0) {
        const duplicateNames = duplicateItems.map(item => item.name).join(', ');
        Swal.fire({
          title: 'Duplicate Items Found!',
          text: `The following items already exist: ${duplicateNames}. Please remove them from the file and try again.`,
          icon: 'warning',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal', // Optional: Apply custom class to the popup
          }
        });
        return; // Exit the function if duplicates are found
      }

      try {
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/uploadData`, jsonData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Show success message using SweetAlert2
        Swal.fire({
          title: 'Success!',
          text: 'Upload items in stock successful',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal', // Optional: Apply custom class to the popup
          }
        });
      } catch (error) {
        console.error('Error uploading data:', error);

        // Show error message using SweetAlert2
        Swal.fire({
          title: 'Error!',
          text: 'Failed to upload items data',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal', // Optional: Apply custom class to the popup
          }
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="import-container">
      <div className="upload-data">
        <label htmlFor="">Here add items in stock with its data, with uploading file of .xlsx, .xls format</label>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} required />
        <button className='upload-btn' onClick={handleUpload}>
          <FaFileExcel size={34} /> Upload
        </button>

        <div className="upload-data-info">
          <label htmlFor="">Here is how excel column must be structured</label>
          <div className="image-request-recieved">
            <img src="/image/excel.png" alt="Logo" className="logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUpload;
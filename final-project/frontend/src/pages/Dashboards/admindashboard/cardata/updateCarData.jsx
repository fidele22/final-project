import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CarCard from './MonthlyCarData';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const MonthlyCarData = () => {
  const [cars, setCars] = useState([]);
  const [editCar, setEditCar] = useState(null);
  const [filters, setFilters] = useState({
  registerNumber: '',
  month: '',
  year: ''
  });



  useEffect(() => {
    fetchLatestCars();
  }, []);

  const fetchLatestCars = async () => {
    const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/usercar-data/latest`);
    setCars(res.data);
  };

  const handleFilter = async () => {
    const params = new URLSearchParams(filters).toString();
    const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/usercar-data/filter?${params}`);
    setCars(res.data);
  };

const handleUpdate = async () => {
  try {
    await axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/api/usercar-data/update-cardata/${editCar._id}`,
      editCar
    );
    toast.success('Car data updated successfully!');
    setEditCar(null);
    fetchLatestCars();
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Failed to update car data!');
    }
  }
};


  return (
    <div className='admin-car-data'>
      <h2>Car monthly information</h2>

    <div className="filter-section">
  <input
    type="text"
    placeholder="Register Number"
    value={filters.registerNumber}
    onChange={(e) => setFilters({ ...filters, registerNumber: e.target.value })}
  />

  <select
    value={filters.month}
    onChange={(e) => setFilters({ ...filters, month: e.target.value })}
  >
    <option value="">Month</option>
    {[
      '01','02','03','04','05','06',
      '07','08','09','10','11','12'
    ].map(m => (
      <option key={m} value={m}>{m}</option>
    ))}
  </select>

  <select
    value={filters.year}
    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
  >
    <option value="">Year</option>
    {['2023', '2024', '2025', '2026'].map(y => (
      <option key={y} value={y}>{y}</option>
    ))}
  </select>

  <button onClick={handleFilter}>Filter</button>
</div>
 <label style={{fontSize:'20px'}}>Most recent</label>
   

      {/* Cards */}
      <div className="card-grid">
       
        {cars.map(car => (
          <CarCard key={car._id} car={car} onEdit={setEditCar} />
        ))}
      </div>

      {/* Edit Modal */}
   {/* Edit Modal */}
{editCar && (
 <div className="modal-editcardata-overlay">
  <div className="cardata-modal">
    <h3>Edit Car: {editCar.registerNumber}</h3>
    <label htmlFor="">Kilometer covered</label>
    <input
      type="number"
      value={editCar.kilometersCovered}
      onChange={(e) => setEditCar({ ...editCar, kilometersCovered: Number(e.target.value) })}
    />
    <label htmlFor="">Remaining Liter(s)</label>
    <input
      type="number"
      value={editCar.remainingLiters}
      onChange={(e) => setEditCar({ ...editCar, remainingLiters: Number(e.target.value) })}
    />
    <label htmlFor="">The issue date</label>
    <input
      type="date"
      value={editCar.createdAt ? new Date(editCar.createdAt).toISOString().split('T')[0] : ''}
      onChange={(e) => setEditCar({ ...editCar, createdAt: e.target.value })}
    />
    <button onClick={handleUpdate}>Update</button>
    <button onClick={() => setEditCar(null)}>Cancel</button>
  </div>
  </div>
)}

<ToastContainer position="top-right" autoClose={6000} />


    </div>
  );
};

export default MonthlyCarData;

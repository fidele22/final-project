import React, { useEffect, useState } from "react";
import axios from "axios";
import "./viewItems.css";

const DataDisplay = ({ onItemSelect }) => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/stocks`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Filter data based on search query
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
 <div className="hod-items-container">
  {/* Left: Table and Search */}
  <div className="hod-items">
    <h2>Items List Available</h2>

    <div className="search-input">
      <input
        type="text"
        placeholder="Search by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Name</th>
        </tr>
      </thead>
      <tbody>
        {currentItems.map((item, index) => (
          <tr key={index}>
            <td>{item.name}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="pagination">
      <button
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        Next
      </button>
    </div>
  </div>

  {/* Right: Welcome message with icon */}
  <div className="item-welcome-sidebar">
    <img src="/image/stockitem.jpg"  />
    <h3>Welcome!</h3>
    <p>Here you can view all the available items in our stock system. Use the search box to quickly find what you need.</p>
  </div>
</div>

  );
};

export default DataDisplay;

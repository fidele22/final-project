import React, { useState } from 'react';
import './searchable.css'; 

const SearchableDropdown = ({ options, selectedValue, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleOptionClick = (option) => {
    onSelect(option);
    setSearchQuery('');
    setIsOpen(false);
  };

  // Assuming options are objects with a `name` property
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="searchable-dropdown">
      <div
        className="dropdown-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValue || 'Select an option'}
      </div>
      {isOpen && (
        <div className="search-dropdown-menu">
          <input
            type="text"
            placeholder="Search item to request.."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <ol>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  className='dropdown-list'
                  onClick={() => handleOptionClick(option.name)} 
                >
                  {option.name} {/* Display the name */}
                </li>
              ))
            ) : (
              <li>No options found</li>
            )}
          </ol>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;

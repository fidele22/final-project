import React, { useState } from 'react';
import RequisitionVerified from './RequestVerified';
import RequisitionApproved from '../../logisticdashboard/UserRequisitions/approvedRequest';
import './RequestStatus.css'

const ItemStockManager = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };


  return (
    <div className='user-reqest-status'>
      <div className="requisition-verified">
        <RequisitionVerified />
      </div>
      <div className="requisition-approved">
        <RequisitionApproved />
      </div>
    </div>
    
  );
};

export default ItemStockManager;

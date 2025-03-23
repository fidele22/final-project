import React from 'react'
import './Footer.css'

function Footer() {
  return (
    <div className='footer'>
        <div className="footer-content">
            <img src="" alt="" />
            <p>Shyira District Hospital</p>
        </div>
        
        
     <div className="footer-copyright">
        <hr />
        <div className="footer-data">
          <div className="social-media">
            <h3>Social media</h3>
            <ol>
              <li>Facebook</li>
              <li>Instagram</li>
              <li>Linkedin</li>
            </ol>
          </div>
          <div className="services">
            <h3>Sample features</h3>
             <ul>
              <li>Make requisition</li>
              <li>Generate monthly report</li>
              <li>Verify requisition requested</li>
              <li>Approve requisition verified</li>
              <li>Truck requisition request status</li>
             </ul>
          </div>
          <div className="address">
            <h3>Address</h3>
             <ul>
              <li>8J9H+3HW, Vunga</li>
             </ul>
          </div>
        </div>
        <hr />
        <p>Copyright@2024 | All right reserved</p>
     </div>
    </div>
  )
}

export default Footer
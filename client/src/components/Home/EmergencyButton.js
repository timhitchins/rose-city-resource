import React from 'react';
import { Link } from 'react-router-dom';
import './EmergencyButton.css';

const EmergencyButtonSmall = () => { 
  return (
    <div className="emergency-button-small">
      <Link to="results?search=Fire%20Assistance%20Resources">
        <p>CLICK FOR EMERGENCY RESOURCES</p>
      </Link>
    </div>
  )
}

export default EmergencyButtonSmall;
import React from 'react';
import { Link } from 'react-router-dom';
import './EmergencyButton2.css';
import emergencyResourcesButton from './src/images/emergencyResourcesButton.png';

const EmergencyButtonSmall = () => { 
  return (
    <Link 
      to="results?search=Fire%20Assistance%20Resources"
      className='emergency-button-small'>
      <img src={flameIcon} alt="white flame icon" />
      <p>CLICK FOR EMERGENCY RESOURCES</p>
      <img src={flameIcon} alt="white flame icon" />
    </Link>
  )
}

export default EmergencyButtonSmall;
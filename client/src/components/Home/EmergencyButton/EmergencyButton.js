import React from 'react';
import { Link } from 'react-router-dom';
import './EmergencyButton.css';
import flameIcon from './../../../images/flameIcon.png';

const EmergencyButton = () => { 
  return (
    <Link 
      to="results?search=Fire%20Assistance%20Resources"
      className='emergency-button'>
      <img src={flameIcon} alt="white flame icon" />
      <p>CLICK FOR EMERGENCY RESOURCES</p>
      <img src={flameIcon} alt="white flame icon" />
    </Link>
  )
}

export default EmergencyButton;
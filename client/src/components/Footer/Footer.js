import React from 'react';
// import { Link } from 'react-router-dom';
import './Footer.css';
// import * as logo from './../../images/streetrootslogo.jpg';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { CSSTransition } from 'react-transition-group';

const Footer = props => {
  return (
    <div className="footer">
      <div className="footer-container">
        <div className="revision-date">
          Last Update: <br />
          {props.revisionDate}
        </div>
        <div className="spacer" />
        {/* <Link to="/mapping-action-collective">
          <div className="footer-item">TERMS</div>
        </Link> */}
        {/* <Link to="/terms">
          <div className="footer-item">
            <img src="https://mappingaction.files.wordpress.com/2018/09/cropped-maclogo_9_18_v5.png" />
          </div>
        </Link> */}

        <div className="footer-item">
          <a target="_blank" href="//opendata.imspdx.org/">
            <img src="https://opendata.imspdx.org/uploads/admin/2018-02-28-230321.180610WhiteNODEwlogo.png" alt="NODE-logo"/>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;

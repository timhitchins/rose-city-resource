import React from "react";
import macLogo from "../../images/mac-logo-horizontal-sm.png";
import './../../css/Footer.scss';

const Footer = (props) => {
  return (
    <footer>
      <div className="footer">
        <div className="footer-container">
          <div className="revision-date">
            Last Update: <br />
            {props.revisionDate}
          </div>
          <div className="spacer" />
          <div className="footer-item mac-logo">
          <address>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://mappingaction.org/"
            >
              <img src={macLogo} alt="MAC-logo" />
            </a>
            </address>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import * as macLogo from "../../images/mac-logo-horizontal-sm.png";
import "./Footer.css";

/* CHANGES: Added semantic <footer> and <address> tags to improve accessibility. */

/* NOTES: I left existing divs in for now since they're referenced by the stylesheet */

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
          <div className="footer-item node-logo">
          <address>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://opendata.imspdx.org/"
            >
              <img
                src="https://opendata.imspdx.org/uploads/admin/2018-02-28-230321.180610WhiteNODEwlogo.png"
                alt="NODE-logo"
              />
            </a>
            </address>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import * as macLogo from "../../images/mac-logo-horizontal-sm.png";
import "./Footer.css";

const Footer = (props) => {
  return (
    <div className="footer">
      <div className="footer-container">
        <div className="revision-date">
          Last Update: <br />
          {props.revisionDate}
        </div>
        <div className="spacer" />
        <div className="footer-item mac-logo">
          <a target="_blank" href="https://mappingaction.org/">
            <img
              src={macLogo}
              alt="NODE-logo"
            />
          </a>
        </div>
        <div className="footer-item node-logo">
          <a target="_blank" href="https://opendata.imspdx.org/">
            <img
              src="https://opendata.imspdx.org/uploads/admin/2018-02-28-230321.180610WhiteNODEwlogo.png"
              alt="NODE-logo"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;

import React from "react";
import * as srLogo from "./../images/sr-logo-transparent-background.png";
import "./../css/About.css";

const About = (props) => (
  <main className="main-container">
    <div className="about-container">
      <div className="content">
        <h1 style={{ textAlign: "center", lineHeight: "1" }}>
          Making a Great Resource Even Better
        </h1>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="//www.streetroots.org/about/work/resourceguide"
          >
            <img
              className="sr-picture"
              src="https://mappingaction.files.wordpress.com/2018/12/RCRG.jpg"
              alt="street-roots-RCR"
            />
          </a>
          The Street Roots Rose City Resource (RCR) is a 4’x 4′, 104 page guide
          that is the most comprehensive, updated list of services for people
          experiencing homelessness and poverty in Multnomah, Washington and
          Clackamas counties. More than 160,000 guides are published annually by
          Street Roots and distributed to more than 400 organizations and
          entities working with people experiencing homelessness and poverty in
          the Portland region. Until now, the guide has only been available in
          paper form.
        </p>

        <p>
          In 2018, Street Roots and Mapping Action Collective formed a
          partnership to amplify the reach of the RCR by developing a digital
          version of it. This interactive tool is the result. The digital RCR
          incorporates data collected and maintained by Street Roots and is
          frequently updated. The curated data is hosted on the Northwest Open
          Data Exchange and is available to use and distribute freely.
        </p>
        <h1 style={{ textAlign: "center", lineHeight: "1" }}>
          Learn More About the Project Partners
        </h1>
        <div className="image-container">
          <div className="sr-logo">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="//streetroots.org/"
            >
              <img src={srLogo} alt="street-roots" />
            </a>
          </div>
          <div className="mac-logo">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="//www.mappingaction.org"
            >
              <img
                src="https://mappingaction.files.wordpress.com/2018/09/cropped-maclogo_9_18_v5.png"
                alt="mapping-action-collective"
              />
            </a>
          </div>
          <div className="node-logo">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="//opendata.imspdx.org/"
            >
              <img
                src="https://opendata.imspdx.org/uploads/admin/2018-02-28-230321.180610WhiteNODEwlogo.png"
                alt="northwest-open-data-exchange"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  </main>
);

export default About;

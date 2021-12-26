import React from "react";
import MediaQuery from "react-responsive";
import { NavLink } from "react-router-dom";
import "./Nav.css";
import srLogo from "./../../images/sr-logo-sm.png";
import rcrLogo from "./../../images/rcr-logo.png";
import rcrLogoBlue from "./../../images/rcr-logo-blue.png";
import rcrLogoRed from "./../../images/rcr-logo-red.png";
import rcrLogoTeal from "./../../images/rcr-logo-teal.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSSTransition } from "react-transition-group";

const NavDrawer = ({ navVisible, onClick }) => (

  <CSSTransition
    in={navVisible}
    timeout={200}
    classNames="navdrawer"
    appear={true}
  >
    {(status) => {
      return (
        <div className="navdrawer">
          <NavLink
            className="nav-drawer-item"
            activeClassName="nav-drawer-item-active"
            exact
            to="/about"
            onClick={onClick}
          >
            ABOUT
          </NavLink>
          <NavLink
            className="nav-drawer-item"
            activeClassName="nav-drawer-item-active"
            exact
            to="/suggest-edit"
            onClick={onClick}
          >
            SUGGEST UPDATE
          </NavLink>
        </div>
      );
    }}
  </CSSTransition>
);

class Nav extends React.PureComponent {
  state = {
    navDrawerVisible: false,
  };

  toggleDrawer = () => {
    this.setState(() => ({ navDrawerVisible: !this.state.navDrawerVisible }));
  };

  logoDrawerToggle = () => this.setState(() => ({ navDrawerVisible: false }));

  render() {
    const { navDrawerVisible } = this.state;

    return (
      <div className="nav">
        <header>
          <nav className="nav-container">
            <div className="sr-logo">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://news.streetroots.org/"
                onClick={this.logoDrawerToggle}
              >
                <img src={srLogo} alt="Street Roots Home" />
              </a>
            </div>
            <div className="rcr-logo">
              <NavLink
                exact
                activeClassName="logo-active"
                to="/"
                onClick={this.logoDrawerToggle}
              >
                <img src={rcrLogoBlue} alt="Rose City Resource Home" />
              </NavLink>
            </div>
            <div className="spacer" />
            <MediaQuery query="(min-width: 600px)">
              <NavLink
                className="nav-item"
                exact
                activeClassName="nav-item-active "
                to="/about"
              >
                ABOUT
              </NavLink>
              <NavLink
                className="nav-item"
                exact
                activeClassName="nav-item-active "
                to="/suggest-edit"
              >
                SUGGEST UPDATE
              </NavLink>
            </MediaQuery>
            <MediaQuery query="(max-width: 599px)">
              {/* <div className="hamburger-button"> */}
                <FontAwesomeIcon icon={["fa", "bars"]} className='hamburger-icon' onClick={this.toggleDrawer} />
              {/* </div> */}
            </MediaQuery>
          </nav>
          <MediaQuery query="(max-width: 599.999999px)">
            <NavDrawer
              onClick={this.toggleDrawer}
              navVisible={navDrawerVisible}
            />
          </MediaQuery>
        </header>
      </div>
    );
  }
}

export default Nav;
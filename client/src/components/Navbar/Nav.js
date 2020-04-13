import React from 'react';
import MediaQuery from 'react-responsive';
import { NavLink} from 'react-router-dom';
import './Nav.css';
import * as logo from './../../images/SR-RCR-logo-transparent-large.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group';

const NavDrawer = ({ navVisible, onClick }) => (
  <CSSTransition
    in={navVisible}
    timeout={200}
    classNames="navdrawer"
    appear={true}
  >
    {status => {
      {/* console.log(status); */}
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
            SUGGEST EDIT
          </NavLink>
        </div>
      );
    }}
  </CSSTransition>
);

class Nav extends React.Component {
  state = {
    navDrawerVisible: false
  };

  toggleDrawer = () => {
    this.setState(() => ({ navDrawerVisible: !this.state.navDrawerVisible }));
  };

  logoDrawerToggle = () =>(this.setState(() => ({ navDrawerVisible: false })))

  render() {
    const { navDrawerVisible } = this.state;

    return (
      <div className="nav">
        <header>
          <nav className="nav-container">
            <div className="logo">
              <NavLink
                exact
                activeClassName="logo-active"
                to="/"
                onClick={this.logoDrawerToggle}
              >
                <img src={logo} alt="logo-home-button"/>
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
                SUGGEST EDIT
              </NavLink>
            </MediaQuery>
            <MediaQuery query="(max-width: 599px)">
              <div className="hamburger-button">
                <FontAwesomeIcon
                  // style={styles.content}
                  icon="bars"
                  size="2x"
                  onClick={this.toggleDrawer}
                />
              </div>
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

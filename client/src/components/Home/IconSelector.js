import React from "react";
import PropTypes from "prop-types";
import MediaQuery from "react-responsive";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSSTransition } from "react-transition-group";
import { objectKeyByValue, queryBuilder } from "../../utils/api.js";

//style for the icon svg itself
const styles = {
  content: {
    color: "white",
  },
};

const GeneralLarge = ({
  onMouseEnter,
  onMouseExit,
  showDropdown,
  iconMap,
  searchData,
  selectedData,
  submitSearch,
  path
}) => {
  return (
    <MediaQuery query="(min-width: 993px)">
      <div className="categories-container" onMouseLeave={() => onMouseExit()}>
        <div className="icons-container">
          {Object.keys(iconMap).map((icon) => {
            return (
              <div
                key={icon}
                className="icon-container"
                onMouseEnter={() => onMouseEnter(iconMap[icon], searchData)}
              >
                <div>
                  <FontAwesomeIcon
                    icon={icon}
                    style={styles.content}
                    size="2x"
                  />
                </div>
                <div className="icon-name">{iconMap[icon]}</div>
              </div>
            );
          })}
        </div>
        {showDropdown ? (
          <div className="icons-dropdown-container">
            {Object.keys(selectedData).map((selection) => {
              return (
                <Link
                  key={selection}
                  to={{
                    pathname: path,
                    search: queryBuilder([selection], []),
                  }}
                >
                  <div
                    className="icon-dropdown-container"
                    onClick={() => submitSearch(selection)}
                  >
                    <div className="icon-dropdown-name">{`${selection}  (${selectedData[selection]})`}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </MediaQuery>
  );
};

GeneralLarge.propTypes = {
  onMouseEnter: PropTypes.func.isRequired,
  onMouseExit: PropTypes.func.isRequired,
  showDropdown: PropTypes.bool.isRequired,
  iconMap: PropTypes.object.isRequired,
  searchData: PropTypes.object,
  selectedData: PropTypes.object,
  submitSearch: PropTypes.func.isRequired,
};

const GeneralSmall = ({
  onSelectFwd,
  iconMap,
  searchData,
  toggleBrowseContainer,
  isBrowseVisible,
}) => {
  return (
    <MediaQuery query="(max-width: 992px)">
      <div className="categories-container">
        <div
          className="browse-categories"
          onClick={() => toggleBrowseContainer()}
        >
          <div className="browse">Browse Categories</div>
          <div>
            <FontAwesomeIcon
              //use the plus icon for onClick events
              icon={"angle-down"}
              style={styles.content}
              size="lg"
            />
          </div>
        </div>
        <CSSTransition
          in={isBrowseVisible}
          timeout={500}
          classNames="browse-drawer"
          mountOnEnter={true}
        >
          {(state) => {
            return (
              <div className="icons-container">
                {Object.keys(iconMap).map((icon) => {
                  return (
                    <div
                      key={icon}
                      className="icon-container"
                      onClick={() => onSelectFwd(iconMap[icon], searchData)}
                    >
                      <div className="small-icon">
                        <FontAwesomeIcon
                          icon={icon}
                          style={styles.content}
                          size="lg"
                        />
                      </div>

                      <div className="icon-name">{iconMap[icon]}</div>
                      <div className="category-plus">
                        <FontAwesomeIcon
                          //use the plus icon for onClick events
                          icon={"angle-right"}
                          style={styles.content}
                          size="lg"
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="browse-categories-bottom" />
              </div>
            );
          }}
        </CSSTransition>
      </div>
    </MediaQuery>
  );
};

GeneralSmall.propTypes = {
  onSelectFwd: PropTypes.func.isRequired,
  iconMap: PropTypes.object.isRequired,
  searchData: PropTypes.object.isRequired,
};

const MainSmall = ({
  onSelectBack,
  selectedItem,
  selectedData,
  searchData,
  iconMap,
  submitSearch,
  toggleBrowseContainer,
  isBrowseVisible,
}) => {
  return (
    <MediaQuery query="(max-width: 992px)">
      <div className="categories-container">
        <div
          className="browse-categories"
          onClick={() => toggleBrowseContainer()}
        >
          <div className="browse">Browse Categories</div>
          <div>
            <FontAwesomeIcon
              //use the plus icon for onClick events
              icon={"angle-down"}
              style={styles.content}
              size="lg"
            />
          </div>
        </div>
        <CSSTransition
          in={isBrowseVisible}
          timeout={500}
          classNames="browse-drawer"
        >
          {(status) => (
            <div className="icons-container">
              <div
                className="selected-item"
                onClick={() => onSelectBack(searchData)}
              >
                <div>
                  <FontAwesomeIcon
                    icon={"angle-left"}
                    style={styles.content}
                    size="lg"
                  />
                </div>
                <div>
                  <FontAwesomeIcon
                    icon={objectKeyByValue(iconMap, selectedItem)[0]}
                    style={styles.content}
                    size="sm"
                  />
                </div>
                <div>{selectedItem}</div>
              </div>
              {Object.keys(selectedData).map((selection) => {
                return (
                  <Link
                    key={selection}
                    to={{
                      pathname: `/results`,
                      search: queryBuilder([selection], []),
                    }}
                  >
                    <div
                      className="icon-container"
                      onClick={() => submitSearch(selection)}
                    >
                      <div className="icon-name">{`${selection}  (${selectedData[selection]})`}</div>
                    </div>
                  </Link>
                );
              })}
              <div className="browse-categories-bottom" />
            </div>
          )}
        </CSSTransition>
      </div>
    </MediaQuery>
  );
};

MainSmall.propTypes = {
  onSelectBack: PropTypes.func.isRequired,
  selectedItem: PropTypes.string.isRequired,
  selectedData: PropTypes.object.isRequired,
  searchData: PropTypes.object.isRequired,
  iconMap: PropTypes.object.isRequired,
  submitSearch: PropTypes.func.isRequired,
};

class Selectors extends React.Component {
  state = {
    isBrowseVisible: this.props.isVisible,
  };

  toggleBrowseContainer = () => {
    this.setState((prevState) => {
      return { isBrowseVisible: !prevState.isBrowseVisible };
    });
  };

  render() {
    const { isBrowseVisible } = this.state;

    const {
      onMouseEnter,
      onMouseExit,
      onSelectFwd,
      onSelectBack,
      navCategory,
      selectedItem,
      selectedData,
      searchData,
      showDropdown,
      submitSearch,
      path,
    } = this.props;
    //set these here to make the UI render quicker upon start
    const iconMap = {
      utensils: "Food",
      home: "Housing & Shelter",
      tshirt: "Goods",
      "bus-alt": "Transit",
      heartbeat: "Health & Wellness",
      "money-bill-wave": "Money",
      "hand-holding-heart": "Care & Safety",
      briefcase: "Work",
      "balance-scale": "Legal",
      sun: "Day Services",
      "hands-helping": "Specialized Assistance",
    };

    switch (navCategory) {
      //include this switch so that the home UI renders without an async call
      case "general_category":
        // case 'main_category':
        return (
          <div>
            <GeneralLarge
              onMouseEnter={onMouseEnter}
              onMouseExit={onMouseExit}
              showDropdown={showDropdown}
              iconMap={iconMap}
              navCategory={navCategory}
              searchData={searchData}
              selectedData={selectedData}
              submitSearch={submitSearch}
              path={path}
              toggleBrowseContainer={this.toggleBrowseContainer}
              isBrowseVisible={isBrowseVisible}
            />

            <GeneralSmall
              onSelectFwd={onSelectFwd}
              navCategory={navCategory}
              iconMap={iconMap}
              searchData={searchData}
              toggleBrowseContainer={this.toggleBrowseContainer}
              isBrowseVisible={isBrowseVisible}
            />
          </div>
        );
      case "main_category":
        return (
          <div>
            <GeneralLarge
              onMouseEnter={onMouseEnter}
              onMouseExit={onMouseExit}
              showDropdown={showDropdown}
              iconMap={iconMap}
              navCategory={navCategory}
              searchData={searchData}
              submitSearch={submitSearch}
              toggleBrowseContainer={this.toggleBrowseContainer}
              isBrowseVisible={isBrowseVisible}
            />

            <MainSmall
              onSelectBack={onSelectBack}
              selectedItem={selectedItem}
              selectedData={selectedData}
              searchData={searchData}
              iconMap={iconMap}
              submitSearch={submitSearch}
              toggleBrowseContainer={this.toggleBrowseContainer}
              isBrowseVisible={isBrowseVisible}
            />
          </div>
        );
      default:
        return null;
    }
  }
}

Selectors.propTypes = {
  onMouseEnter: PropTypes.func.isRequired,
  onMouseExit: PropTypes.func.isRequired,
  onSelectFwd: PropTypes.func.isRequired,
  onSelectBack: PropTypes.func.isRequired,
  navCategory: PropTypes.string.isRequired,
  selectedItem: PropTypes.string, //need to create HOC for this
  selectedData: PropTypes.object, //nedd to create validation HOC
  searchData: PropTypes.object.isRequired,
  showDropdown: PropTypes.bool.isRequired,
  submitSearch: PropTypes.func.isRequired,
};

//All the state and methods live here and are passed down as props to all the specific components.
class IconSelector extends React.Component {
  static propTypes = {
    nodeData: PropTypes.array.isRequired,
    searchData: PropTypes.object.isRequired,
  };

  state = {
    navCategory: "general_category",
    selectedItem: null,
    selectedData: null,
    showDropdown: false,
  };

  toggleSelectedItemFwd = (selectedItem, searchData) => {
    const selectedData = searchData.main[selectedItem];

    this.setState({
      navCategory: "main_category",
      selectedItem,
      selectedData,
    });
  };

  toggleSelectedItemBack = (searchData) => {
    const selectedData = searchData.general;

    this.setState({
      selectedData,
      selectedItem: null,
      navCategory: "general_category",
    });
  };

  showSelectionBox = (selectedItem, searchData) => {
    const selectedData = searchData.main[selectedItem];

    this.setState({
      navCategory: "general_category",
      selectedItem,
      selectedData,
      showDropdown: true,
    });
  };

  hideSelectionBox = () =>
    this.setState({
      showDropdown: false,
      selectedData: null,
      selectedItem: null,
    });

  // this will be removed in favor of a Link tag
  submitSearch = (selection) => {
  };

  render() {
    const {
      navCategory,
      selectedItem,
      selectedData,
      showDropdown,
    } = this.state;

    const { searchData, path, isVisible } = this.props;

    return (
      <div className="all-categories">
        <Selectors
          onMouseEnter={this.showSelectionBox}
          onMouseExit={this.hideSelectionBox}
          onSelectFwd={this.toggleSelectedItemFwd}
          onSelectBack={this.toggleSelectedItemBack}
          navCategory={navCategory}
          selectedData={selectedData}
          searchData={searchData}
          selectedItem={selectedItem}
          showDropdown={showDropdown}
          submitSearch={this.submitSearch}
          path={path}
          isVisible={isVisible}
        />
      </div>
    );
  }
}

export default IconSelector;
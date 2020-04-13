import React from 'react';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group';
import { objectKeyByValue, queryBuilder } from '../../utils/api.js';

//style for the icon svg itself
const styles = {
  content: {
    color: 'white'
  }
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
  // toggleBrowseContainer,
  // isBrowseVisible
}) => {
  return (
    <MediaQuery query="(min-width: 993px)">
      <div className="categories-container" onMouseLeave={() => onMouseExit()}>
        <div className="icons-container">
          {Object.keys(iconMap).map(icon => {
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
            {Object.keys(selectedData).map(selection => {
              return (
                <Link
                  key={selection}
                  to={{
                    pathname: path,
                    search: queryBuilder([selection], [])
                  }}
                >
                  <div
                    className="icon-dropdown-container"
                    onClick={() => submitSearch(selection)}
                  >
                    <div className="icon-dropdown-name">{`${selection}  (${
                      selectedData[selection]
                    })`}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
        {/* <div className="browse-categories-bottom" /> */}
      </div>
    </MediaQuery>
  );
};

GeneralLarge.propTypes = {
  onMouseEnter: PropTypes.func.isRequired,
  onMouseExit: PropTypes.func.isRequired,
  showDropdown: PropTypes.bool.isRequired,
  iconMap: PropTypes.object.isRequired,
  searchData: PropTypes.object, //this is an HOC validation option
  selectedData: PropTypes.object, //this is an HOC validation option
  submitSearch: PropTypes.func.isRequired
};

const GeneralSmall = ({
  onSelectFwd,
  iconMap,
  searchData,
  toggleBrowseContainer,
  isBrowseVisible
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
              icon={'angle-down'}
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
          {state => {
            {/* console.log('browseState', state); */}
            return (
              <div className="icons-container">
                {Object.keys(iconMap).map(icon => {
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
                          icon={'angle-right'}
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
  searchData: PropTypes.object.isRequired
};

const MainSmall = ({
  onSelectBack,
  selectedItem,
  selectedData,
  searchData,
  iconMap,
  submitSearch,
  toggleBrowseContainer,
  isBrowseVisible
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
              icon={'angle-down'}
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
          {status => (
            <div className="icons-container">
              <div
                className="selected-item"
                onClick={() => onSelectBack(searchData)}
              >
                <div>
                  <FontAwesomeIcon
                    icon={'angle-left'}
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
              {Object.keys(selectedData).map(selection => {
                return (
                  <Link
                    key={selection}
                    to={{
                      pathname: `/results`,
                      search: queryBuilder([selection], [])
                    }}
                  >
                    <div
                      className="icon-container"
                      onClick={() => submitSearch(selection)}
                    >
                      <div className="icon-name">{`${selection}  (${
                        selectedData[selection]
                      })`}</div>
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
  submitSearch: PropTypes.func.isRequired
};

class Selectors extends React.Component {
  state = {
    isBrowseVisible: this.props.isVisible
  };

  // setBrowserVisibility = (visProp) => {
  //   this.setState(() => {
  //     return { isBrowseVisible: visProp };
  //   });
  // };

  toggleBrowseContainer = () => {
    this.setState(prevState => {
      return { isBrowseVisible: !prevState.isBrowseVisible };
    });
  };

  // componentDidMount() {
  //   this.setState(() => {
  //     return { isBrowseVisible: this.props.isVisible };
  //   });
  // }

  render() {
    const { isBrowseVisible } = this.state;
    // console.log('browse', isBrowseVisible);

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
      path
    } = this.props;
    //set these here to make the UI render quicker upon start
    const iconMap = {
      utensils: 'Food',
      home: 'Housing & Shelter',
      tshirt: 'Goods',
      'bus-alt': 'Transit',
      heartbeat: 'Health & Wellness',
      'money-bill-wave': 'Money',
      'hand-holding-heart': 'Care & Safety',
      briefcase: 'Work',
      'balance-scale': 'Legal',
      sun: 'Day Services',
      'hands-helping': 'Specialized Assistance'
    };

    switch (navCategory) {
      //include this switch so that the home UI renders without an async call
      case 'general_category':
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
      case 'main_category':
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
  submitSearch: PropTypes.func.isRequired
};

//All the state and methods live here and are passed down as props to all the specific components.
class IconSelector extends React.Component {
  static propTypes = {
    nodeData: PropTypes.array.isRequired,
    searchData: PropTypes.object.isRequired
  };

  state = {
    navCategory: 'general_category',
    selectedItem: null,
    selectedData: null,
    showDropdown: false
  };

  toggleSelectedItemFwd = (selectedItem, searchData) => {
    // console.log(selectedItem);
    const selectedData = searchData.main[selectedItem];

    this.setState({
      navCategory: 'main_category',
      selectedItem,
      selectedData
    });
  };

  toggleSelectedItemBack = searchData => {
    const selectedData = searchData.general;
    // console.log(selectedData);

    this.setState({
      selectedData,
      selectedItem: null,
      navCategory: 'general_category'
    });
  };

  showSelectionBox = (selectedItem, searchData) => {
    const selectedData = searchData.main[selectedItem];

    this.setState({
      navCategory: 'general_category',
      selectedItem,
      selectedData,
      showDropdown: true
    });
  };

  hideSelectionBox = () =>
    this.setState({
      showDropdown: false,
      selectedData: null,
      selectedItem: null
    });

  // this will be removed in favor of a Link tag
  submitSearch = selection => {
    // console.log(selection);
  };

  render() {
    const {
      navCategory,
      selectedItem,
      selectedData,
      showDropdown
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

// showSelectionBox = async (navCategory, selectedItem) => {
//   const selectedData = await getSelectedCategories(navCategory, selectedItem);
//   const toggleCategory = categoryFwdSwitcher(navCategory);

//   this.setState(() => ({
//     navCategory: toggleCategory,
//     selectedItem,
//     selectedData,
//     showDropdown: true
//   }));
// };

// hideSelectionBox = () => this.setState({ showDropdown: false });

// toggleSelectedItemFwd = async (navCategory, selectedItem) => {
//   // const { nodeData } = this.props;
//   // // console.log(selectedItem);
//   // const selectedData = getFilteredData(selectedItem, nodeData);
//   // console.log(selectedData);

//   const selectedData = await getSelectedCategories(navCategory, selectedItem);
//   const toggleCategory = categoryFwdSwitcher(navCategory);

//   this.setState(() => ({
//     navCategory: toggleCategory,
//     selectedItem,
//     selectedData
//   }));
// };

// toggleSelectedItemBack = async navCategory => {
//   const selectedData = await getSelectedCategories(navCategory, null);
//   const toggleCategory = categoryBackSwitcher(navCategory);
//   this.setState(() => ({
//     navCategory: toggleCategory,
//     selectedData,
//     selectedItem: null
//   }));
//   console.log(toggleCategory);
// };

// setCategories = async (navCategory, selectedItem) => {
//   //do this to deal with loading...
//   this.setState(() => ({
//     navCategory: null,
//     selectedData: null,
//     selectedItem: null
//   }));

//   const selectedData = await getSelectedCategories(navCategory, selectedItem);
//   this.setState(() => ({ navCategory, selectedItem, selectedData }));
// };

// async componentDidMount() {
//   this.setCategories(this.state.navCategory, this.state.selectedItem);
// }

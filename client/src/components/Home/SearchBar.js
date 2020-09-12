import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import LinkButton from "./LinkButton";
import "./Home.css";
import { getFilteredSearchList, queryBuilder } from "../../utils/api";

//need this to use the react portal
const modalRoot = document.getElementById("modal-root");

class AdvancedSearchModal extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    searchData: PropTypes.object.isRequired,
  };

  state = {
    categoryVals: [],
    parentVals: [],
    selection: "Category",
  };

  // this needs to be refratored a bit to be more DRY
  toggleCheckedValue = (val, selection) => {
    console.log(this.state);
    if (selection === "Category") {
      const categoryVals = [...this.state.categoryVals];
      const index = categoryVals.indexOf(val); // get index to determine if the aray gets spliced.
      if (index === -1) {
        //add to the list
        this.setState({ categoryVals: [...categoryVals, val] });
      } else {
        //remove from list
        categoryVals.splice(index, 1);
        this.setState({ categoryVals });
      }
    } else {
      const parentVals = [...this.state.parentVals];
      const index = parentVals.indexOf(val); // get index to determine if the aray gets spliced.
      if (index === -1) {
        //add to the list
        this.setState({ parentVals: [...parentVals, val] });
      } else {
        //remove from list
        parentVals.splice(index, 1);
        this.setState({ parentVals });
      }
    }
  };

  selectCategory = () => {
    this.setState({ selection: "Category" });
  };

  selectOrganization = () => {
    this.setState({ selection: "Organization" });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { categoryVals } = this.state;
    console.log("Final Search Vals", categoryVals);
  };

  handleNoSelection = (event) => {
    const { categoryVals, parentVals } = this.state;
    if (categoryVals < 1 && parentVals < 1) {
      event.preventDefault();
      alert("Please make a selection.");
    }
  };

  componentDidMount() {
    //this seems hacky.  There must be a better way...SO?
    document.getElementsByTagName("body")[0].style.overflow = "hidden";
  }

  componentWillUnmount() {
    document.getElementsByTagName("body")[0].style.overflow = "visible";
  }

  render() {
    //will likely be able to get rid of the match that was passed dow the tree
    const { searchData, onClose } = this.props;
    const { categoryVals, parentVals, selection } = this.state;

    const generalCats = Object.keys(searchData.general);
    const mainCatsMap = searchData.main;
    const parentCats = Object.keys(searchData.parent).sort();

    //style for the category selector
    const styles = { selection: { color: "#FC3C3C" } };

    return ReactDOM.createPortal(
      // loop through the search data keys to populate the
      //advanced search
      <div className="modal">
        <div className="modal-box">
          <div className="modal-search-heading-container">
            <div className="modal-heading-title">
              Search by {`${selection}`}
            </div>

            <div className="search-nav-container-2">
              <div className="modal-heading-button" onClick={onClose}>
                Cancel
              </div>
              <span className="modal-heading-divider" />
              <Link
                to={{
                  pathname: `/results`,
                  search: queryBuilder(categoryVals, parentVals),
                }}
                onClick={this.handleNoSelection}
              >
                <div className="modal-heading-button" onClick={onClose}>
                  Apply
                </div>
              </Link>
            </div>
          </div>
          <hr />
          <div className="search-nav-container-1">
            <div
              className="modal-search-category"
              onClick={this.selectCategory}
              style={selection === "Category" ? styles.selection : null}
            >
              <FontAwesomeIcon icon={"angle-left"} />
              Category
            </div>
            <span className="modal-heading-divider" />
            <div
              className="modal-search-organization"
              onClick={this.selectOrganization}
              style={selection === "Organization" ? styles.selection : null}
            >
              Organization
              <FontAwesomeIcon icon={"angle-right"} />
            </div>
          </div>
          {/* --------------------------------------------------------------------- */}
          {selection === "Category" ? (
            <form
              className="modal-search-container"
              onSubmit={this.handleSubmit}
            >
              {generalCats.map((genCat) => {
                return (
                  <div key={genCat} className="modal-search-item">
                    <div className="modal-search-item-title">{genCat}</div>
                    {Object.keys(mainCatsMap[genCat]).map((mainCat) => {
                      return (
                        <React.Fragment key={mainCat}>
                          <label
                            className="advanced-container"
                            htmlFor={mainCat}
                          >
                            {mainCat}
                            <input
                              id={mainCat}
                              type="checkbox"
                              name={mainCat}
                              value={mainCat}
                              onChange={(val) =>
                                this.toggleCheckedValue(
                                  val.target.value,
                                  selection
                                )
                              }
                            />
                            <span className="checkmark" />
                          </label>
                        </React.Fragment>
                      );
                    })}
                  </div>
                );
              })}
            </form>
          ) : (
            <form
              className="modal-search-container"
              onSubmit={this.handleSubmit}
            >
              {parentCats.map((parentCat) => {
                return (
                  <React.Fragment key={parentCat}>
                    <label className="advanced-container" htmlFor={parentCat}>
                      {parentCat}
                      <input
                        id={parentCat}
                        type="checkbox"
                        name={parentCat}
                        value={parentCat}
                        onChange={(val) =>
                          this.toggleCheckedValue(val.target.value, selection)
                        }
                      />
                      <span className="checkmark" />
                    </label>
                  </React.Fragment>
                );
              })}
            </form>
          )}
        </div>
      </div>,
      modalRoot
    );
  }
}

export default class SearchBar extends React.Component {
  static propTypes = {
    nodeData: PropTypes.array.isRequired,
    searchData: PropTypes.object.isRequired,
  };

  state = {
    searchValue: "",
    filterSearchList: null, //haven't used the filter search list yet
    showAdvSearchModal: false, //this is for the advanced search box
  };

  //for whan a user startt to enter seach item
  handleChange = (event) => {
    const value = event.target.value;
    this.setState(() => ({ searchValue: value }));
  };

  //run when the user submits the search
  handleSubmit = (event) => {
    //we use event.prevetDefault so that the submit doesn't go to a server
    event.preventDefault();
    console.log(this.state.searchValue);
  };

  toggleAdvSearchModal = () => {
    this.setState((prevState) => ({
      showAdvSearchModal: !prevState.showAdvSearchModal,
    }));
  };

  handleAdvSearchCloseModal = () =>
    this.setState({ showAdvSearchModal: false });

  render() {
    const { searchValue, showAdvSearchModal } = this.state;
    const { nodeData, searchData, match } = this.props;

    const searchCats = [
      "general_category",
      "main_category",
      "parent_organization",
      "listing",
    ];

    const searchList = getFilteredSearchList(searchCats, nodeData);

    return (
      <div className="search-bar">
        <form
          className=""
          onSubmit={this.handleSubmit}
          style={{ width: "100%" }}
        >
          <input
            className="search-input"
            id="search-item"
            placeholder="Search..."
            type="text"
            autoComplete="off"
            //bind the value of our state to the input field
            value={searchValue}
            onChange={this.handleChange}
            list="data"
          />
          {/* loop through the list of options */}
          <datalist id="data">
            {searchList.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          {/* W.8.23.20 QUESTION: how can we change this to handle multiple search terms? or misspellings, alternate capitalization, etc? 
          
          right now it only works if a single search term is spelled exactly correctly, with the words in order. for example, we have both Spanish language services, and mental health services in the database, but "spanish mental health" has 0 matches. What's the best way to fix this? */}
          <LinkButton
            className="search-button"
            to={`/results?search=${searchValue}`}
            onClick={this.handleSubmit}
          >
            <FontAwesomeIcon icon="search" />
          </LinkButton>
        </form>
        <div className="advanced-search" onClick={this.toggleAdvSearchModal}>
          Advanced Search
        </div>
        {showAdvSearchModal ? (
          <AdvancedSearchModal
            onClose={this.handleAdvSearchCloseModal}
            searchData={searchData}
            match={match} // this was passed down via React router
          />
        ) : null}
      </div>
    );
  }
}

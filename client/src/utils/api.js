import { findDistance, inOutLocation } from "./distance";
import fetch from "node-fetch";

// ASYNC DATA UTLS--------------------------------------------------------
//async function to fetch revision history
//based on rose-city-resource
export async function getPackageData() {
  ///new logic
  const uri = "/api/package";
  const packageData = await fetch(uri)
    .catch(handleError)
    .then((response) => response.json());
  return packageData;
}

//async fucntion to get data from node and add in phone records
export async function getNodeData() {
  try {
    const uri = "/api/listings-resource";
    const listingsResponse = await fetch(uri);
    const listingsJson = await listingsResponse.json();
    const listingsData = await listingsJson.result.records;

    //get the NODE phone table
    const phoneData = await getPhoneData();

    //add the distance info here
    let currentCoords;
    const position = await inOutLocation().catch((e) =>
      console.log("Error getting position: ", e)
    );

    if (position !== undefined) {
      currentCoords = [position.coords.latitude, position.coords.longitude];
    } else {
      currentCoords = null;
    }

    //get the user's location
    const listingsDataPhoneData = phonePositionJoiner(
      listingsData,
      phoneData,
      currentCoords
    );

    return listingsDataPhoneData;
  } catch (err) {
    console.log(err);
  }
}

//async funtion to get phone data
//which will then be joined to nodeData
export async function getPhoneData() {
  try {
    const uri = "/api/phone-resource";
    const phoneResponse = await fetch(uri);
    const phoneJson = await phoneResponse.json();
    const phoneData = await phoneJson.result.records;

    return phoneData;
  } catch (err) {
    console.log(err);
  }
}

// SYNC DATA UTILS-----------------------------------------------------------------

//funtion to create a data string based
//on UTC string returned from package data
export function dateString(utcString) {
  return utcString.split("T")[0];
}
//sync funtion that returns filtered node data using
//values from any of the search options (listing, parent_org, main_category)
//this function uses helper functions
export function getNodeFilteredData(
  searchVals,
  categoryVals,
  parentVals,
  nodeData
) {
  //if the searchVal is undefined then
  //do this
  if (searchVals === undefined) {
    const filteredNodeData = getFilteredCatParentData(
      categoryVals,
      parentVals,
      nodeData
    );
    return filteredNodeData;
  } else {
    const filteredNodeData = getFilteredSearchData(searchVals, nodeData);
    return filteredNodeData;
  }
}

//this also may not be used
export function getFilteredSearchList(searchCats, nodeData) {
  const filteredValsList = nodeData.map((record) => {
    return searchCats.map((cat) => record[cat]);
  });
  const catList = [].concat(...filteredValsList);
  return [...new Set(catList)].sort();
}

//functions to set up category search data
export function getCategorySearchData(nodeData, category) {
  const genCats = nodeData.map((record) => {
    const generalRecord = record[category];
    return generalRecord;
  });
  const filteredGenCats = genCats.filter((cat) => cat !== "NA");

  return countDuplicates(filteredGenCats);
}

export function getMainSearchData(nodeData) {
  // these will eventually need to be added in dynamically
  const genCats = [
    "Food",
    "Housing & Shelter",
    "Goods",
    "Transit",
    "Health & Wellness",
    "Money",
    "Care & Safety",
    "Work",
    "Legal",
    "Day Services",
    "Specialized Assistance",
  ];

  const mainCats = genCats.map((cat, i) => {
    const filterCats = nodeData.filter(
      (record) => record.general_category === cat
    );
    return filterCats;
  });

  const mainCatsCount = mainCats.map((cat, i) => {
    const catVals = cat.map((c) => {
      return c["main_category"];
    });
    return countDuplicates(catVals);
  });

  const mainCategory = genCats.reduce(
    (o, k, i) => ({ ...o, [k]: mainCatsCount[i] }),
    {}
  );

  return mainCategory;
}

//function to return phone records obejct in
//a card taking into account NA
export function cardPhoneTextFilter(record) {
  if (record.phone.length > 0) {
    const cleanPhone = record.phone.map((phoneRecord) => {
      const phone1 = phoneRecord.phone;
      const phone2 = naRemove(phoneRecord.phone2);
      //return the new object
      return {
        type: phoneRecord.type,
        phone: phone1 + phone2,
      };
    });
    return cleanPhone;
  } else {
    return null;
  }
}

export function cardTextFilter(recordKey) {
  return naRemove(recordKey).trim();
}

export function cardWebAddressFixer(webAddress) {
  // if(address.indexOf("http") > 0)
  const webAddressFilter = cardTextFilter(webAddress);
  if (webAddress.indexOf("http") < 0 && webAddressFilter !== "") {
    return `http://${webAddressFilter}`;
  }
  return webAddressFilter;
}

//function to build the map data object
export function mapDataBuilder(nodeData) {
  const mapData = nodeData.map((record) => {
    if (record.lat !== "NA") {
      const coords = [Number(record.lat), Number(record.lon)];
      const { listing, street, street2, hours, id } = record;
      return {
        coords,
        popup: {
          listing,
          street,
          street2: cardTextFilter(street2),
          hours: cardTextFilter(hours),
          id,
        },
      };
    }
  });

  const mapDataFilter = mapData.filter((el) => el !== undefined);

  const latArr = mapDataFilter.map((item) => item.coords[0]);
  const lonArr = mapDataFilter.map((item) => item.coords[1]);
  //now use the getCenter() helper function
  const center = getCenter(latArr, lonArr, [45.52345, -122.6762]);

  return { mapData: mapDataFilter, center };
}

export function cardDetailsFilter(nodeData, savedIds) {
  function exists(rec) {
    return savedIds.indexOf(rec.id) > -1;
  }

  const filteredDetailsData = nodeData.filter(exists);
  return filteredDetailsData;
}

// NON-EXPORTED HELPER UTILS-------------------------------------------------------
//helper function for buildings the direction string
function stringBuilder(str) {
  return str.split(" ").join("+");
}

//helper function to build directions for google
export function directionsUrlBuilder(street, city, postal_code) {
  if (street !== "NA") {
    return `/${stringBuilder(street)}+${stringBuilder(city)}+${stringBuilder(
      postal_code
    )}`;
  } else {
    return "NA";
  }
}

//helper function to get the center of a map
//use this in the mapDatabuilder function
function getCenter(latArr, lonArr, defaultArr) {
  const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
  const lat = average(latArr);
  const lon = average(lonArr);

  if (isNaN(lat)) return defaultArr;
  return [lat, lon];
}

//check if parent or category vals in records
//helper for getFilteredNodeData
function getFilteredCatParentData(categoryVals, parentVals, nodeData) {
  const checkVals = [
    // ...handleArray(searchVals),
    ...handleArray(categoryVals),
    ...handleArray(parentVals),
  ].filter((el) => el !== null);

  const filteredNodeData = nodeData.filter((record) => {
    //create another array to see if checkVals are in
    //the nodeVals
    const nodeVals = [
      record.listing,
      record.parent_organization,
      record.main_category,
      record.general_category,
    ];
    //check to see if any values in one array are in the other array
    //and if so return the record
    if (nodeVals.some((item) => checkVals.indexOf(item) >= 0)) {
      record.directionsUrl = directionsUrlBuilder(
        record.street,
        record.city,
        record.postal_code
      );
      return record;
    } else {
      return null;
    }
  });
  //filter out the nulls
  return filteredNodeData.filter((el) => el !== null);
}

//check if a search value is in the NODE record
//this function is gonna be used for individual searches
//helper for getFilteredNodeData
function getFilteredSearchData(searchValue, nodeData) {
  //Polyfill from SO to use toLowerCase()
  if (!String.toLowerCase) {
    String.toLowerCase = function (s) {
      return String(s).toLowerCase();
    };
  }

  const filterData = nodeData.map((record) => {
    const recordValsLower = Object.values(record).map(
      (val) => {
        return String(val).toLowerCase();
      } //I miss R
    );
    if (recordValsLower.join(" ").includes(String(searchValue).toLowerCase())) {
      record.directionsUrl = directionsUrlBuilder(
        record.street,
        record.city,
        record.postal_code
      );
      return record;
    }
  });
  // remove the undefined els from the list
  return filterData.filter((el) => el);
}

//function to deal with 'NA' values
//and return an empty string instead
function naRemove(str) {
  if (str === "NA") return "";
  return " " + str;
}

//function to join the phone data to the nodeData based on id
function phonePositionJoiner(nodeData, phoneData, currentCoords) {
  const nodePhoneData = nodeData.map((listRecord) => {
    //filter out the phone records that relate to the nodeRecord
    const phoneKeep = phoneData.filter((phoneRecord) => {
      return phoneRecord.id === listRecord.id;
    });

    //calculate the distance here
    const listCoords = [Number(listRecord.lat), Number(listRecord.lon)];
    let distance;
    //handle whether an array was returned
    if (Array.isArray(currentCoords)) {
      distance = findDistance(currentCoords, listCoords);
    } else {
      distance = null;
    }
    return Object.assign(listRecord, { phone: phoneKeep, distance: distance });
  });
  return nodePhoneData;
}

//count the duplicates in an array and
//retrun an obect with the value and count
function countDuplicates(arr) {
  const map = arr.reduce(function (prev, cur) {
    prev[cur] = (prev[cur] || 0) + 1;
    return prev;
  }, {});
  return map;
}

//helper function to deal with the
//parsing of query string
function handleArray(item) {
  if (item === undefined) return [null];
  if (Array.isArray(item)) return item;
  if (typeof item === "string") return [item];
}

//for async errors
//this can be more expressive
function handleError(error) {
  console.warn("Something went wrong with a fetch.", error);

  return null;
}

// EXPORTED HELPER UTILS ----------------------------------------------

//function to generate query
//for detaisl page
export function detailsQueryBuilder(savedIds) {
  // if(savedIds.length===0){
  //   alert('No saved listings.')
  // }
  const queryDetailString = savedIds.join("&saved=");
  return `saved=${queryDetailString}`;
}

//get the object keys based on value
export function objectKeyByValue(obj, val) {
  return Object.entries(obj).find((i) => i[1] === val);
}

//make a query builder that will be passed to react router
//parameter expect an array
export function queryBuilder(categoryVals, parentVals) {
  let categoryString = "";
  let parentString = "";

  for (let i = 0; i < categoryVals.length; i++) {
    categoryString += `category=${encodeURIComponent(categoryVals[i])}&`;
  }

  for (let i = 0; i < parentVals.length; i++) {
    parentString += `parent=${encodeURIComponent(parentVals[i])}&`;
  }

  const queryString = `?${categoryString}${parentString}`;
  return queryString;
}

//sort the cards based on the retirned distance
export function cardSortByDistance(data) {
  function compare(a, b) {
    a = a["distance"];
    b = b["distance"];
    if (isFinite(a - b)) {
      return a - b;
    } else {
      return isFinite(a) ? -1 : 1; // switch these to retrun NaN at top
    }
  }
  return data.sort(compare);
}

// --------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// --END USED FUNCTION UTILS----------------------------------------------------

//UNUSED ASYNC DATA UTILS--------------------------------------------------------

//fetching utils
// export async function getSearchData(searchCats) {
//   const searchList = searchCats.join(" ,");

//   const uri = `https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT ${searchList} from "${listingResource}"`;
//   const searchData = await fetch(uri)
//     .then((response) => response.json())
//     .then((json) => json.result.records)
//     .catch(handleError);

//   const filteredValsList = searchData.map((record) => {
//     return searchCats.map((cat) => record[cat]);
//   });
//   const catList = [].concat(...filteredValsList);
//   return [...new Set(catList)].sort();
// }

// //
// export async function getSelectedCategories(navCategory, selectedItem) {
//   if (selectedItem === null) {
//     const dataResponse = await fetch(
//       `https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT general_category from "${listingResource}"`
//     ).catch(handleError);

//     const jsonDataArr = await dataResponse
//       .json()
//       .then((json) => json.result.records)
//       .then((records) => {
//         return records.map((record) => Object.values(record));
//       });

//     const jsonDataCount = await countDuplicates(jsonDataArr);
//     // console.log('jsonDataCount', jsonDataCount);
//     return jsonDataCount;
//   } else {
//     const cleanSelectedItem = selectedItem.replace("&", "%26");
//     const uri = `https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT main_category from "${listingResource}" WHERE ${navCategory} LIKE '${cleanSelectedItem}'`;

//     const dataResponse = await fetch(uri).catch(handleError);

//     const jsonDataArr = await dataResponse
//       .json()
//       .then((json) => json.result.records)
//       .then((records) => {
//         return records.map((record) => Object.values(record));
//       });

//     const jsonDataCount = await countDuplicates(jsonDataArr);
//     return jsonDataCount;
//   }
// }

// //build the query from results of search
// //include helper functions which are below
// export async function nodeQueryBuilder(catVals, parentVals, searchVals = []) {
//   //return a null is both values are undefined
//   //this can likely be handled in the adv search
//   if (catVals === undefined && parentVals === undefined) {
//     return null;
//   } else {
//     const categoryString = queryStringBuilder(catVals, "main");
//     const parentString = queryStringBuilder(parentVals, "parent");

//     //put the URI together, this can be further split
//     const uri = `https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT * from "${listingResource}" WHERE ${categoryString} OR ${parentString}`;

//     const response = await fetch(uri).catch(handleError);

//     const jsonDataArr = await response
//       .json()
//       .then((json) => json.result.records)
//       .then((records) => records);

//     return jsonDataArr;
//   }
// }

// UNUSED SYNC DATA UTILS ------------------------------------------------

//////data utils for switching categories
// export function categoryFwdSwitcher(category) {
//   if (category === "general_category") {
//     return "main_category";
//   }
// }

// export function categoryBackSwitcher(category) {
//   if (category === "main_category") {
//     return "general_category";
//   }
//   if (category === "general_category") {
//     return null;
//   }
// }

// UNUSED HELPER UTILS-----------------------------------------------------------

//helper function
//build the string while expecting an array
//deal with category type and
// function queryStringBuilder(arrItem, category) {
//   //sanitize the arrItem
//   const arr = handleArray(arrItem);

//   if (category === "main") {
//     if (arr !== null) {
//       const categoryString = arr
//         .map((val) => {
//           const encodeUri = encodeURIComponent(val);
//           return `'${encodeUri}'`;
//         })
//         .join("OR main_category LIKE ");

//       return `main_category LIKE ${categoryString}`;
//     } else {
//       return null;
//     }
//   }

//   if (category === "parent") {
//     if (arr !== null) {
//       const parentString = arr
//         .map((val) => {
//           const encodeUri = encodeURIComponent(val);
//           return `'${encodeUri}'`;
//         })
//         .join("OR parent_organization LIKE ");

//       return `parent_organization LIKE ${parentString}`;
//     }
//     return null;
//   }
// }

// UNUSED PROP TYPE UTILS---------------------------------------------------

//prop-types helpers
// export function conditionalPropType(condition, message) {
//   if (typeof condition !== "function")
//     throw "Wrong argument type 'condition' supplied to 'conditionalPropType'";
//   return function (props, propName, componentName) {
//     if (condition(props, propName, componentName)) {
//       return new Error(
//         `Invalid prop '${propName}' '${props[propName]}' supplied to '${componentName}'. ${message}`
//       );
//     }
//   };
// }

//More async funtions that interact with NODE
// export async function getCategoryList(navCategory) {
//   const uri = `https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT  from "${listingResource}" WHERE 'main_category' LIKE ${navCategory}`;
//   const categories = await fetch(uri);
//   return categories;
// }

////////////////////////////////////////////////////IN DEV
// export async function getSearchList(searchCats) {
//   //if needed in dev, here is a proxy
//   const proxy = 'https://cors-anywhere.herokuapp.com/';

//   //categories to include in the initial searching
//   const searchCatsUri = searchCats.join(', ');
//   const uri = `https://opendata.imspdx.org/api/3/action/datastore_search_sql?sql=SELECT ${searchCatsUri} from "${listingResource}"`;
//   const searchData = await fetch(uri)
//     .then(response => response.json())
//     .then(json => json.result.records)
//     //select out the values only
//     .then(records => {
//       return records.map(record => Object.values(record));
//     })
//     //concatenate lists and filter duplicates
//     .then(lists => {
//       const catList = [].concat.apply([], lists);
//       return [...new Set(catList)].sort();
//     });
//   //return the final filtered list
//   return searchData;
// }

///////////////////////////////////////////
// return a list with full NODE data and filtered list for search bar
// export async function getFilteredSearchList(searchCats) {
//   let nodeData;
//   const searchData = await getNodeData()
//     .then(json => {
//       nodeData = json.result.records;
//       return nodeData;
//     })
//     .then(records => {
//       const filteredValsList = records.map(record => {
//         return searchCats.map(cat => record[cat]);
//       });
//       return filteredValsList;
//     })
//     .then(searchList => {
//       const catList = [].concat(...searchList);
//       return [...new Set(catList)].sort();
//     });
//   return [nodeData, searchData];
// }
/////////////////////////////////
// export function getCategorySearchData(nodeData) {
//   const categories = nodeData.map(record => {
//     const generalVal = record['general_category'];
//     const mainVal = record['main_category'];
//     return { generalVal, mainVal };
//   });

//   return categories;
// }

import { findDistance, inOutLocation } from "./distance";

let _datatableVersion = '';

// ASYNC DATA UTLS--------------------------------------------------------

/* Get the time stamp of the last update to the production_data table */
export async function getRecordsLastUpdatedTimestamp() {
  const uri = '/api/last-update';
  const last_update = await fetch(uri)
    .catch(e => {
      console.log(e);
      handleError();
    })
    .then(r => {
      if (r.ok) {
        return r.json().catch(e => {
          console.log(e);
        })
      }
      else {
        console.log('Unable to connect to the server');
        return '';
      }
    })
  return last_update
}

/* Add the distance that the listing's address is from the user as a property on the listing */
async function addDistancesToRecords(records) {
  // Attempt to get the user's geolocation from the browser
  let currentCoords;
  const position = await inOutLocation().catch((e) =>
    console.log("Error getting position: ", e)
  );
  if (position !== undefined) {
    currentCoords = [position.coords.latitude, position.coords.longitude];
  } else {
    currentCoords = null;
  }

  // Calculate the distance between the user's location and the geolocation of each listing and add to the listing
  for (let i = 0; i < records.length; i++) {
    if (records[i].lat === '' || records[i].lon === '') {
      records[i].distance = null;
      continue;
    }
    const listCoords = [Number(records[i].lat), Number(records[i].lon)];
    let distance;
    if (Array.isArray(currentCoords)) {
      distance = findDistance(currentCoords, listCoords);
    } else {
      distance = null;
    }

    records[i].distance = distance;
  }

  return records;
}

/* Download records by fetching JSON from the appropriate API route */
export async function getRecords() {

  const uri = getQueryStringParameterValue('datatable') === 'staging'
    ? '/api/query-staging'
    : '/api/query'

  try {
    const queryResponse = await fetch(uri).catch(e => console.log(e));
    const records = await queryResponse.json().catch(e => console.log(e));
    if (!queryResponse.ok) {
      console.log('Server error: ' + queryResponse.statusText);
    }
    if (records === null || records === undefined || !(records instanceof Array) || records.length === 0) {
      return null;
    }
    // Add the distance that each record's geolocation is from the user's location
    const recordsWithDistances = await addDistancesToRecords(records);

    _datatableVersion = uri === '/api/query-staging'
      ? 'staging'
      : 'production'

    return recordsWithDistances;
  } catch (err) {
    console.log(err);
  }
}

// SYNC DATA UTILS-----------------------------------------------------------------

//funtion to create a data string based
//on UTC string returned from package data
export function dateString(utcString) {
  if (utcString === null || !(utcString instanceof String) || utcString === '') {
    return '';
  }
  return utcString.split("T")[0] || utcString;
}

//sync funtion that returns filtered node data using
//values from any of the search options (listing, parent_org, main_category)
//this function uses helper functions
export function getFilteredRecords(
  searchVals,
  categoryVals,
  parentVals,
  records
) {
  //if the searchVal is undefined then
  //do this
  if (searchVals === undefined) {
    const filteredrecords = getFilteredCatParentData(
      categoryVals,
      parentVals,
      records
    );
    return filteredrecords;
  } else {
    const filteredrecords = getFilteredSearchData(searchVals, records);
    return filteredrecords;
  }
}

export function getFilteredSearchList(searchCats, records) {
  if (records === null || records === undefined || !(records instanceof Array) || records.length === 0) {
    return null;
  }
  const filteredValsList = records.map((record) => {
    return searchCats.map((cat) => record[cat]);
  });
  const catList = [].concat(...filteredValsList);
  return [...new Set(catList)].sort();
}

//functions to set up category search data
export function getCategorySearchData(records, category) {
  if (records === null || records === undefined || !(records instanceof Array) || records.length === 0) {
    return null;
  }
  const genCats = records.map((record) => {
    const generalRecord = record[category];
    return generalRecord;
  });
  const filteredGenCats = genCats.filter((cat) => cat !== "NA");

  return countDuplicates(filteredGenCats);
}

export function getMainSearchData(records) {
  if (records === null || records === undefined || !(records instanceof Array) || records.length === 0) {
    return null;
  }
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
    const filterCats = records.filter(
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

/* Extract phone information from a record into the format needed to display in a card */
export function cardPhoneTextFilter(record) {
  const rawphone = record.phone;
  if (rawphone === null || rawphone === '') {
    return null;
  }
  const split = rawphone.split(',');
  if (split != null && split.length && split.length > 0) {
    return split.map(number => {
      if (number.includes(':')) {
        return {
          type: number.split(':')[0],
          phone: number.split(':')[1]
        }
      }
      else {
        return {
          type: 'Contact',
          phone: number
        }
      }
    })
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
export function mapDataBuilder(records) {
  if (records === null || records === undefined || !(records instanceof Array) || records.length === 0) {
    return null;
  }
  const mapData = records.map((record) => {
    if (record.lat !== '' && record.lon !== '') {
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
    } else {
      return null;
    }
  });

  const mapDataFilter = mapData.filter((el) => el !== null && el !== undefined);
  const latArr = mapDataFilter.map((item) => item.coords[0]);
  const lonArr = mapDataFilter.map((item) => item.coords[1]);
  const center = getCenter(latArr, lonArr, [45.52345, -122.6762]);

  return { mapData: mapDataFilter, center };
}

export function cardDetailsFilter(records, savedIds) {
  if (records === null || records === undefined || !(records instanceof Array) || records.length === 0) {
    return null;
  }
  function exists(rec) {
    return savedIds.indexOf(rec.id) > -1;
  }

  const filteredDetailsData = records.filter(exists);
  return filteredDetailsData;
}

// NON-EXPORTED HELPER UTILS-------------------------------------------------------

//helper function for buildings the direction string
function stringBuilder(str) {
  return str != null ? str.split(" ").join("+") : '';
}

//helper function to build directions for google
export function directionsUrlBuilder(street, city, postal_code) {
  if (street !== '') {
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
//helper for getFilteredrecords
function getFilteredCatParentData(categoryVals, parentVals, records) {
  const checkVals = [
    // ...handleArray(searchVals),
    ...handleArray(categoryVals),
    ...handleArray(parentVals),
  ].filter((el) => el !== null);

  return records.filter((record) => {
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
}

//check if a search value is in the NODE record
//this function is gonna be used for individual searches
//helper for getFilteredrecords
function getFilteredSearchData(searchValue, records) {
  if (records === null || records === undefined || !(records instanceof Array) || records.length === 0) {
    return null;
  }
  //Polyfill from SO to use toLowerCase()
  if (!String.toLowerCase) {
    String.toLowerCase = function (s) {
      return String(s).toLowerCase();
    };
  }

  const filterData = records.map((record) => {
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
    } else {
      return null;
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

/* Get a query string parameter by name */
export function getQueryStringParameterValue(paramName) {
  const qs = window.location.search;
  const params = new URLSearchParams(qs);
  return params.get(paramName);
}

export function getDatatableVersion() {
  return _datatableVersion;
}

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
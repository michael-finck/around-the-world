// Global variables for map and GeoJSON data
let map;
let geojsonLayer;
const selectedCountries = {}; // Object to track selected countries
const continents = {
  "North America": [],
  "South America": [],
  "Europe": [],
  "Asia": [],
  "Africa": [],
  "Oceania": [],
  "Antarctica": []
};

// Initialize the map
function initializeMap() {
  map = L.map('map').setView([20, 0], 2); // Center on the world map, zoom level 2

  // Set up the tile layer for the map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Load the GeoJSON data for countries and add it to the map
  loadGeoJSONData();
}

// Load the GeoJSON data for countries
function loadGeoJSONData() {
  fetch('https://www.dropbox.com/scl/fi/hgp5egbzl96uz4jt8arxt/gadm_410.gpkg?rlkey=qj2kpi26ql6w47915xmiymxfb&st=shc29177&raw=1')
    .then(response => response.json())
    .then(data => {
      geojsonLayer = L.geoJSON(data, {
        onEachFeature: onEachCountry
      }).addTo(map);
    });
}

// Function to handle each country feature in GeoJSON
function onEachCountry(feature, layer) {
  const countryName = feature.properties.NAME;
  const continentName = feature.properties.CONTINENT;

  // Add the country to the continent group
  if (continents[continentName]) {
    continents[continentName].push(countryName);
  }

  // Highlight the country when clicked
  layer.on({
    click: () => highlightCountry(countryName, layer)
  });
}

// Function to highlight a selected country
function highlightCountry(countryName, layer) {
  if (selectedCountries[countryName]) {
    // Unhighlight if it's already selected
    layer.setStyle({ fillColor: 'gray' });
    delete selectedCountries[countryName];
  } else {
    // Highlight the country in red
    layer.setStyle({ fillColor: 'red' });
    selectedCountries[countryName] = true;
  }

  // Update the country list
  updateCountryList();
}

// Update the list of selected countries by continent
function updateCountryList() {
  const countryListContainer = document.getElementById('countryList');
  countryListContainer.innerHTML = ''; // Clear the existing list

  Object.keys(continents).forEach(continent => {
    const continentSection = document.createElement('div');
    continentSection.classList.add('continent-section');

    const continentHeader = document.createElement('h3');
    continentHeader.textContent = continent;

    // Highlight continent header if it has selected countries
    if (continents[continent].some(country => selectedCountries[country])) {
      continentHeader.classList.add('highlight');
    }

    continentSection.appendChild(continentHeader);

    const countryList = document.createElement('ul');
    continents[continent].forEach(country => {
      if (selectedCountries[country]) {
        const countryItem = document.createElement('li');
        countryItem.textContent = country;
        countryList.appendChild(countryItem);
      }
    });

    continentSection.appendChild(countryList);
    countryListContainer.appendChild(continentSection);
  });
}

// Initialize the country search functionality
function initializeSearch() {
  const countrySearchInput = document.getElementById('countrySearch');
  countrySearchInput.addEventListener('input', () => {
    const searchText = countrySearchInput.value.toLowerCase();

    geojsonLayer.eachLayer(layer => {
      const countryName = layer.feature.properties.NAME.toLowerCase();
      const shouldDisplay = countryName.includes(searchText);
      layer.setStyle({ opacity: shouldDisplay ? 1 : 0.2 }); // Adjust opacity to show/hide countries based on search
    });
  });
}

// Run the initialization functions when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeMap();  // Initialize the map
  initializeSearch();  // Initialize the search functionality
});

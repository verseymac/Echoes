import { getUserLocation }
from "./geolocation.js";

import {
  initializeMap,
  addMarker,
  clearMarkers
}
from "./map.js";

import {
  getNearbyHistory
}
from "./wikidata.js";

import {
  showDetails
}
from "./ui.js";

let currentLocation;

async function loadHistory() {

  clearMarkers();

  addMarker(
  {
    name: "Test Echo",
    lat: currentLocation.lat + 0.003,
    lon: currentLocation.lon + 0.003,
    article: "https://en.wikipedia.org/wiki/History"
  },
  showDetails
);

  const radius =
    document.getElementById("radius").value;

  const results =
    await getNearbyHistory(
      currentLocation.lat,
      currentLocation.lon,
      radius
    );

    console.log(results);

    results.forEach(result => {

    const coord =
      result.coord.value;

    const match =
      coord.match(
        /Point\\(([-0-9.]+) ([-0-9.]+)\\)/
      );

    if (!match) return;

    const item = {

      name:
        result.placeLabel.value,

      lon:
        parseFloat(match[1]),

      lat:
        parseFloat(match[2]),

      article:
        result.article?.value || null
    };

    addMarker(item, showDetails);
  });
}

async function start() {

  try {

    currentLocation =
      await getUserLocation();

    initializeMap(
      currentLocation.lat,
      currentLocation.lon
    );

    await loadHistory();

    document
      .getElementById("radius")
      .addEventListener(
        "change",
        loadHistory
      );

  } catch (error) {

    console.error(error);

    alert(
      "Please allow location access to use Echoes."
    );
  }
}

start();
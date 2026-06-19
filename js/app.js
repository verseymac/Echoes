import { getUserLocation } from "./geolocation.js";

import {
  initializeMap,
  addMarker,
  clearMarkers,
  revealMarker
} from "./map.js";

import { fetchNearbyEchoes } from "./wikidata.js";

import { showDetails, setLoading } from "./ui.js";

import { initializeTabs } from "./tabs.js";

import { renderEchoes } from "./echoes.js";

const discoveredEchoes = new Set(
  JSON.parse(
    localStorage.getItem("echoes_discovered") || "[]"
  )
);


let currentLocation;

// ----------------------------
// LOAD ECHOES
// ----------------------------
async function loadHistory() {
  setLoading();
  clearMarkers();

  // User marker
  addMarker({
    title: "You are here",
    type: "user",
    lat: currentLocation.lat,
    lng: currentLocation.lng,
    userLat: currentLocation.lat,
    userLng: currentLocation.lng,
    article: null
  }, showDetails);

  const radius = Number(
    document.getElementById("radius").value
  )*1000;

  try {

    const results = await fetchNearbyEchoes(
      currentLocation.lat,
      currentLocation.lng,
      radius
    );

    console.log("Echoes loaded:", results);

    // Test marker
    // addMarker({
    //   title: "Test Echo",
    //   lat: currentLocation.lat + 0.003,
    //   lng: currentLocation.lng + 0.003,
    //   article: "https://en.wikipedia.org/wiki/History"
    // }, showDetails);

    if (!results || results.length === 0) {
      console.log("No Echoes found.");
      return;
    }

    results.forEach(result => {

addMarker({
  id: result.id,
  title: result.title,
  type: result.type,
  lat: result.lat,
  lng: result.lng,
  userLat: currentLocation.lat,
  userLng: currentLocation.lng,
  article: null,
  discovered: discoveredEchoes.has(result.id)
}, (item) => {

  discoveredEchoes.add(item.id);

  localStorage.setItem(
  "echoes_discovered",
  JSON.stringify(
    [...discoveredEchoes]
  )
);

const savedEchoes =
  JSON.parse(
    localStorage.getItem("saved_echoes")
    || "[]"
  );

if (
  !savedEchoes.some(
    echo => echo.id === item.id
  )
) {

  savedEchoes.push({
    id: item.id,
    title: item.title,
    type: item.type
  });

  localStorage.setItem(
    "saved_echoes",
    JSON.stringify(savedEchoes)
  );
}

  renderEchoes();
  
  revealMarker(item.id, item.type);

  showDetails({
    ...item,
    discovered: true
  });

});

    });

  } catch (error) {

    console.error("Failed to load Echoes:", error);

  }
}

// ----------------------------
// START APP
// ----------------------------
async function start() {

  try {

    currentLocation = await getUserLocation();

    console.log(
      "User location received:",
      currentLocation
    );

    initializeMap(
      currentLocation.lat,
      currentLocation.lng
    );

    initializeTabs();

    renderEchoes();

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

// ----------------------------
// BOOT APP
// ----------------------------
start();
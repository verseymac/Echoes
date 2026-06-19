import { getUserLocation } from "./geolocation.js";

import {
  initializeMap,
  addMarker,
  clearMarkers,
  revealMarker
} from "./map.js";

import { fetchNearbyEchoes } from "./wikidata.js";

import {
  showDetails,
  setLoading
} from "./ui.js";

import { initializeTabs } from "./tabs.js";

import { renderEchoes } from "./echoes.js";

import { calculateDistance } from "./utils.js";

const discoveredEchoes = new Set(
  JSON.parse(
    localStorage.getItem("echoes_discovered") || "[]"
  )
);

let currentLocation;

//Location Updating
function startLiveTracking() {

  if (!navigator.geolocation) return;

  navigator.geolocation.watchPosition(
    (position) => {

      currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      console.log("Live position update:", currentLocation);

      updateEchoDistances();

    },
    (error) => {
      console.warn("Live tracking error:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000
    }
  );

}

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
  ) * 1000;

  try {

    const results = await fetchNearbyEchoes(
      currentLocation.lat,
      currentLocation.lng,
      radius
    );

    console.log("Echoes loaded:", results);

    if (!results || results.length === 0) {
      console.log("No Echoes found.");
      return;
    }

    results.forEach(result => {

      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        result.lat,
        result.lng
      );

      // ----------------------------
      // AUTO DISCOVERY (100m)
      // ----------------------------
      const isNew = !discoveredEchoes.has(result.id);

      if (distance <= 100 && isNew) {

        discoveredEchoes.add(result.id);

        localStorage.setItem(
          "echoes_discovered",
          JSON.stringify([...discoveredEchoes])
        );

        const savedEchoes =
          JSON.parse(
            localStorage.getItem("saved_echoes") || "[]"
          );

        const exists =
          savedEchoes.find(e => e.id === result.id);

        if (exists) {

          exists.closestDistance = 100;
          exists.discoveredAt = new Date().toISOString();

        } else {

          savedEchoes.push({
            id: result.id,
            title: result.title,
            type: result.type,
            lat: result.lat,
            lng: result.lng,
            discoveredAt: new Date().toISOString(),
            closestDistance: 100
          });
        }

        localStorage.setItem(
          "saved_echoes",
          JSON.stringify(savedEchoes)
        );

        renderEchoes();

        showDetails({
          ...result,
          discovered: true
        });

        if ("Notification" in window &&
            Notification.permission === "granted") {

          new Notification("Echo Discovered", {
            body: result.title
          });

        }
      }

      // ----------------------------
      // NORMAL MARKER
      // ----------------------------
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
          JSON.stringify([...discoveredEchoes])
        );

        const savedEchoes =
          JSON.parse(
            localStorage.getItem("saved_echoes") || "[]"
          );

        const exists =
          savedEchoes.find(e => e.id === item.id);

        if (!exists) {

          savedEchoes.push({
            id: item.id,
            title: item.title,
            type: item.type,
            lat: item.lat,
            lng: item.lng,
            discoveredAt: new Date().toISOString(),
            closestDistance: Math.round(distance)
          });

        }

        localStorage.setItem(
          "saved_echoes",
          JSON.stringify(savedEchoes)
        );

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

function updateEchoDistances() {

  const savedEchoes =
    JSON.parse(
      localStorage.getItem("saved_echoes") || "[]"
    );

  let changed = false;

  savedEchoes.forEach(echo => {

    if (!echo.lat || !echo.lng) return;

    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      echo.lat,
      echo.lng
    );

    if (!echo.closestDistance ||
        distance < echo.closestDistance) {

      echo.closestDistance =
        Math.round(distance);

      changed = true;
    }

    // ----------------------------
    // AUTO DISCOVERY (LIVE)
    // ----------------------------
    const alreadyDiscovered =
      discoveredEchoes.has(echo.id);

    if (distance <= 100 && !alreadyDiscovered) {

      discoveredEchoes.add(echo.id);

      echo.discoveredAt =
        new Date().toISOString();

      localStorage.setItem(
        "echoes_discovered",
        JSON.stringify([...discoveredEchoes])
      );

      if ("Notification" in window &&
          Notification.permission === "granted") {

        new Notification("Echo Discovered", {
          body: echo.title
        });

      }

      changed = true;
    }

  });

  if (changed) {

    localStorage.setItem(
      "saved_echoes",
      JSON.stringify(savedEchoes)
    );

    renderEchoes();

  }
}

// ----------------------------
// START APP
// ----------------------------
async function start() {

  try {

    currentLocation = await getUserLocation();

    console.log("User location received:", currentLocation);

    initializeMap(
      currentLocation.lat,
      currentLocation.lng
    );

    initializeTabs();

    startLiveTracking();
    
    renderEchoes();

    // Notification permission
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    // Reset button
    document
      .getElementById("reset-echoes")
      .addEventListener("click", () => {

        localStorage.removeItem("saved_echoes");
        localStorage.removeItem("echoes_discovered");

        discoveredEchoes.clear();

        renderEchoes();
        clearMarkers();
        loadHistory();

        alert("Echoes reset complete.");

      });

    await loadHistory();

    document
      .getElementById("radius")
      .addEventListener("change", loadHistory);

  } catch (error) {

    console.error(error);

    alert("Please allow location access to use Echoes.");

  }
}

// ----------------------------
// BOOT APP
// ----------------------------
start();
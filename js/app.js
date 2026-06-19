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
  setLoading,
  renderUserScore
} from "./ui.js";

import { initializeTabs } from "./tabs.js";

import { renderEchoes } from "./echoes.js";

import {
  calculateDistance,
  getEchoState,
  getEchoScore
} from "./utils.js";

// ----------------------------
// STATE
// ----------------------------

let currentLocation;

let totalScore =
  Number(localStorage.getItem("echo_score") || 0);

const discoveredEchoes = new Set(
  JSON.parse(
    localStorage.getItem("echoes_discovered") || "[]"
  )
);

// ----------------------------
// LIVE TRACKING
// ----------------------------

function startLiveTracking() {

  if (!navigator.geolocation) return;

  navigator.geolocation.watchPosition(
    (position) => {

      currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

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
// UPDATE DISTANCES + STATES
// ----------------------------

function updateEchoDistances() {

  const savedEchoes =
    JSON.parse(localStorage.getItem("saved_echoes") || "[]");

  let changed = false;

  savedEchoes.forEach(echo => {

    if (!echo.lat || !echo.lng) return;

    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      echo.lat,
      echo.lng
    );

    // Track closest approach
    if (!echo.closestDistance ||
        distance < echo.closestDistance) {

      echo.closestDistance = Math.round(distance);
      changed = true;
    }

    // Determine state
    const state = getEchoState(distance);

    if (!echo.state) echo.state = "hidden";

    const previousState = echo.state;

    if (state !== previousState) {

      echo.state = state;

      const gained = getEchoScore(state);

      totalScore += gained;

      localStorage.setItem("echo_score", totalScore);

      changed = true;

      // Mark discovered
      if (state !== "hidden") {

        discoveredEchoes.add(echo.id);

        echo.discoveredAt =
          echo.discoveredAt ||
          new Date().toISOString();
      }

      // Notification
      if ((state === "visited" || state === "mastered") &&
          "Notification" in window &&
          Notification.permission === "granted") {

        new Notification("Echo Progress", {
          body: `${echo.title} → ${state}`
        });
      }
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

    if (!results || results.length === 0) return;

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
          JSON.parse(localStorage.getItem("saved_echoes") || "[]");

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
            closestDistance: 100,
            state: "discovered"
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
      // MARKER
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
          JSON.parse(localStorage.getItem("saved_echoes") || "[]");

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
            closestDistance: Math.round(distance),
            state: "discovered"
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

// ----------------------------
// START APP
// ----------------------------

async function start() {

  try {

    currentLocation = await getUserLocation();

    initializeMap(
      currentLocation.lat,
      currentLocation.lng
    );

    initializeTabs();

    startLiveTracking();

    renderEchoes();

    renderUserScore();

    if ("Notification" in window) {
      Notification.requestPermission();
    }

    document
      .getElementById("reset-echoes")
      .addEventListener("click", () => {

        localStorage.removeItem("saved_echoes");
        localStorage.removeItem("echoes_discovered");

        discoveredEchoes.clear();
        totalScore = 0;

        localStorage.setItem("echo_score", "0");

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
// BOOT
// ----------------------------

start();
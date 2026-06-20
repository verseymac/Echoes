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

import {
  searchWikipedia,
  getWikipediaSummary
} from "./wikipedia.js";

import { initializeTabs } from "./tabs.js";
import { renderEchoes } from "./echoes.js";

import {
  calculateDistance,
  getEchoState,
  getEchoScore
} from "./utils.js";

import {
  getEchoRarity
} from "./rarity.js";


import {
  buildNarrative
} from "./history.js";

// ----------------------------
// STATE
// ----------------------------

let currentLocation;

let totalScore =
  Number(localStorage.getItem("echo_score") || 0);

const discoveredEchoes = new Set(
  JSON.parse(localStorage.getItem("echoes_discovered") || "[]")
);



function getEchoStats() {

  const saved =
    JSON.parse(localStorage.getItem("saved_echoes") || "[]");

  const score =
    Number(localStorage.getItem("echo_score") || 0);

  return {
    count: saved.length,
    score
  };
}

// ----------------------------
// HUD (NEW)
// ----------------------------

function updateHUD() {

  const stats = getEchoStats();

  const countEl = document.getElementById("hud-count");
  const scoreEl = document.getElementById("hud-score");

  if (countEl) {
    countEl.textContent = `Echoes: ${stats.count}`;
  }

  if (scoreEl) {
    scoreEl.textContent = `Score: ${stats.score}`;
  }

  // ALSO update user page if visible
  const userCount = document.getElementById("echo-count");

  if (userCount) {
    userCount.textContent = stats.count;
  }

  renderUserScore();
}
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
// DISTANCE + STATE SYSTEM
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

    const state = getEchoState(distance);

    if (!echo.state) echo.state = "hidden";

    const previousState = echo.state;

    if (state !== previousState) {

      echo.state = state;

      const gained = getEchoScore(state);

      totalScore += gained;

      localStorage.setItem("echo_score", totalScore);

      changed = true;

      // discovery tracking
      if (state !== "hidden") {

        discoveredEchoes.add(echo.id);

        echo.discoveredAt =
          echo.discoveredAt || new Date().toISOString();
      }

      // notification
      if (
        (state === "visited" || state === "mastered") &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("Echo Progress", {
          body: `${echo.title} → ${state}`
        });
      }
    }
  });

  if (changed) {

    localStorage.setItem("saved_echoes", JSON.stringify(savedEchoes));

    renderEchoes();
    renderUserScore();
    updateHUD();
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

  const radius =
    Number(document.getElementById("radius").value) * 1000;

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
      // AUTO DISCOVERY
      // ----------------------------

      const isNew =
        !discoveredEchoes.has(result.id);

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
            state: "discovered",
            wikidata: result.wikidata,
            wikipedia: result.wikipedia
          });
        }

        localStorage.setItem(
          "saved_echoes",
          JSON.stringify(savedEchoes)
        );

        renderEchoes();
        updateHUD();

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
            state: "discovered",
            wikidata: item.wikidata,
            wikipedia: item.wikipedia
          });
        }

        localStorage.setItem(
          "saved_echoes",
          JSON.stringify(savedEchoes)
        );

        renderEchoes();
        updateHUD();

        revealMarker(item.id, item.type);

        openEchoPage({
          ...item,
          discovered: true
        });

      });

    });

  } catch (error) {

    console.error("Failed to load Echoes:", error);
  }
}

async function openEchoPage(echo) {

  const page =
    document.getElementById("echo-detail-page");

  const content =
    document.getElementById("echo-detail-content");

  page.style.display = "block";

  document.getElementById("discover-page").style.display = "none";
  document.getElementById("echoes-page").style.display = "none";
  document.getElementById("user-page").style.display = "none";

  content.innerHTML = `
    <h2>${echo.title}</h2>
    <p>Searching history...</p>
  `;

  try {

    let wikiTitle = null;

if (echo.wikipedia) {

  wikiTitle =
    echo.wikipedia.replace("en:", "");

} else {

  wikiTitle =
    await searchWikipedia(
      `${echo.title} ${echo.type || ""}`
    );

}

    const wiki =
      wikiTitle
        ? await getWikipediaSummary(wikiTitle)
        : null;

        const narrative =
  buildNarrative(
    echo.title,
    wiki?.extract
  );

const discovered =
  echo.discoveredAt
    ? new Date(
        echo.discoveredAt
      ).toLocaleDateString()
    : "Today";

const closest =
  echo.closestDistance
    ? `${echo.closestDistance}m`
    : "Unknown";

const rarity = "📜 Common";

const rarity =
  getEchoRarity(echo);

const discovered =
  echo.discoveredAt
    ? new Date(
        echo.discoveredAt
      ).toLocaleDateString()
    : "Today";

const closest =
  echo.closestDistance
    ? `${echo.closestDistance}m`
    : "Unknown";    

        content.innerHTML = `
<div class="echo-card">

  <div class="echo-rarity">
    ${rarity}
  </div>

  <h2>${echo.title}</h2>

  <div class="echo-meta">
    Discovered: ${discovered}
    <br>
    Closest Approach: ${closest}
  </div>

  ${
    wiki?.thumbnail?.source
      ? `
      <img
        src="${wiki.thumbnail.source}"
        alt="${echo.title}"
        class="echo-image"
      >
      `
      : ""
  }

  <p>
    <strong>Type:</strong>
    ${echo.type || "Historic Site"}
  </p>

<p>
  ${narrative}
</p>

  ${
    wiki?.content_urls?.desktop?.page
      ? `
      <p>
        <a
          href="${wiki.content_urls.desktop.page}"
          target="_blank"
        >
          Read Full Article
        </a>
      </p>
      `
      : ""
  }

</div>
`;

  } catch (error) {

    console.error(
      "History lookup failed:",
      error
    );

    content.innerHTML = `
      <h2>${echo.title}</h2>

      <p>
        Historical information unavailable.
      </p>
    `;
  }
}

// ----------------------------
// START
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
    updateHUD();

    if ("Notification" in window) {
      Notification.requestPermission();
    }

    document
  .getElementById("back-to-map")
  .addEventListener("click", () => {

    document.getElementById(
      "echo-detail-page"
    ).style.display = "none";

    document.getElementById(
      "discover-page"
    ).style.display = "block";

    document.getElementById(
      "user-page"
    ).style.display = "none";

    document.getElementById(
      "echoes-page"
    ).style.display = "none";
});

window.addEventListener("open-echo", (e) => {

  const id = e.detail;

  const saved =
    JSON.parse(localStorage.getItem("saved_echoes") || "[]");

  const echo = saved.find(x => String(x.id) === String(id));

  if (!echo) {
    console.log("Echo not found:", id);
    return;
  }

  // Switch tab (if exists)
  document.querySelector('[data-tab="echoes"]')?.click();

  // Show details
openEchoPage(echo);
});

    document
      .getElementById("reset-echoes")
      .addEventListener("click", () => {

        localStorage.removeItem("saved_echoes");
        localStorage.removeItem("echoes_discovered");
        localStorage.removeItem("echo_score");

        discoveredEchoes.clear();
        totalScore = 0;

        renderEchoes();
        renderUserScore();
        updateHUD();
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

  document.getElementById("echo-detail-page").style.display = "none";
  document.getElementById("discover-page").style.display = "block";

};



// ----------------------------
// BOOT
// ----------------------------

start();
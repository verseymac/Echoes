import { showSavedEcho } from "./ui.js";

export function renderEchoes() {

  const container =
    document.getElementById("echoes-list");

  const echoes =
    JSON.parse(
      localStorage.getItem("saved_echoes")
      || "[]"
    );

  if (echoes.length === 0) {

    container.innerHTML =
      "No Echoes discovered yet.";

    return;
  }

  container.innerHTML =
    echoes
      .map(
        echo => `
          <div
            class="saved-echo"
            data-id="${echo.id}"
          >
            <h3>${echo.title}</h3>

            <p>
              ${echo.type || "Historic Site"}
            </p>
          </div>
        `
      )
      .join("");

  // Add click events
  document
    .querySelectorAll(".saved-echo")
    .forEach(card => {

      card.addEventListener("click", () => {

        const echo =
          echoes.find(
            e => e.id == card.dataset.id
          );

        if (!echo) return;

        showSavedEcho(echo);

      });

    });

}
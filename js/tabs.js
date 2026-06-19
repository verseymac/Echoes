export function initializeTabs() {

  const tabs =
    document.querySelectorAll("[data-tab]");

  const pages = [
    "discover-page",
    "echoes-page",
    "user-page"
  ];

  tabs.forEach(tab => {

    tab.addEventListener("click", () => {

      pages.forEach(page => {

        document
          .getElementById(page)
          .style.display = "none";

      });

      document
        .getElementById(
          `${tab.dataset.tab}-page`
        )
        .style.display = "block";

    });

  });

}
export function showDetails(item) {

  const container =
    document.getElementById("content");

  container.innerHTML = `
    <h3>${item.name}</h3>

    ${
      item.article
        ? `
          <p>
            <a
              href="${item.article}"
              target="_blank"
            >
              Read on Wikipedia
            </a>
          </p>
        `
        : "<p>No Wikipedia article available.</p>"
    }
  `;
}
export function showDetails(item) {

  const container =
    document.getElementById("content");

  const formattedType =
    (item.type || "historic site")
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());

  container.innerHTML = `
    <h3>${item.title}</h3>

    <p>
      <strong>Type:</strong>
      ${formattedType}
    </p>

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
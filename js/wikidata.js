const ENDPOINT =
  "https://query.wikidata.org/sparql";

export async function getNearbyHistory(
  lat,
  lon,
  radiusKm
) {

  const query = `
  SELECT
    ?place
    ?placeLabel
    ?coord
    ?article
  WHERE {

    SERVICE wikibase:around {
      ?place wdt:P625 ?coord .

      bd:serviceParam wikibase:center
      "Point(${lon} ${lat})"^^geo:wktLiteral ;

      wikibase:radius "${radiusKm}" .
    }

    OPTIONAL {
      ?article schema:about ?place ;
      schema:isPartOf <https://en.wikipedia.org/> .
    }

    SERVICE wikibase:label {
      bd:serviceParam wikibase:language "en".
    }
  }

  LIMIT 100
  `;

  const url =
    ENDPOINT +
    "?query=" +
    encodeURIComponent(query);

  const response = await fetch(url, {
    headers: {
      Accept: "application/sparql-results+json"
    }
  });

  const data = await response.json();

  return data.results.bindings;
}
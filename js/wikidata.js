// V0.2 Echoes Data Layer - OpenStreetMap Overpass API

export async function fetchNearbyEchoes(lat, lon, radius = 25000) {

    const query = `
[out:json];
(
  node["historic"](around:${radius},${lat},${lon});
  way["historic"](around:${radius},${lat},${lon});
  relation["historic"](around:${radius},${lat},${lon});

  node["tourism"](around:${radius},${lat},${lon});
  way["tourism"](around:${radius},${lat},${lon});
  relation["tourism"](around:${radius},${lat},${lon});

  node["amenity"="monument"](around:${radius},${lat},${lon});
  way["amenity"="monument"](around:${radius},${lat},${lon});
);
out center;
`;

    try {

        const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
                method: "POST",
                body: query
            }
        );

        const data = await response.json();

        console.log("Overpass raw data:", data);

        return (data.elements || [])
            .map(el => {

                const lat = el.lat || el.center?.lat;
                const lon = el.lon || el.center?.lon;

                return {
                    id: el.id,
                    lat,
                    lon,
                    title: el.tags?.name || "Unknown Historic Site",
                    type: el.tags?.historic || "historic"
                };

            })
            .filter(e => e.lat && e.lon);

    } catch (err) {

        console.error("Echoes Overpass error:", err);
        return [];

    }
}
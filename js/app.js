const results =
  await fetchNearbyEchoes(
    currentLocation.lat,
    currentLocation.lon,
    radius
  );

console.log("Echoes loaded:", results);

results.forEach(result => {

  const item = {

    title: result.title,
    lat: Number(result.lat),
    lng: Number(result.lon),
    article: null

  };

  addMarker(item, showDetails);

});
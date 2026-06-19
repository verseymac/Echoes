export function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R = 6371e3;

  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;

  const Δφ =
    (lat2 - lat1) *
    Math.PI / 180;

  const Δλ =
    (lon2 - lon1) *
    Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) *
    Math.sin(Δφ / 2) +
    Math.cos(φ1) *
    Math.cos(φ2) *
    Math.sin(Δλ / 2) *
    Math.sin(Δλ / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;

}

export function getEchoState(distance) {

  if (distance <= 10) return "mastered";
  if (distance <= 50) return "visited";
  if (distance <= 100) return "discovered";
  return "hidden";
}

export function getEchoScore(state) {

  switch (state) {

    case "mastered":
      return 50;

    case "visited":
      return 25;

    case "discovered":
      return 10;

    default:
      return 0;
  }
}
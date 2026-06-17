export function getUserLocation() {
  return new Promise((resolve, reject) => {

    if (!navigator.geolocation) {
      reject("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {

        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });

      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true
      }
    );

  });
}
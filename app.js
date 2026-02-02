const firebaseURL =
  "https://locationconsentapp-default-rtdb.firebaseio.com/locations.json";

function getDeviceInfo() {
  const ua = navigator.userAgent;

  let deviceType = /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";
  let os = "Unknown";

  if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("iPhone")) os = "iOS";
  else if (ua.includes("Mac")) os = "MacOS";

  return { deviceType, os, userAgent: ua };
}

function requestLocation() {
  const status = document.getElementById("status");

  if (!navigator.geolocation) {
    status.innerText = "Geolocation not supported.";
    return;
  }

  status.innerText = "Requesting location permission…";

  navigator.geolocation.getCurrentPosition(
    position => {
      const payload = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        time: new Date().toISOString(),
        device: getDeviceInfo()
      };

      fetch(firebaseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      .then(() => {
        status.innerText = "Location captured successfully.";
      })
      .catch(() => {
        status.innerText = "Failed to send data.";
      });
    },
    () => {
      status.innerText = "Location permission denied.";
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

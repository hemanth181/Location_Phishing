const firebaseURL =
  "https://locationconsentapp-default-rtdb.firebaseio.com/locations.json";

function getDeviceInfo() {
  const ua = navigator.userAgent;

  let deviceType = /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";
  let os = "Unknown OS";

  if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("iPhone")) os = "iOS";
  else if (ua.includes("Mac")) os = "MacOS";

  return {
    deviceType,
    os,
    browser: navigator.appName,
    userAgent: ua
  };
}

function requestLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  if (!confirm("Do you agree to share your location?")) return;

  navigator.geolocation.getCurrentPosition(
    position => {
      const payload = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        time: new Date().toISOString(),
        device: getDeviceInfo()
      };

      saveData(payload);
    },
    () => alert("Permission denied")
  );
}

function saveData(payload) {
  if (!navigator.onLine) {
    // offline → store locally
    let offlineData =
      JSON.parse(localStorage.getItem("offlineLocations")) || [];
    offlineData.push(payload);
    localStorage.setItem("offlineLocations", JSON.stringify(offlineData));
    alert("Offline: Location saved and will sync later");
    return;
  }

  sendToFirebase(payload);
}

function sendToFirebase(payload) {
  fetch(firebaseURL, {
    method: "POST",
    body: JSON.stringify(payload)
  }).then(() => {
    alert("Location shared successfully");
  });
}

// Auto-sync when internet comes back
window.addEventListener("online", () => {
  let offlineData =
    JSON.parse(localStorage.getItem("offlineLocations")) || [];

  offlineData.forEach(data => sendToFirebase(data));
  localStorage.removeItem("offlineLocations");
});

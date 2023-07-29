
const menu = document.getElementById("menu");
const settings = document.getElementById("sidebar");
const closeSettings = document.getElementById("close-settings");
const modal = document.getElementById("modal");

// Function to toggle the menu content visibility
function toggleMenu() {
  if (settings.style.display === "block") {
    settings.style.display = "none";
    modal.style.display = "none";
  } else {
   settings.style.display = "block";
   modal.style.display = "block";
  }
}

// Add a click event listener to the hamburger button
menu.addEventListener("click", toggleMenu);
closeSettings.addEventListener("click", toggleMenu);

function handleWindowResize() {
    if (window.innerWidth > 1335) {
        settings.style.display = "block";
    } else {
        settings.style.display = "none";
    }
}
  // Add a resize event listener to the window
  window.addEventListener("resize", handleWindowResize);

//   handleWindowResize();
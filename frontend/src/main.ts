import Fuego from "./index";
import App from "./app";
import "./global/style.css";

// Handle browser back button to prevent navigation and stay on current page
window.addEventListener("popstate", (event) => {
  // Get current path
  const currentPath = window.location.pathname;

  // Immediately push the current path back to prevent going back
  window.history.pushState({ preventBack: true }, "", currentPath);

  // Re-render the app to ensure it stays on the current page
  const setRender = Fuego.useRender();
  if (setRender) {
    setRender(null);
  }

  // Optional: Show a message or perform any action when back is attempted
  console.log(
    "Back navigation prevented - staying on current page:",
    currentPath
  );
});

// Initialize history state
window.history.replaceState(
  { preventBack: true },
  "",
  window.location.pathname
);

requestIdleCallback(Fuego.workLoop);

const appElement = document.querySelector<HTMLDivElement>("#app")!;
Fuego.render(Fuego.createElement(App, null), appElement);

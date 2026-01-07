import Fuego from "./index";
import App from "./app";
import "./global/style.css";

window.addEventListener("popstate", (event) => {

  const currentPath = window.location.pathname;

  window.history.pushState({ preventBack: true }, "", currentPath);

  const setRender = Fuego.useRender();
  if (setRender) {
    setRender(null);
  }

  console.log(
    "Back navigation prevented - staying on current page:",
    currentPath
  );
});

window.history.replaceState(
  { preventBack: true },
  "",
  window.location.pathname
);

requestIdleCallback(Fuego.workLoop);

const appElement = document.querySelector<HTMLDivElement>("#app")!;
Fuego.render(Fuego.createElement(App, null), appElement);

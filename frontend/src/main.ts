import Fuego from "./index";
import App from "./app";
import "./global/style.css";

requestIdleCallback(Fuego.workLoop);

const appElement = document.querySelector<HTMLDivElement>("#app")!;
Fuego.render(Fuego.createElement(App, null), appElement);

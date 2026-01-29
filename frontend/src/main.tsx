import React from "react";
import ReactDOM from 'react-dom/client';
import App from "./app";
import "./global/style.css";

const appElement = document.querySelector<HTMLDivElement>("#app")!;
const root = ReactDOM.createRoot(appElement);
root.render(<App />);

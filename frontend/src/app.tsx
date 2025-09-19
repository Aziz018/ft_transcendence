import { MyReact } from "./lib/core";
import { Router } from "./lib/router";
import Dashboard from "./screens/Dashboard/Dashboard";
import Home from "./screens/Home/Home";
import Login from "./screens/Login/Login";
import Register from "./screens/Register/Register";

function App() {
  return (
    <div>
      <main id="router-outlet"></main>
    </div>
  );
}

export function initializeApp() {
  const appContainer = document.getElementById("app")!;
  MyReact.render(<App />, appContainer);

  const routerContainer = document.getElementById("router-outlet")!;
  const router = new Router(routerContainer);

  router.addRoute("/", () => <Home />);
  router.addRoute("/login", () => <Login />);
  router.addRoute("/register", () => <Register />);
  router.addRoute("/dashboard", () => <Dashboard />);

  window.addEventListener("navigate", ((e: CustomEvent) => {
    router.navigate(e.detail);
  }) as EventListener);

  const initialPath = window.location.pathname || "/";
  router.navigate(initialPath, false);
}

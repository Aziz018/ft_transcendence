import Fuego from "./index";
import { Router } from "./library/Router/Router";
import { FunctionComponent } from "./library/types/types";
import Login from "./screens/Login/Login";
import Home from "./screens/Home/Home";
import SignUp from "./screens/SignUp/SignUp";
import Dashboard from "./screens/Dashboard/Dashboard";
import Game from "./screens/Game/Game";
import Chat from "./screens/Chat/Chat";
import SecondaryLogin from "./screens/SecondaryLogin/SecondaryLogin";

const App: FunctionComponent = () => {
  return (
    <div className="">
      <main>
        <Router path="/" Component={Home} />
        <Router path="/login" Component={Login} />
        <Router path="/signup" Component={SignUp} />
        <Router path="/dashboard" Component={Dashboard} />
        <Router path="/game" Component={Game} />
        <Router path="/chat" Component={Chat} />
        <Router path="/secondary-login" Component={SecondaryLogin} />
      </main>
    </div>
  );
};

export default App;

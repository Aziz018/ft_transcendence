import Fuego from "./index";
import { Router } from "./library/Router/Router";
import { FunctionComponent } from "./library/types/types";
import Login from "./screens/Login/Login";
import Home from "./screens/Home/Home";
import SignUp from "./screens/SignUp/SignUp";
import Dashboard from "./screens/Dashboard/Dashboard";
import Game from "./screens/Game/Game";
import Chat from "./screens/Chat/Chat";
import Settings from "./screens/Settings/Settings";
import Leaderboard from "./screens/Leaderboard/Leaderboard";
import Tournament from "./screens/Tournament/Tournament";
import SecondaryLogin from "./screens/SecondaryLogin/SecondaryLogin";
import ToastContainer from "./components/Toast/ToastContainer";

const App: FunctionComponent = () => {
  return (
    <div className="h-screen w-full overflow-hidden">
      <main className="h-full w-full">
        <Router path="/" Component={Home} />
        <Router path="/login" Component={Login} />
        <Router path="/signup" Component={SignUp} />
        <Router path="/dashboard" Component={Dashboard} />
        <Router path="/game" Component={Game} />
        <Router path="/chat" Component={Chat} />
        <Router path="/settings" Component={Settings} />
        <Router path="/leaderboard" Component={Leaderboard} />
        <Router path="/tournament" Component={Tournament} />
        <Router path="/secondary-login" Component={SecondaryLogin} />
      </main>
      <ToastContainer />
    </div>
  );
};

export default App;

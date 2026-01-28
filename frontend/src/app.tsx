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
import Career from "./screens/Career/Career";
import ToastContainer from "./components/Toast/ToastContainer";
import GameInviteProvider from "./components/GameInvite/GameInviteProvider";

const App: FunctionComponent = () => {
  return (
    <GameInviteProvider>
      <div className="h-screen w-full overflow-hidden">
        <main className="h-full w-full">
          <Router path="/" Component={Home} />
          <Router path="/login" Component={Login} />
          <Router path="/signup" Component={SignUp} />
          <Router path="/dashboard" Component={Dashboard} protectedRoute={true} />
          <Router path="/game" Component={Game} protectedRoute={true} />
          <Router path="/game/:roomId" Component={Game} protectedRoute={true} />
          <Router path="/chat" Component={Chat} protectedRoute={true} />
          <Router path="/settings" Component={Settings} protectedRoute={true} />
          <Router path="/leaderboard" Component={Leaderboard} protectedRoute={true} />
          <Router path="/career" Component={Career} protectedRoute={true} />
          <Router path="/tournament" Component={Tournament} protectedRoute={true} />
          <Router path="/secondary-login" Component={SecondaryLogin} />
        </main>
        <ToastContainer />
      </div>
    </GameInviteProvider>
  );
};

export default App;

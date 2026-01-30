import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./router";
import Login from "./screens/Login/Login";
import Home from "./screens/Home/Home";
import SignUp from "./screens/SignUp/SignUp";
import Dashboard from "./screens/Dashboard/Dashboard";
import Chat from "./screens/Chat/Chat";
import Settings from "./screens/Settings/Settings";
import Leaderboard from "./screens/Leaderboard/Leaderboard";
import Career from "./screens/Career/Career";
import Game from "./screens/Game/Game";
import SecondaryLogin from "./screens/SecondaryLogin/SecondaryLogin";
import ToastContainer from "./components/Toast/ToastContainer";
import Terms from "./screens/Legal/Terms";
import Privacy from "./screens/Legal/Privacy";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="h-screen w-full overflow-hidden">
        <main className="h-full w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/career" element={<ProtectedRoute><Career /></ProtectedRoute>} />
            <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
            <Route path="/secondary-login" element={<SecondaryLogin />} />

            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
};

export default App;

import Fuego from "./index";
import { Router, Link } from "./library/Router/Router";
import { FunctionComponent } from "./library/types/types";
import Login from "./screens/Login/Login";
import Home from "./screens/Home/Home";
import SignUp from "./screens/SignUp/SignUp";

const App: FunctionComponent = () => {
  return (
    <div className="">
      <main>
        <Router path="/" Component={Home} />
        <Router path="/login" Component={Login} />
        <Router path="/signup" Component={SignUp} />
      </main>
    </div>
  );
};

export default App;

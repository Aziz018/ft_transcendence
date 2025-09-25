import Fuego from "./index";
import { Router, Link } from "./library/Router/Router";
import { FunctionComponent } from "./library/types/types";
import Login from "./screens/Login/Login";
import Home from "./screens/Home/Home";

const App: FunctionComponent = () => {
  return (
    <div className="">
      <main>
        <Router path="/" Component={Home} />
        <Router path="/login" Component={Login} />
      </main>
    </div>
  );
};

export default App;

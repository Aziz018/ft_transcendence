import { MyReact } from "./lib/core";
import { useState } from "./lib/hooks";
import { Router, Link } from "./lib/router";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: Event) => {
    e.preventDefault(); // prevent form submission reload
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onInput={(e: any) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onInput={(e: any) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Login
          </button>
        </form>

        <Link
          to="/home"
          className="text-sm text-indigo-600 hover:underline mt-4 block text-center">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="bg-[#141517] min-h-screen w-full overflow-hidden relative">
      {/* Background blur effects */}
      <div className="absolute w-[900px] h-[900px] top-[829px] left-[9px] bg-[#f9f9f980] rounded-full blur-[153px]" />
      <div className="absolute w-[700px] h-[700px] top-[300px] left-[-450px] bg-[#dda15e] rounded-full blur-[153px]" />
      <div className="bg-[#141517] min-h-screen w-full overflow-hidden relative">
        {/* Background blur effects */}
        <div className="absolute w-[900px] h-[900px] top-[400px] left-[300px] bg-[#f9f9f980] rounded-full blur-[153px]" />
        <div className="absolute w-[700px] h-[700px] top-[200px] left-[-100px] bg-[#dda15e] rounded-full blur-[153px]" />

        {/* Header */}

        {/* Main content */}
        <main className="px-[153px] pt-[118px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left column - Main content */}
            <div className="space-y-8">
              <div className="[font-family:'Questrial',Helvetica] font-normal text-[#ffffff80] text-xl">
                Master The Game With Just One Swing
              </div>

              <h1 className="[font-family:'Questrial',Helvetica] font-normal text-white text-5xl leading-[87px] max-w-[686px]">
                One Swing To Rule The Table <br />a Power Move To Conquer Every
                Rally.
              </h1>

              <div className="space-y-4">
                <Link
                  to="/login"
                  className="px-3 py-2 text-gray-700 hover:text-gray-900">
                  <button className="bg-red-500 w-[215px] h-auto py-3 rounded-[30px] border-[#f9f9f9] bg-transparent text-white hover:bg-white/10 [font-family:'Questrial',Helvetica] font-normal text-base">
                    Login
                  </button>
                </Link>

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-[20px] border-[#f9f9f9] bg-transparent text-white hover:bg-white/10 [font-family:'Questrial',Helvetica] font-normal text-sm">
                    Google
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2 rounded-[20px] border-[#f9f9f9] bg-transparent text-white hover:bg-white/10 [font-family:'Questrial',Helvetica] font-normal text-sm">
                    Facebook
                  </button>
                </div>
              </div>
            </div>

            {/* Right column - Description */}
            <div className="pt-[200px]">
              <p className="[font-family:'Questrial',Helvetica] font-normal text-white text-base leading-[35px] max-w-[444px]">
                Step Up, Take Aim, And Unleash Your Winning Swing. Every Shot Is
                Your Chance To Dominate The Table, Outplay Your Rivals, And
                Claim Victory In Style.
              </p>
            </div>
          </div>
        </main>

        {/* Background decorative elements */}

        {/* Footer */}
      </div>
    </div>
  );
}

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

  window.addEventListener("navigate", ((e: CustomEvent) => {
    router.navigate(e.detail);
  }) as EventListener);

  const initialPath = window.location.pathname || "/";
  router.navigate(initialPath, false);
}

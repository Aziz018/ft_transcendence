import Fuego from "../../index";
import Header from "./components/Main/Header";
import BackToHome from "./components/Main/BackToHome";
import SignUpLink from "./components/Main/SignUpLink";
import LoginForm from "./components/Main/LoginForm";

const Main = () => {
  return (
    <div className="relative z-10 w-full max-w-[500px] mx-auto px-6 ">
      <div className="bg-[#1a1c1e] border border-[#333] rounded-2xl p-8 shadow-2xl">
        <Header />
        <LoginForm />
        <SignUpLink />
      </div>
      <BackToHome />
    </div>
  );
};

export default Main;

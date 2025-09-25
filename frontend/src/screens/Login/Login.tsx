import Main from "../../components/Login/Main";
import BackgroundBlurEffect from "../../components/ui/BackgroundBlurEffect";
import Fuego from "../../index";

const Login = () => {
  return (
    <div className="bg-[#141517] overflow-hidden w-full min-h-screen relative flex items-center justify-center">
      <BackgroundBlurEffect />
      <Main />
    </div>
  );
};

export default Login;

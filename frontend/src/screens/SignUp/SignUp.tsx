import Main from "../../components/SignUp/Main";
import BackgroundBlurEffect from "../../components/ui/BlurEffect/BackgroundBlurEffect";
import Fuego from "../../index";
const SignUp = () => {
  return (
    <div className="bg-[#141517] overflow-hidden w-full min-h-screen relative flex items-center justify-center">
      <BackgroundBlurEffect />
      <Main />
    </div>
  );
};

export default SignUp;

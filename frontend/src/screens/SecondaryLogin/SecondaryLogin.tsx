import Fuego from "../../index";
import Footer from "../../components/SecondaryLogin/Footer";
import Header from "../../components/SecondaryLogin/Header";
import Main from "../../components/SecondaryLogin/Main";
import BackgroundBlurEffect from "../../components/ui/BlurEffect/BackgroundBlurEffect";
import Shape from "../../assets/vec.svg";

const SecondaryLogin = () => {
  return (
    <div className="bg-[#141517] overflow-hidden w-full min-h-screen relative flex items-center justify-center">
      <BackgroundBlurEffect />
      <div className="absolute inset-0 opacity-[0.01] flex items-center justify-center pointer-events-none animate-[spin_30s_linear_infinite]">
        <img
          src={Shape}
          className="w-full h-full object-contain object-center"
          alt="background shape"
        />
      </div>
      <div className="w-full max-w-layout m-auto">
        <Main />
      </div>
    </div>
  );
};

export default SecondaryLogin;

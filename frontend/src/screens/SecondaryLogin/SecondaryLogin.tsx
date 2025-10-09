// import { Button } from "../../components/ui/button";
import Fuego from "../../index";
import Footer from "../../components/SecondaryLogin/Footer";
import Header from "../../components/SecondaryLogin/Header";
import Main from "../../components/SecondaryLogin/Main";
import BackgroundBlurEffect from "../../components/ui/BlurEffect/BackgroundBlurEffect";
import Shape from "../../assets/vec.svg";

const SecondaryLogin = () => {
  return (
    <div className="bg-[#141517] overflow-hidden w-full min-h-screen relative">
      <BackgroundBlurEffect />
      <div className="absolute inset-0 opacity-[0.01] flex items-center justify-center pointer-events-none">
        <img
          src={Shape}
          className="w-full h-full object-contain object-center"
          alt="background shape"
        />
      </div>
      <div className="max-w-layout m-auto flex flex-col min-h-[calc(100vh-80px)] justify-between">
        <Header />
        <Main />
        <Footer />
      </div>
    </div>
  );
};

export default SecondaryLogin;

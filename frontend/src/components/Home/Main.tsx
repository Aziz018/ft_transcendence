import Fuego from "../../index";
import Shape from "../../assets/Shape.svg";
import { Link } from "../../library/Router/Router";
import PrimaryButton from "../ui/PrimaryButton";
import { getToken } from "../../lib/auth";

const Main = () => {
  const token = getToken();
  const destination = token ? "/dashboard" : "/secondary-login";

  return (
    <div className="pt-[11%] pb-[9%] relative">
      <div className="absolute opacity-[0.02] left-[530px] top-[30px] animate-[spin_20s_linear_infinite]">
        <Link to="/">
          <img src={Shape} alt="shape" />
        </Link>
      </div>
      <h5 className="text-light opacity-50 pt- [100px] pb-[20px] text-[18px] animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
        Master the Game with Just One Swing
      </h5>
      <h1 className="text-light text-[45px] leading-[90px] w-[580px] pb-[45px] font-family[Questrial] animate-[fadeInUp_0.8s_ease-out_0.4s_both]">
        One Swing to Rule the Table A Power Move to Conquer Every Rally.
      </h1>
      <div className="animate-[fadeInUp_0.8s_ease-out_0.6s_both]">
        <Link to={destination}>
          <PrimaryButton data="Get Started" />
        </Link>
      </div>
      <div className="flex justify-end animate-[fadeInUp_0.8s_ease-out_0.8s_both]">
        <p className="text-light w-[444px] leading-[35px] text-[16px]">
          Step up, take aim, and unleash your winning swing. Every shot is your
          chance to dominate the table, outplay your rivals, and claim victory
          in style.
        </p>
      </div>
    </div>
  );
};

export default Main;

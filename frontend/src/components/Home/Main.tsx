import Fuego from "../../index";
import Shape from "../../assets/Shape.svg";
import { Link } from "../../library/Router/Router";
import PrimaryButton from "../ui/PrimaryButton";

const Main = () => {
  return (
    <div className="pt-[11%] pb-[9%] relative">
      <div className="absolute opacity-[0.02] left-[530px] top-[30px]">
        <Link to="/">
          <img src={Shape} alt="shape" />
        </Link>
      </div>
      <h5 className="text-light opacity-50 pt- [100px] pb-[20px] text-[18px]">
        Master the Game with Just One Swing
      </h5>
      <h1 className="text-light text-[45px] leading-[90px] w-[580px] pb-[45px] font-family[Questrial]">
        One Swing to Rule the Table  A Power Move to Conquer Every Rally.
      </h1>
      <Link to="/secondary-login">
        <PrimaryButton data="Get Started" />
      </Link>
      <div className="flex justify-end">
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

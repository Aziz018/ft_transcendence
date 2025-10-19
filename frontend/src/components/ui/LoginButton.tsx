import Fuego from "../../index";
import { redirect } from "../../library/Router/Router";

const LoginButton = () => {
  return (
    <button
      type="submit"
      className="w-full h-12 bg-[#dda15e] hover:bg-[#cc9455] text-[#141517] rounded-lg [font-family:'Questrial',Helvetica] font-normal text-base transition-colors">
      Sign In
    </button>
  );
};

export default LoginButton;

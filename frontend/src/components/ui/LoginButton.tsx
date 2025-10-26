import Fuego from "../../index";
import { redirect } from "../../library/Router/Router";

interface LoginButtonProps {
  disabled?: boolean;
  text?: string;
}

const LoginButton = (props: LoginButtonProps) => {
  const { disabled = false, text = "Sign In" } = props;

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`w-full h-12 bg-[#dda15e] hover:bg-[#cc9455] text-[#141517] rounded-lg [font-family:'Questrial',Helvetica] font-normal text-base transition-colors ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}>
      {text}
    </button>
  );
};

export default LoginButton;

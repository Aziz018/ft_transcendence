import Main from "../../components/SignUp/Main";
import BackgroundBlurEffect from "../../components/ui/BlurEffect/BackgroundBlurEffect";
import Fuego from "../../index";
import { getToken } from "../../lib/auth";
import { redirect } from "../../library/Router/Router";
import { useEffect } from "../../library/hooks/useEffect";

const SignUp = () => {
  useEffect(() => {
    const token = getToken();
    if (token) {
      redirect("/dashboard");
    }
  }, []);

  return (
    <div className="bg-theme-bg-primary overflow-hidden w-full min-h-screen relative flex items-center justify-center">
      <BackgroundBlurEffect />
      <Main />
    </div>
  );
};

export default SignUp;

import React, { useEffect } from "react";
import Main from "../../components/Login/Main";
import BackgroundBlurEffect from "../../components/ui/BlurEffect/BackgroundBlurEffect";
import { getToken } from "../../lib/auth";
import { redirect } from "../../router";

const Login = () => {
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

export default Login;

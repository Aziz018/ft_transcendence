import Fuego from "../../index";
import { Link } from "../../library/Router/Router";
import BackToHome from "./components/Main/BackToHome";
import SignUpLink from "./components/Main/SignUpLink";

const Main = () => {
  return (
    <div className="relative z-10 w-full max-w-[500px] mx-auto px-6 ">
      <div className="bg-[#1a1c1e] border border-[#333] rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="[font-family:'Questrial',Helvetica] font-normal text-white text-3xl mb-2">
            Welcome Back
          </h1>
          <p className="[font-family:'Questrial',Helvetica] font-normal text-[#ffffff80] text-sm">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login form */}
        <form className="space-y-6">
          {/* Email field */}
          <div className="space-y-2">
            <label className="[font-family:'Questrial',Helvetica] font-normal text-white text-sm block">
              Email
            </label>
            <input
              type="email"
              className="w-full h-12 px-4 bg-[#2a2c2e] border border-[#444] rounded-lg text-white placeholder-[#ffffff60] focus:outline-none focus:border-[#dda15e] transition-colors [font-family:'Questrial',Helvetica]"
              placeholder="Enter your email"
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label className="[font-family:'Questrial',Helvetica] font-normal text-white text-sm block">
              Password
            </label>
            <input
              type="password"
              className="w-full h-12 px-4 bg-[#2a2c2e] border border-[#444] rounded-lg text-white placeholder-[#ffffff60] focus:outline-none focus:border-[#dda15e] transition-colors [font-family:'Questrial',Helvetica]"
              placeholder="Enter your password"
            />
          </div>

          {/* Remember me and forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[#444] bg-[#2a2c2e] text-[#dda15e] focus:ring-[#dda15e] focus:ring-2"
              />
              <span className="[font-family:'Questrial',Helvetica] font-normal text-[#ffffff80] text-sm">
                Remember me
              </span>
            </label>
            <a
              href="#"
              className="[font-family:'Questrial',Helvetica] font-normal text-[#dda15e] text-sm hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="w-full h-12 bg-[#dda15e] hover:bg-[#cc9455] text-[#141517] rounded-lg [font-family:'Questrial',Helvetica] font-normal text-base transition-colors">
            Sign In
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#444]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1a1c1e] text-[#ffffff60] [font-family:'Questrial',Helvetica]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-light rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
              Google
            </button>
            <button
              type="button"
              class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
              Intra
            </button>
          </div>
        </form>
        <SignUpLink />
      </div>
      <BackToHome />
    </div>
  );
};

export default Main;

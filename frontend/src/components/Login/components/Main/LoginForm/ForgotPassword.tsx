
import React from "react";
const ForgotPassword = () => {
  return (
    <>
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
        {/*<a
          href="#"
          className="[font-family:'Questrial',Helvetica] font-normal text-[#dda15e] text-sm hover:underline">
          Forgot password?
        </a>*/}
      </div>
    </>
  );
};

export default ForgotPassword;

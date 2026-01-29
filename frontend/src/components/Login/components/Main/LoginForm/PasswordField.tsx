
import React from "react";
const PasswordField = () => {
  return (
    <>
      {/* Password field */}
      <div className="space-y-2">
        <label className="[font-family:'Questrial',Helvetica] font-normal text-light text-sm block">
          Password
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full h-12 px-4 bg-[#2a2c2e] border border-[#444] rounded-lg text-light placeholder-[#ffffff60] focus:outline-none focus:border-[#dda15e] transition-colors [font-family:'Questrial',Helvetica]"
          placeholder="Enter your password"
        />
      </div>
    </>
  );
};

export default PasswordField;

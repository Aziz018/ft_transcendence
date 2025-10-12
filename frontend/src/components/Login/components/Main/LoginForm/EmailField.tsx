import Fuego from "../../../../../index";

const EmailField = () => {
  return (
    <>
      <div className="space-y-2">
        <label className="[font-family:'Questrial',Helvetica] font-normal text-light text-sm block">
          Email
        </label>
        <input
          name="email"
          type="email"
          className="w-full h-12 px-4 bg-[#2a2c2e] border border-[#444] rounded-lg text-light placeholder-[#ffffff60] focus:outline-none focus:border-[#dda15e] transition-colors [font-family:'Questrial',Helvetica]"
          placeholder="Enter your email"
        />
      </div>
    </>
  );
};

export default EmailField;

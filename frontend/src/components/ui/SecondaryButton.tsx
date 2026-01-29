
import React from "react";
const SecondaryButton = ({data}) => {
  return (
    <button
      type="button"
      className="text-sm sm:text-[14px] min-h-[44px] hover:opacity-90 active:opacity-80 bg-accent-orange text-light border-solid border-accent-orange border-[1px] rounded-[30px] px-8 sm:px-12 md:px-16 cursor-pointer py-2 sm:py-2.5 transition-opacity touch-manipulation">
      {data}
    </button>
  );
};

export default SecondaryButton;

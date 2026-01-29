
import React from "react";
const PrimaryButton = ({data}) => {
  return (
    <button
      type="button"
      className="text-[14px] hover:opacity-90 text-light border-solid border-light border-[1px] rounded-[30px] px-16 cursor-pointer py-2">
      {data}
    </button>
  );
};

export default PrimaryButton;

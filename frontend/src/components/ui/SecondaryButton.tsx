import Fuego from "../../index";

const SecondaryButton = ({data}) => {
  return (
    <button
      type="button"
      class="text-[14px] hover:opacity-90 bg-accent-orange text-light border-solid border-accent-orange border-[1px] rounded-[30px] px-16 cursor-pointer py-2">
      {data}
    </button>
  );
};

export default SecondaryButton;

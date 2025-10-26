import Fuego from "../../../index";
import ChatIcon from "../../../assets/chat-icon.svg";

const ChatShowcaseSection = () => {
  return (
    <div className="pt-[50px]">
      <div className="flex gap-3 items-center">
        <div>
          <img src={ChatIcon} alt="Chat icon" className="w-[30px] h-[30px]" />
        </div>
        <div>
          <h2 className="text-light text-[32px]">Chat</h2>
        </div>
      </div>
      <p className="text-[#f9f9f980] text-[16px] w-[573px] mt-4 leading-[30px] ">
        Stay connected with friends while you play! Our in-game chat feature
        lets you easily communicate with your friends during your ping pong
        matches.
      </p>
    </div>
  );
};

export default ChatShowcaseSection;

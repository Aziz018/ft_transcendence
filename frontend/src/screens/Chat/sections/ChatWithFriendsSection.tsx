import Fuego from "../../../index";
import Mason from "../../../assets/1.svg";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import PlayIcon from "../../../assets/Play.svg";
import SendMessageIcon from "../../../assets/send-icon.svg";
import MenuIcon from "../../../assets/Group 230.svg";
import ViewProfileIcon from "../../../assets/view-profile.svg";
import InviteIcon from "../../../assets/invite-icon.svg";
import UnfriendIcon from "../../../assets/unfriend-icon.svg";
import BlockUserIcon from "../../../assets/block-icon.svg";

const chatUsers = [
  {
    id: 1,
    name: "Mason",
    avatar: Mason,
    message: "Rally your way to victory!",
    time: "5m",
    online: false,
    notifications: 0,
  },
  {
    id: 2,
    name: "Ava",
    avatar: Mason,
    message: "Keep it simple, keep it real...",
    time: "5m",
    online: true,
    notifications: 3,
  },
];

const chatMessages = [
  {
    id: 1,
    sender: "Mason",
    avatar: Mason,
    text: "Ready, set, serve! Let the ping pong game begin now, and Play hard, aim high, and never stop chasing the win!",
    time: "18:33",
    isOwn: false,
  },
  {
    id: 2,
    sender: "Mason",
    avatar: Mason,
    text: "Rally your way to victory!",
    time: "18:45",
    isOwn: false,
  },
  {
    id: 3,
    sender: "You",
    text: "Okay Let's begin!",
    time: "21:18",
    isOwn: true,
  },
  {
    id: 4,
    sender: "You",
    avatar: Mason,
    text: "Rally your way to victory!",
    time: "21:17",
    isOwn: true,
  },
];

const menuOptions = [
  { label: "View Profile", icon: ViewProfileIcon, color: "#ddf247" },
  { label: "Invite", icon: InviteIcon, color: "#ffffff" },
  { label: "Unfriend", icon: UnfriendIcon, color: "#ffffff" },
  { label: "Block User", icon: BlockUserIcon, color: "#ff4141" },
];

const ChatWithFriendsSection = () => {
  const [isMenuOpen, setIsMenuOpen] = Fuego.useState(false);

  return (
    <div className="mt-[20px] w-full h-[650px] rounded-[30px] border border-[#f9f9f9] border-opacity-[0.1] relative bg -[#0a0a0a]">
      {/* Left Sidebar - User List */}
      <div className="absolute top-0 left-0 w-[326px] h-full border-r border-[#f9f9f9] border-opacity-[0.1] p-[25px]">
        {/* Search Input */}
        <div className="relative w-full h-[59px] rounded-[14px] border border-[#f9f9f9] border-opacity-[0.1] shadow-[0px_4px_4px_#00000040] mb-[26px]">
          <input
            placeholder="Search, users..."
            className="w-full h-full rounded-[14px] border-0 bg-transparent pl-4 pr-12 [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-sm placeholder:text-[#878787] focus:outline-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#878787" strokeWidth="2" />
              <path
                d="M11 11L15 15"
                stroke="#878787"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* User List */}
        <div className="flex flex-col gap-2.5 overflow-y-auto h-[calc(100%-85px)]">
          {chatUsers.map((user, index) => (
            <button
              key={user.id}
              className={`w-full h-[65px] rounded-[14px] flex items-center px-[19px] gap-[8px] hover:bg-[#87878733] transition-colors ${
                index === 0 ? "bg-[#8787871a]" : "bg-transparent"
              }`}>
              <div className="relative w-[35px] h-[35px]">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col gap-0.5 items-start">
                <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-sm tracking-[0] leading-[15px]">
                  {user.name}
                </span>
                <span className="[font-family:'Poppins',Helvetica] font-medium text-[#878787] text-[10px] leading-[15px] tracking-[0] truncate max-w-[126px]">
                  {user.message}
                </span>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="[font-family:'Poppins',Helvetica] font-medium text-[#878787] text-[10px] tracking-[0] leading-[15px]">
                  {user.time}
                </span>
                {user.notifications > 0 && (
                  <div className="min-w-[18px] h-[18px] bg-[#ddf247] rounded-full flex items-center justify-center px-1">
                    <span className="[font-family:'Poppins',Helvetica] font-semibold text-[#0a0a0a] text-[10px] leading-none">
                      {user.notifications}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="absolute top-0 left-[326px] w-[calc(100%-326px)] h-full flex flex-col p-[23px]">
        {/* Chat Header */}
        <div className="flex items-center justify-between mb-[20px] pb-[20px] border-b border-[#f9f9f9] border-opacity-[0.1]">
          <div className="flex flex-col gap-1">
            <h3 className="[font-family:'Poppins',Helvetica] font-medium text-white text-2xl tracking-[0] leading-[15px]">
              Mason
            </h3>
            <span className="[font-family:'Questrial',Helvetica] font-normal text-[#878787] text-sm tracking-[0] leading-[15px] pt-2">
              online
            </span>
          </div>

          <div className="flex items-center gap- 2">
            {/* Let's Play Button */}
            <button className=" flex items-center justify-center gap-[5px] border-solid px-8 py-2 rounded-[14px] border border-white hover:opacity-80 transition-colors">
              <img src={PlayIcon} alt="Mason" className="w-4 h-4" />
              <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-xs tracking-[0] leading-[15px]">
                Let's play
              </span>
            </button>
            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 flex items-center justify-center hover:opacity-80 rounded-full transition-colors">
                <img src={MenuIcon} alt="Menu" className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-12 w-[124px] bg-[#232323] border-0 rounded-[14px] p-[13px] z-10 shadow-lg">
                  {menuOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        console.log(`Clicked: ${option.label}`);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-[7px] p-0 mb-[9px] last:mb-0 cursor-pointer hover:opacity-80 transition-opacity w-full">
                      <img
                        src={option.icon}
                        alt={option.label}
                        className="w-[14px] h-[14px]"
                      />
                      <span
                        style={{ color: option.color }}
                        className="[font-family:'Questrial',Helvetica] font-normal text-[11px] text-center tracking-[0] leading-[17px]">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-[20px] flex flex-col gap-[29px]">
          {/* Incoming Messages */}
          <div className="flex items-end gap-[7px]">
            <img
              src={Mason}
              alt="Mason"
              className="w-10 h-10 rounded-full object-cover"
            />

            <div className="flex flex-col gap-[18px]">
              {/* First Message */}
              <div className="bg-[#141517] rounded-[14px_14px_14px_0px] p-[17px_10px] max-w-[385px]">
                <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-base tracking-[0] leading-[15px] block mb-[9px]">
                  Mason
                </span>
                <p className="[font-family:'Questrial',Helvetica] font-normal text-white text-[11px] tracking-[0] leading-5 mb-2">
                  Ready, set, serve! Let the ping pong game begin now, and Play
                  hard, aim high, and never stop chasing the win!
                </p>
                <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-[11px] tracking-[0] leading-[15px] float-right">
                  18:33
                </span>
              </div>

              {/* Second Message */}
              <div className="bg-[#141517] rounded-[14px_14px_14px_0px] p-[12px_13px] max-w-[225px]">
                <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-base tracking-[0] leading-[15px] block mb-1.5">
                  Mason
                </span>
                <p className="[font-family:'Questrial',Helvetica] font-normal text-white text-[11px] tracking-[0] leading-5 mb-2">
                  Rally your way to victory!
                </p>
                <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-[11px] tracking-[0] leading-[15px] float-right">
                  18:45
                </span>
              </div>
            </div>
          </div>

          {/* Outgoing Messages */}
          <div className="flex flex-col items-end gap-[17px]">
            {/* First Outgoing Message */}
            <div className="bg-[#f9f9f9] rounded-[14px_14px_0px_14px] p-[12px_13px] mr-[53px] max-w-[225px]">
              <span className="[font-family:'Questrial',Helvetica] font-normal text-[#0a0a0a] text-base tracking-[0] leading-[15px] block mb-[9px]">
                Mason
              </span>
              <p className="[font-family:'Questrial',Helvetica] font-normal text-[#0a0a0a] text-[11px] tracking-[0] leading-[15px] mb-2">
                Okay Let's begin!
              </p>
              <span className="[font-family:'Questrial',Helvetica] font-normal text-[#0a0a0a] text-[11px] tracking-[0] leading-[15px] float-right">
                21:18
              </span>
            </div>

            {/* Second Outgoing Message with Avatar */}
            <div className="flex items-end gap-[10px]">
              <div className="bg-[#f9f9f9] rounded-[14px_14px_0px_14px] p-[12px_13px] max-w-[225px]">
                <span className="[font-family:'Questrial',Helvetica] font-normal text-[#0a0a0a] text-base tracking-[0] leading-[15px] block mb-1.5">
                  Mason
                </span>
                <p className="[font-family:'Questrial',Helvetica] font-normal text-[#0a0a0a] text-[11px] leading-5 tracking-[0] mb-2">
                  Rally your way to victory!
                </p>
                <span className="[font-family:'Questrial',Helvetica] font-normal text-[#0a0a0a] text-[11px] tracking-[0] leading-[15px] float-right">
                  21:17
                </span>
              </div>

              <img
                src={Mason}
                alt="You"
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="relative w-full h-[50px]">
          <input
            placeholder="Your message"
            className="w-full h-full bg-[#8787871a] rounded-[14px] border-0 pl-4 pr-14 [font-family:'Poppins',Helvetica] font-medium text-white text-[11px] placeholder:text-[#878787] focus:outline-none"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-[34px] h-[34px] flex items-center justify-center hover:opacity-80 transition-opacity">
            <img src={SendMessageIcon} alt="Send" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWithFriendsSection;

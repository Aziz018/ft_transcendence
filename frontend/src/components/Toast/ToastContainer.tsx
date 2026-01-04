import Fuego from "../../index";
import Toast from "./Toast";
import { useNotifications } from "../../lib/useNotifications";

const ToastContainer = () => {
  const { notifications, remove } = useNotifications();

  const notificationList = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 pointer-events-none z-[9999]">
      {notificationList.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast notification={notification} onRemove={remove} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

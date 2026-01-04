import Fuego from "../index";
import { wsService } from "../services/wsService";

export function useWebSocket() {
  const [isConnected, setIsConnected] = Fuego.useState(false);

  Fuego.useEffect(() => {

    wsService
      .connect()
      .then(() => {
        setIsConnected(true);
        console.log("[useWebSocket] Connected");
      })
      .catch((error) => {
        console.error("[useWebSocket] Connection failed:", error);
        setIsConnected(false);
      });

    return () => {

    };
  }, []);

  return {
    isConnected,
    send: wsService.send.bind(wsService),
    on: wsService.on.bind(wsService),
    disconnect: wsService.disconnect.bind(wsService),
  };
}

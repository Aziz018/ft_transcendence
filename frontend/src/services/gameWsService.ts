
import { getToken } from "../lib/auth";
import API_CONFIG from "../config/api";

interface WebSocketMessage {
    type: string;
    payload?: any;
}

class GameWebSocketService {
    private ws: WebSocket | null = null;
    private url: string;
    private messageListeners: Map<string, (payload: any) => void> = new Map();

    constructor() {
        this.url = API_CONFIG.GAME_WS_URL;
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const token = getToken();
                if (!token) {
                    reject(new Error("No auth token available"));
                    return;
                }

                const wsUrl = `${this.url}?token=${encodeURIComponent(token)}`;
                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = () => {
                    console.log("[GameWS] Connected");
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(JSON.parse(event.data));
                };

                this.ws.onerror = (error) => {
                    console.error("[GameWS] Error:", error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log("[GameWS] Disconnected");
                    this.ws = null;
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    private handleMessage(message: WebSocketMessage) {
        // console.log("[GameWS] Received:", message.type); 
        // Commented out to avoid spamming console with game_state (60fps)

        if (message.type === "error") {
            console.error("[GameWS] Server Error:", message.payload || (message as any).message);
            return;
        }

        const listener = this.messageListeners.get(message.type);
        if (listener) {
            listener(message.payload);
        }
    }

    send(message: WebSocketMessage) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    on(messageType: string, listener: (payload: any) => void) {
        this.messageListeners.set(messageType, listener);
        return () => {
            this.messageListeners.delete(messageType);
        };
    }

    off(messageType: string) {
        this.messageListeners.delete(messageType);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.messageListeners.clear();
    }

    // Game Specific Methods
    joinGame(payload: { mode: string; tournamentId?: string }) {
        // Backend expects: { action: 'join', gameType: 'classic' }
        // Frontend sends: { mode: 'standard' } -> map to backend format

        // NOTE: The previous chat.ts implementation mapped 'join_queue' -> 'matchmaking'
        // But verify_game.ts used 'matchmaking' directly.
        // Let's check what 'controllers/game.ts' expects.
        // It expects 'matchmaking' message with { action: 'join', gameType: 'classic' }

        // However, Game.tsx might be calling joinGame with specific payload.
        // Let's adapt to what the backend expects.

        this.send({
            type: "matchmaking",
            payload: {
                action: 'join',
                gameType: payload.mode === 'standard' ? 'classic' : 'tournament' // simple mapping
            }
        });
    }

    leaveGame() {
        this.send({
            type: "matchmaking",
            payload: { action: 'leave', gameType: 'classic' }
        });
    }

    movePaddle(position: number) {
        // Backend expects 'player_move' with { gameId, direction... } 
        // OR maybe it supports position?
        // I added 'position' to PlayerMoveInput in Step 477.
        // So 'player_move' with { gameId, position, timestamp } is valid.

        // ISSUE: We need gameId.
        // Store gameId in the service when game starts?
        // Or just let the backend resolve it via `getGameIdByPlayerId`?
        // In chat.ts, I implemented look up.
        // But in game.ts (GameController), `handlePlayerMove` expects `payload.gameId`.

        // IMPORTANT: GameController does NOT do the lookup that ChatController did.
        // So we MUST send gameId.

        if (this.currentGameId) {
            // Map relative inputs (-1, 0, 1) to direction
            // If position is large (> 1), treat as absolute position (mouse)
            // If position is -1, 0, 1, treat as direction

            const isDirection = Math.abs(position) <= 1;

            const payload: any = {
                gameId: this.currentGameId,
                timestamp: Date.now()
            };

            if (isDirection) {
                if (position === -1) payload.direction = 'up';
                else if (position === 1) payload.direction = 'down';
                // 0 means stop, but backend doesn't have 'stop', it just doesn't move if no event.
                // However, we might need to send something? 
                // Actually, backend state only updates when event received.
                // So if we send nothing, it stops? 
                // No, backend implementation of handlePlayerMove adds to position ONCE per event.
                // It does NOT have velocity.
                // So holding key -> continuous events?
                // Game.tsx has setInterval 60fps sending events.
                // So if we send 0, we shouldn't send anything?
                else return; // Don't send if 0 (stop)
            } else {
                payload.position = position;
            }

            this.send({
                type: "player_move",
                payload: payload
            });
        }
    }

    sendGameAction(action: string, payload?: any) {
        // 'pause_game' is not directly supported by current GameService spec 
        // but 'tournament' actions use this structure.
        // If pause is needed, we should check implementation.
        // For now, allow sending arbitrary messages like the Chat socket did.

        this.send({ type: action, payload });
    }

    private currentGameId: string | null = null;

    setGameId(id: string) {
        this.currentGameId = id;
    }
}

export const gameWsService = new GameWebSocketService();

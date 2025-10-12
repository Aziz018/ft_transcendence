import type UserService from "../services/user.ts";
import type FriendService from "../services/friend.ts";
import type AuthService from "../services/auth.ts";
import type TOTPService from "../services/totp.ts";



export interface ServiceManager {
    user: UserService;
    friend: FriendService;
    auth: AuthService;
    totp: TOTPService;
}

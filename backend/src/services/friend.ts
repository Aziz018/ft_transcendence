import type { FastifyInstance } from "fastify";

import DataBaseWrapper from "../utils/prisma.js";
import ServiceError, { type ServiceError_t } from "../utils/service-error.js";
import type { FriendServiceError_t } from "./user.js";
import type FriendRequest from "../models/friend.js";

/**
 * Error handler for FriendService, extends ServiceError for friend-specific codes.
 */
class FriendServiceError extends ServiceError {
  constructor() {
    super();
    this.setupCodes();
  }

  setupCodes(): void {
    /// ... add codes later
  }
}

/**
 * FriendService handles operations related to friend requests between users.
 * Extends the DataBaseWrapper for Prisma database interactions.
 *
 * Responsibilities include sending, accepting, declining friend requests,
 * and fetching friends or pending requests.
 */
export default class FriendService extends DataBaseWrapper {
  errorHandler: FriendServiceError;

  constructor(fastify: FastifyInstance) {
    super("friend.service", fastify);
    this.errorHandler = new FriendServiceError();
  }

  throwErr(err: ServiceError_t | undefined) {
    if (err !== undefined) {
      const e: FriendServiceError_t = Object.assign(new Error(err.message), {
        code: err.code,
        message: err.message,
      });
      throw e;
    } else {
      throw Error("Unknown Error Occured!");
    }
  }

  /**
   * Creates a friend request in the database between two users.
   * @param sender_id - ID of the user sending the request
   * @param receiver_id - ID of the user receiving the request
   * @returns The created FriendRequest object
   * @private
   */
  private async craftRequest(
    sender_id: string,
    receiver_id: string
  ): Promise<FriendRequest> {
    let request = await this.prisma.friendRequest.create({
      data: {
        requested: { connect: { id: receiver_id } },
        requester: { connect: { id: sender_id } },
      },
      include: {
        requested: true,
        requester: true,
      },
    });

    return {
      id: request.id,
      requester: request.requester,
      requested: request.requested,
      status: request.status,
      timestamp: request.timestamp,
      requesterId: request.requesterId,
      requestedId: request.requestedId,
    };
  }

  /**
   * Sends a friend request from one user to another.
   * @param sender_uid - ID of the user sending the request
   * @param receiver_uid - ID of the user receiving the request
   * @returns The created FriendRequest object
   * @throws Error if either user ID is invalid
   */
  public async sendRequest(
    sender_uid: string,
    receiver_uid: string
  ): Promise<FriendRequest | undefined> {
    if (
      (await this.fastify.service.user.fetchBy({ id: sender_uid })) === null ||
      (await this.fastify.service.user.fetchBy({ id: receiver_uid })) === null
    ) {
      this.throwErr({
        code: 400,
        message: "valid user id's are required!",
      });
    } else if (sender_uid === receiver_uid) {
      this.throwErr({
        code: 409,
        message: "hold on, y'all are the same person!",
      });
    } else if ((await this.getFriends(sender_uid)).includes(receiver_uid)) {
      this.throwErr({
        code: 409,
        message: "you guy's are already friends!",
      });
    } else {
      // Check if there's already a pending request between these two users
      const existingRequest = await this.prisma.friendRequest.findFirst({
        where: {
          OR: [
            {
              requesterId: sender_uid,
              requestedId: receiver_uid,
              status: "PENDING",
            },
            {
              requesterId: receiver_uid,
              requestedId: sender_uid,
              status: "PENDING",
            },
          ],
        },
      });

      if (existingRequest) {
        if (existingRequest.requesterId === sender_uid) {
          this.throwErr({
            code: 409,
            message: "you already sent a friend request to this user!",
          });
        } else {
          this.throwErr({
            code: 409,
            message:
              "this user already sent you a friend request! check your notifications",
          });
        }
      } else {
        const blocks = await this.prisma.blockedUser.findFirst({
          where: {
            OR: [
              { blockerId: sender_uid, blockedId: receiver_uid },
              { blockerId: receiver_uid, blockedId: sender_uid },
            ],
          },
        });

        if (blocks) {
          this.throwErr({
            code: 403,
            message: "cannot send friend request; user is blocked!",
          });
        }

        return await this.craftRequest(sender_uid, receiver_uid);
      }
    }
  }

  /**
   * Accepts a friend request by updating its status to "ACCEPTED" and creating a Friendship record.
   * @param request_id - ID of the friend request to accept
   * @throws Error if the update fails or an unknown error occurs
   */
  public async acceptRequest(request_id: string): Promise<void> {
    try {
      const friendRequest = await this.prisma.friendRequest.findUnique({
        where: { id: request_id },
      });

      if (!friendRequest) {
        this.throwErr({
          code: 404,
          message: "Friend request not found",
        });
      }

      // Update the friend request status to ACCEPTED
      await this.prisma.friendRequest.update({
        where: { id: request_id },
        data: { status: "ACCEPTED" },
      });

      // Create a Friendship record (ensure lower ID comes first for consistency)
      const user1Id = 
        friendRequest!.requesterId < friendRequest!.requestedId 
          ? friendRequest!.requesterId 
          : friendRequest!.requestedId;
      const user2Id = 
        friendRequest!.requesterId < friendRequest!.requestedId 
          ? friendRequest!.requestedId 
          : friendRequest!.requesterId;

      await this.prisma.friendship.create({
        data: {
          user1Id,
          user2Id,
        },
      });
    } catch (error: any) {
      // Skip duplicate friendship errors
      if (error.code === "P2002") {
        return;
      }
      let err = this.errorHandler.handleError(
        this.fastify,
        this.service,
        error
      );
      if (err === undefined) {
        throw Error("unknown error!");
      } else {
        throw this.throwErr(err);
      }
    }
  }

  /**
   * Declines a friend request by updating its status to "REJECTED".
   * @param request_id - ID of the friend request to decline
   * @throws Error if the update fails or an unknown error occurs
   */
  public async declineRequest(request_id: string): Promise<void> {
    try {
      await this.prisma.friendRequest.update({
        where: { id: request_id },
        data: { status: "REJECTED" },
      });
    } catch (error: any) {
      let err = this.errorHandler.handleError(
        this.fastify,
        this.service,
        error
      );
      if (err === undefined) {
        throw Error("unknown error!");
      } else {
        throw this.throwErr(err);
      }
    }
  }

  /**
   * Fetches a list of accepted friends for a given user using the Friendship model.
   * @param uid - User ID for whom to fetch friends
   * @returns Array of user IDs that are accepted friends
   * @throws Error if the query fails or an unknown error occurs
   */
  public async getFriends(uid: string): Promise<string[]> {
    try {
      // Get friendships where the user is either user1 or user2
      const friendships = await this.prisma.friendship.findMany({
        where: {
          OR: [
            { user1Id: uid },
            { user2Id: uid },
          ],
        },
        select: {
          user1Id: true,
          user2Id: true,
        },
      });

      // Extract the friend IDs (the other user in each friendship)
      const friends = friendships.map((f) =>
        f.user1Id === uid ? f.user2Id : f.user1Id
      );

      return friends;
    } catch (error: any) {
      let err = this.errorHandler.handleError(
        this.fastify,
        this.service,
        error
      );
      if (err === undefined) {
        throw Error("unknown error!");
      } else {
        throw this.throwErr(err);
      }
    }
  }

  /**
   * Fetches a list of pending friend requests for a given user.
   * @param uid - User ID for whom to fetch pending requests
   * @returns Array of FriendRequest objects with status "PENDING"
   * @throws Error if the query fails or an unknown error occurs
   */
  public async getPendingRequests(uid: string): Promise<FriendRequest[]> {
    try {
      return this.prisma.friendRequest.findMany({
        where: {
          status: "PENDING",
          requesterId: uid,
        },
        include: {
          requested: true,
          requester: true,
        },
      });
    } catch (error: any) {
      let err = this.errorHandler.handleError(
        this.fastify,
        this.service,
        error
      );
      if (err === undefined) {
        throw Error("unknown error!");
      } else {
        throw this.throwErr(err);
      }
    }
  }

  public async getIncomingRequests(uid: string): Promise<FriendRequest[]> {
    try {
      return this.prisma.friendRequest.findMany({
        where: {
          status: "PENDING",
          requestedId: uid,
        },
        include: {
          requested: true,
          requester: true,
        },
      });
    } catch (error: any) {
      let err = this.errorHandler.handleError(
        this.fastify,
        this.service,
        error
      );
      if (err === undefined) {
        throw Error("unknown error!");
      } else {
        throw this.throwErr(err);
      }
    }
  }

  /**
   * Blocks a user, preventing them from sending friend requests
   * and removing existing friendship if present.
   *
   * @param blockerId - ID of the user doing the blocking
   * @param blockedId - ID of the user being blocked
   * @throws Error if users don't exist or already blocked
   */
  public async blockUser(blockerId: string, blockedId: string): Promise<void> {
    try {
      const [blocker, blocked] = await Promise.all([
        this.fastify.service.user.fetchBy({ id: blockerId }),
        this.fastify.service.user.fetchBy({ id: blockedId }),
      ]);

      if (!blocker || !blocked) {
        this.throwErr({
          code: 404,
          message: "user not found!",
        });
      }

      const existingBlock = await this.prisma.blockedUser.findFirst({
        where: {
          blockerId,
          blockedId,
        },
      });

      if (existingBlock) {
        this.throwErr({
          code: 409,
          message: "user is already blocked",
        });
      }

      // Remove all friend requests between these users
      await this.prisma.friendRequest.deleteMany({
        where: {
          OR: [
            { requesterId: blockerId, requestedId: blockedId },
            { requesterId: blockedId, requestedId: blockerId },
          ],
        },
      });

      // Remove friendship if it exists
      const user1Id = blockerId < blockedId ? blockerId : blockedId;
      const user2Id = blockerId < blockedId ? blockedId : blockerId;
      
      await this.prisma.friendship.deleteMany({
        where: {
          AND: [
            {
              OR: [
                { user1Id, user2Id },
                { user1Id: user2Id, user2Id: user1Id },
              ],
            },
          ],
        },
      });

      // Create the block record
      await this.prisma.blockedUser.create({
        data: {
          blockerId,
          blockedId,
        },
      });
    } catch (error: any) {
      let err = this.errorHandler.handleError(
        this.fastify,
        this.service,
        error
      );
      if (err === undefined) {
        throw Error("Unknown error!");
      } else {
        throw this.throwErr(err);
      }
    }
  }

  /**
   * Unblocks a previously blocked user.
   *
   * @param blockerId - ID of the user who blocked
   * @param blockedId - ID of the blocked user
   * @throws Error if block record doesn't exist
   */
  public async unblockUser(
    blockerId: string,
    blockedId: string
  ): Promise<void> {
    try {
      const block = await this.prisma.blockedUser.findFirst({
        where: {
          blockerId,
          blockedId,
        },
      });

      if (!block) {
        this.throwErr({
          code: 404,
          message: "user is not blocked!",
        });
      }

      await this.prisma.blockedUser.delete({
        where: {
          id: block!.id,
        },
      });
    } catch (error: any) {
      let err = this.errorHandler.handleError(
        this.fastify,
        this.service,
        error
      );
      if (err === undefined) {
        throw Error("Unknown error!");
      } else {
        throw this.throwErr(err);
      }
    }
  }

  public async getBlockedUsers(userId: string): Promise<any[]> {
    try {
      const blocks = await this.prisma.blockedUser.findMany({
        where: {
          blockerId: userId,
        },
        include: {
          blocked: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });
      return blocks.map((block) => ({
        id: block.blocked.id,
        username: block.blocked.name,
        email: block.blocked.email,
        avatar: block.blocked.avatar,
      }));
    } catch (error: any) {
      let err = this.errorHandler.handleError(
        this.fastify,
        this.service,
        error
      );
      if (err === undefined) {
        throw Error("Unknown error!");
      } else {
        throw this.throwErr(err);
      }
    }
  }

  /**
   * Remove a friend by deleting the accepted friend request and friendship record between two users.
   * Works bidirectionally - either user can unfriend the other.
   * @param userId - The user initiating the unfriend action
   * @param friendId - The friend to be removed
   */
  public async unfriend(userId: string, friendId: string): Promise<void> {
    try {
      // Delete the friend request where both users are involved and status is ACCEPTED
      await this.prisma.friendRequest.deleteMany({
        where: {
          OR: [
            {
              requesterId: userId,
              requestedId: friendId,
              status: "ACCEPTED",
            },
            {
              requesterId: friendId,
              requestedId: userId,
              status: "ACCEPTED",
            },
          ],
        },
      });

      // Also delete the Friendship record
      const user1Id = userId < friendId ? userId : friendId;
      const user2Id = userId < friendId ? friendId : userId;

      await this.prisma.friendship.deleteMany({
        where: {
          AND: [
            { user1Id, user2Id },
          ],
        },
      });
    } catch (error: any) {
      let err = this.errorHandler.handleError(
        this.fastify,
        this.service,
        error
      );
      if (err === undefined) {
        throw Error("Unknown error!");
      } else {
        throw this.throwErr(err);
      }
    }
  }
}

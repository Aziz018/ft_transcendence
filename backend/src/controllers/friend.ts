import type FriendRequest from "../models/friend.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  BlockUserInput,
  SendFriendRequestInput,
} from "../models/friend.js";
import type { ResolveFriendRequestInput } from "../models/friend.js";
import type FriendService from "../services/friend.js";
import { isServiceError } from "../utils/service-error.js";
import {
  notifyFriendRequest,
  notifyFriendRequestAccepted,
  notifyFriendRequestDeclined,
} from "./chat.js";

export const sendFriendRequestController = async (
  req: FastifyRequest<{ Body: SendFriendRequestInput }>,
  res: FastifyReply
): Promise<void> => {
  try {
    const friendReq: FriendRequest | undefined =
      await req.server.service.friend.sendRequest(
        req.user.uid,
        req.body.requested_uid
      );

    // Send real-time notification to the receiver (non-blocking)
    // If notification fails, we still return 201 success because the request was created
    if (friendReq) {
      const sender = await req.server.service.user.fetchBy({
        id: req.user.uid,
      });
      if (sender) {
        // Wrap notification in try-catch so it doesn't fail the API response
        try {
          await notifyFriendRequest(
            req.body.requested_uid,
            friendReq.id || "",
            req.user.uid,
            sender.name || "Unknown User",
            sender.email || "",
            sender.avatar || ""
          );
        } catch (notificationError) {
          // Log the error but don't fail the request
          req.server.log.warn(
            { error: notificationError },
            "Failed to send friend request notification, but request was created successfully"
          );
        }
      }
    }

    // Always return 201 Created when request is successfully created
    res.code(201).send({
      success: true,
      request: friendReq,
      message: "Friend request sent successfully",
    });
  } catch (e: unknown) {
    req.server.log.error(
      {
        error: e,
        errorType: typeof e,
        errorKeys: e && typeof e === 'object' ? Object.keys(e) : [],
        isServiceError: isServiceError(e),
        code: e && typeof e === 'object' && 'code' in e ? (e as any).code : undefined,
        message: e && typeof e === 'object' && 'message' in e ? (e as any).message : String(e)
      },
      "Error in sendFriendRequestController"
    );

    if (isServiceError(e)) {
      res.code(e.code).send({
        success: false,
        message: e.message,
      });
    } else {
      req.server.log.error(
        { error: e },
        "Unexpected error in sendFriendRequestController"
      );
      res.code(500).send({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
};

export const resolveFriendRequestController = async (
  req: FastifyRequest<{ Body: ResolveFriendRequestInput }>,
  res: FastifyReply
): Promise<void> => {
  try {
    const friendMS: FriendService = req.server.service.friend;
    const incomingFReqs: FriendRequest[] = await friendMS.getIncomingRequests(
      req.user.uid
    );
    req.server.log.debug(incomingFReqs);
    const targetFReq: FriendRequest | undefined = incomingFReqs.filter(
      (freq) => freq.id === req.body.request_id
    )[0];
    if (!targetFReq) {
      res.code(404).send({
        success: false,
        message: "Friend request not found",
      });
    } else {
      if (!targetFReq.id) {
        throw Error(
          `resolveFriendRequestController(req, res) -> Friend requested with id ${targetFReq.id}`
        );
      } else {
        let message: string;
        let newStatus: string;
        if (req.body.action) {
          await friendMS.acceptRequest(targetFReq.id);
          message = "now you are friends";
          newStatus = "ACCEPTED";

          // Send real-time notification to the requester (non-blocking)
          const acceptedBy = await req.server.service.user.fetchBy({
            id: req.user.uid,
          });
          if (acceptedBy && targetFReq.requesterId) {
            try {
              await notifyFriendRequestAccepted(
                targetFReq.requesterId,
                req.user.uid,
                acceptedBy.name || "Unknown User"
              );
            } catch (notificationError) {
              // Log but don't fail the request - acceptance already happened
              req.server.log.warn(
                { error: notificationError },
                "Failed to send friend accepted notification, but request was accepted successfully"
              );
            }
          }
        } else {
          await friendMS.declineRequest(targetFReq.id);
          message = "why are you lonely?";
          newStatus = "REJECTED";

          // Send real-time notification to the requester (non-blocking)
          const declinedBy = await req.server.service.user.fetchBy({
            id: req.user.uid,
          });
          if (declinedBy && targetFReq.requesterId) {
            try {
              await notifyFriendRequestDeclined(
                targetFReq.requesterId,
                declinedBy.name || "Unknown User"
              );
            } catch (notificationError) {
              // Log but don't fail the request - decline already happened
              req.server.log.warn(
                { error: notificationError },
                "Failed to send friend declined notification, but request was declined successfully"
              );
            }
          }
        }
        res.code(200).send({
          success: true,
          message,
          newStatus,
        });
      }
    }
  } catch (e: unknown) {
    if (isServiceError(e)) {
      res.code(e.code).send({
        success: false,
        message: e.message,
      });
    } else {
      req.server.log.error(
        { error: e },
        "Unexpected error in resolveFriendRequestController"
      );
      res.code(500).send({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
};

export const getFriendsController = async (
  req: FastifyRequest,
  res: FastifyReply
): Promise<void> => {
  const friendMS: FriendService = req.server.service.friend;
  const friends: string[] = await friendMS.getFriends(req.user.uid);
  res.code(200).send(friends);
};

export const getPendingRequestsController = async (
  req: FastifyRequest,
  res: FastifyReply
): Promise<void> => {
  const pendingFriendRequests: FriendRequest[] =
    await req.server.service.friend.getPendingRequests(req.user.uid);
  const pendingFriendIds: string[] = pendingFriendRequests
    .map((freq) => freq.id)
    .filter((fid) => fid !== undefined);
  res.code(200).send(pendingFriendIds);
};

export const getIncomingRequestsController = async (
  req: FastifyRequest,
  res: FastifyReply
): Promise<void> => {
  const incomingFriendRequests: FriendRequest[] =
    await req.server.service.friend.getIncomingRequests(req.user.uid);

  // Return full request objects with requester information
  const requestsWithDetails = await Promise.all(
    incomingFriendRequests.map(async (freq) => {
      if (!freq.requesterId) return null;

      const requester = await req.server.service.user.fetchBy({
        id: freq.requesterId,
      });

      return {
        id: freq.id,
        requesterId: freq.requesterId,
        requesterName: requester?.name || "Unknown User",
        requesterEmail: requester?.email || "",
        requesterAvatar: requester?.avatar || "",
        timestamp: freq.timestamp,
      };
    })
  );

  res.code(200).send(requestsWithDetails.filter((r) => r !== null));
};

export const blockUserController = async (
  req: FastifyRequest<{ Body: BlockUserInput }>,
  rep: FastifyReply
): Promise<void> => {
  try {
    await req.server.service.friend.blockUser(
      req.user.uid,
      req.body.blocked_uid
    );
    rep.code(200).send({
      message: "user blocked successfully",
    });
  } catch (e: unknown) {
    if (isServiceError(e)) {
      rep.code(e.code).send({
        message: e.message,
      });
    } else {
      throw e;
    }
  }
};

export const unblockUserController = async (
  req: FastifyRequest<{ Body: BlockUserInput }>,
  rep: FastifyReply
): Promise<void> => {
  try {
    await req.server.service.friend.unblockUser(
      req.user.uid,
      req.body.blocked_uid
    );
    rep.code(200).send({
      message: "user unblocked successfully",
    });
  } catch (e: unknown) {
    if (isServiceError(e)) {
      rep.code(e.code).send({
        message: e.message,
      });
    } else {
      throw e;
    }
  }
};

export const getBlockedUsersController = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<void> => {
  const blockedUsers = await req.server.service.friend.getBlockedUsers(
    req.user.uid
  );
  rep.code(200).send(blockedUsers);
};

export const unfriendController = async (
  req: FastifyRequest<{ Body: SendFriendRequestInput }>,
  rep: FastifyReply
): Promise<void> => {
  try {
    await req.server.service.friend.unfriend(
      req.user.uid,
      req.body.requested_uid
    );
    rep.code(200).send({
      message: "friendship removed successfully",
    });
  } catch (e: unknown) {
    if (isServiceError(e)) {
      rep.code(e.code).send({
        message: e.message,
      });
    } else {
      throw e;
    }
  }
};

import type { FastifyRequest, FastifyReply } from "fastify";

export const sendDirectMessageController = async (
  req: FastifyRequest<{
    Body: { receiver_uid: string; content: string };
  }>,
  res: FastifyReply
): Promise<void> => {
  try {
    const { receiver_uid, content } = req.body;

    if (!receiver_uid || !content) {
      res.code(400).send({
        message: "Missing required fields: receiver_uid, content",
      });
      return;
    }

    const message = await req.server.service.message.sendDirectMessage(
      req.user.uid,
      receiver_uid,
      content
    );

    res.code(200).send({
      message,
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    res.code(400).send({
      message: error.message || "Failed to send message",
    });
  }
};

export const getDirectMessagesController = async (
  req: FastifyRequest<{
    Querystring: { friend_uid: string; limit?: string; offset?: string };
  }>,
  res: FastifyReply
): Promise<void> => {
  try {
    const { friend_uid, limit = "50", offset = "0" } = req.query;

    if (!friend_uid) {
      res.code(400).send({
        message: "Missing required field: friend_uid",
      });
      return;
    }

    const messages = await req.server.service.message.getDirectMessages(
      req.user.uid,
      friend_uid,
      parseInt(limit, 10),
      parseInt(offset, 10)
    );

    res.code(200).send({
      messages,
    });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    res.code(400).send({
      message: error.message || "Failed to fetch messages",
    });
  }
};

export const deleteMessageController = async (
  req: FastifyRequest<{
    Body: { message_id: string };
  }>,
  res: FastifyReply
): Promise<void> => {
  try {
    const { message_id } = req.body;

    if (!message_id) {
      res.code(400).send({
        message: "Missing required field: message_id",
      });
      return;
    }

    await req.server.service.message.deleteMessage(message_id, req.user.uid);

    res.code(200).send({
      message: "Message deleted",
    });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    res.code(400).send({
      message: error.message || "Failed to delete message",
    });
  }
};

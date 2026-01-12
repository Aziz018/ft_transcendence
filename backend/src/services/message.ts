import type { FastifyInstance } from "fastify";
import DataBaseWrapper from "../utils/prisma.js";
import ServiceError, { type ServiceError_t } from "../utils/service-error.js";

export default class MessageService extends DataBaseWrapper {
  constructor(fastify: FastifyInstance) {
    super("message.service", fastify);
  }

  /**
   * Send a direct message from one user to another
   */
  async sendDirectMessage(
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<any> {
    if (!senderId || !receiverId || !content) {
      throw new Error("Missing required fields: senderId, receiverId, content");
    }

    if (senderId === receiverId) {
      throw new Error("Cannot send message to yourself");
    }

    // Verify both users exist
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      throw new Error("User not found");
    }

    // Verify they are friends
    const friendship = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          {
            requesterId: senderId,
            requestedId: receiverId,
            status: "ACCEPTED",
          },
          {
            requesterId: receiverId,
            requestedId: senderId,
            status: "ACCEPTED",
          },
        ],
      },
    });

    if (!friendship) {
      throw new Error("You are not friends with this user");
    }

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    const messagePayload = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderAvatar: message.sender.avatar,
      receiverId: message.receiverId,
      createdAt: message.createdAt,
    };

    // Notify the receiver via WebSocket
    // We need to access the WebSocket server instance from Fastify
    // The websocket plugin attaches 'websocketServer' to fastify instance
    const wss = this.fastify.websocketServer;
    
    if (wss) {
        wss.clients.forEach((client: any) => {
            // Check if client is authenticated and matches receiverId
            // The 'authenticatedUser' property is attached in the websocketHandler
            if (client.readyState === 1 && client.authenticatedUser?.uid === receiverId) {
                client.send(
                    JSON.stringify({
                        type: "direct_message",
                        payload: messagePayload,
                    })
                );
            }
            
            // Also notify sender's other tabs (optional but good UX)
            if (client.readyState === 1 && client.authenticatedUser?.uid === senderId) {
                 client.send(
                    JSON.stringify({
                        type: "direct_message",
                        payload: messagePayload,
                    })
                );
            }
        });
    }

    return messagePayload;
  }

  /**
   * Get direct messages between two users
   */
  async getDirectMessages(
    userId: string,
    friendId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    if (!userId || !friendId) {
      throw new Error("Missing required fields: userId, friendId");
    }

    // Get messages between the two users (both directions)
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      skip: offset,
    });

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      senderName: msg.sender.name,
      senderAvatar: msg.sender.avatar,
      receiverId: msg.receiverId,
      createdAt: msg.createdAt,
      isOwn: msg.senderId === userId,
    }));
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("You can only delete your own messages");
    }

    await this.prisma.message.delete({
      where: { id: messageId },
    });
  }
}

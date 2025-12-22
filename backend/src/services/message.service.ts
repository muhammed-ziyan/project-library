import { prisma } from '../lib/prisma'

export enum MessageType {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  DIRECT = 'DIRECT',
  SYSTEM = 'SYSTEM'
}

export interface CreateAnnouncementData {
  title: string
  content: string
  createdById?: string
}

export interface CreateDirectMessageData {
  title: string
  content: string
  recipientId: string
  createdById?: string
}

export interface CreateSystemMessageData {
  title: string
  content: string
  recipientId: string
}

export class MessageService {
  /**
   * Create an announcement (broadcast to all users)
   */
  static async createAnnouncement(data: CreateAnnouncementData) {
    const message = await prisma.message.create({
      data: {
        type: MessageType.ANNOUNCEMENT,
        title: data.title,
        content: data.content,
        createdById: data.createdById || null
      }
    })

    return message
  }

  /**
   * Create a direct message to a specific user
   */
  static async createDirectMessage(data: CreateDirectMessageData) {
    // Verify recipient exists
    const user = await prisma.user.findUnique({
      where: { id: data.recipientId }
    })

    if (!user) {
      throw new Error('Recipient not found')
    }

    const message = await prisma.message.create({
      data: {
        type: MessageType.DIRECT,
        title: data.title,
        content: data.content,
        recipientId: data.recipientId,
        createdById: data.createdById || null
      }
    })

    return message
  }

  /**
   * Create a system message (automated)
   */
  static async createSystemMessage(data: CreateSystemMessageData) {
    const message = await prisma.message.create({
      data: {
        type: MessageType.SYSTEM,
        title: data.title,
        content: data.content,
        recipientId: data.recipientId,
        createdById: null
      }
    })

    return message
  }

  /**
   * Get messages for a user (announcements + direct + system)
   */
  static async getUserMessages(userId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize

    // Get announcements (visible to all), direct messages (to this user), and system messages (to this user)
    const where = {
      OR: [
        { type: MessageType.ANNOUNCEMENT },
        { type: MessageType.DIRECT, recipientId: userId },
        { type: MessageType.SYSTEM, recipientId: userId }
      ]
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          reads: {
            where: { userId },
            select: { readAt: true }
          }
        }
      }),
      prisma.message.count({ where })
    ])

    // Transform to include read status
    const messagesWithReadStatus = messages.map(msg => ({
      id: msg.id,
      type: msg.type,
      title: msg.title,
      content: msg.content,
      createdAt: msg.createdAt,
      isRead: msg.reads.length > 0,
      readAt: msg.reads.length > 0 ? msg.reads[0].readAt : null
    }))

    return {
      messages: messagesWithReadStatus,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  /**
   * Mark a message as read
   */
  static async markAsRead(messageId: string, userId: string) {
    // Check if message exists and user has access to it
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      throw new Error('Message not found')
    }

    // Check if user has access to this message
    const hasAccess = 
      message.type === MessageType.ANNOUNCEMENT ||
      (message.type === MessageType.DIRECT && message.recipientId === userId) ||
      (message.type === MessageType.SYSTEM && message.recipientId === userId)

    if (!hasAccess) {
      throw new Error('Access denied')
    }

    // Check if already read
    const existingRead = await prisma.messageRead.findUnique({
      where: {
        messageId_userId: {
          messageId,
          userId
        }
      }
    })

    if (existingRead) {
      return { success: true, alreadyRead: true }
    }

    // Mark as read
    await prisma.messageRead.create({
      data: {
        messageId,
        userId
      }
    })

    return { success: true, alreadyRead: false }
  }

  /**
   * Get unread message count for a user
   */
  static async getUnreadCount(userId: string) {
    // Get all messages accessible to the user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { type: MessageType.ANNOUNCEMENT },
          { type: MessageType.DIRECT, recipientId: userId },
          { type: MessageType.SYSTEM, recipientId: userId }
        ]
      },
      select: { id: true }
    })

    const messageIds = messages.map(m => m.id)

    // Count how many of these the user has NOT read
    const readMessageIds = await prisma.messageRead.findMany({
      where: {
        userId,
        messageId: { in: messageIds }
      },
      select: { messageId: true }
    })

    const readIds = new Set(readMessageIds.map(r => r.messageId))
    const unreadCount = messageIds.filter(id => !readIds.has(id)).length

    return { unreadCount }
  }

  /**
   * Get all messages (for admin audit/history)
   */
  static async getAllMessages(page: number = 1, pageSize: number = 50) {
    const skip = (page - 1) * pageSize

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          recipient: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          _count: {
            select: { reads: true }
          }
        }
      }),
      prisma.message.count()
    ])

    return {
      messages: messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        title: msg.title,
        content: msg.content,
        recipientId: msg.recipientId,
        recipient: msg.recipient,
        createdAt: msg.createdAt,
        readCount: msg._count.reads
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }
}


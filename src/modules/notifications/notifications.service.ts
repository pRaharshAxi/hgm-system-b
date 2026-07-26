/* eslint-disable prettier/prettier */
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import {
    Notification,
    NotificationDocument,
  } from './schemas/notification.schema';
  
  @Injectable()
  export class NotificationsService {
    constructor(
      @InjectModel(Notification.name)
      private readonly notificationModel: Model<NotificationDocument>,
    ) {}
  
    async create(
      userId: string,
      type: string,
      title: string,
      body: string,
      metadata: Record<string, any> = {},
    ) {
      const notification = new this.notificationModel({
        userId,
        type,
        title,
        body,
        metadata,
      });
      return notification.save();
    }
  
    async findByUser(
      userId: string,
      isRead?: boolean,
      page: number = 1,
      limit: number = 20,
    ) {
      const filter: any = { userId };
      if (typeof isRead === 'boolean') {
        filter.isRead = isRead;
      }
  
      const skip = (page - 1) * limit;
  
      const [items, total, unreadCount] = await Promise.all([
        this.notificationModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.notificationModel.countDocuments(filter).exec(),
        this.getUnreadCount(userId),
      ]);
  
      return {
        items,
        total,
        unreadCount,
        page,
        limit,
      };
    }
  
    async markRead(id: string, userId: string) {
      const notification = await this.notificationModel.findById(id).exec();
  
      if (!notification) {
        throw new NotFoundException('Notification not found');
      }
  
      if (notification.userId !== userId) {
        throw new ForbiddenException('Cannot modify notifications for another user');
      }
  
      notification.isRead = true;
      return notification.save();
    }
  
    async markAllRead(userId: string) {
      const result = await this.notificationModel
        .updateMany({ userId, isRead: false }, { $set: { isRead: true } })
        .exec();
  
      return { updatedCount: result.modifiedCount };
    }
  
    async getUnreadCount(userId: string): Promise<number> {
      return this.notificationModel
        .countDocuments({ userId, isRead: false })
        .exec();
    }
  }
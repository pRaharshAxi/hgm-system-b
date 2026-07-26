/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async create(userId: string, type: string, title: string, message: string, meta?: any) {
    this.logger.log(`[NOTIFICATION STUB] To: ${userId} | ${title}: ${message}`, meta);
    return { success: true };
  }
}
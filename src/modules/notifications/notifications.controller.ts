/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Patch,
    Param,
    Query,
    UseGuards,
    Req,
    Res,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { NotificationsService } from './notifications.service';
  import { JwtVerifyGuard } from '../../common/guards/jwt-verify.guard';
  
  @Controller('notifications')
  @UseGuards(JwtVerifyGuard)
  export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}
  
    @Get()
    async getNotifications(
      @Req() req: any,
      @Res({ passthrough: true }) res: Response,
      @Query('isRead') isReadStr?: string,
      @Query('page') pageStr?: string,
      @Query('limit') limitStr?: string,
    ) {
      const userId = req.user.userId;
      const page = Number(pageStr) || 1;
      const limit = Number(limitStr) || 20;
  
      let isRead: boolean | undefined = undefined;
      if (isReadStr === 'true') isRead = true;
      if (isReadStr === 'false') isRead = false;
  
      const result = await this.notificationsService.findByUser(
        userId,
        isRead,
        page,
        limit,
      );
  
      res.setHeader('X-Unread-Count', result.unreadCount.toString());
      return result;
    }
  
    @Get('unread-count')
    async getUnreadCount(@Req() req: any) {
      const userId = req.user.userId;
      const count = await this.notificationsService.getUnreadCount(userId);
      return { unreadCount: count };
    }
  
    @Patch('read-all')
    async markAllRead(@Req() req: any) {
      const userId = req.user.userId;
      return this.notificationsService.markAllRead(userId);
    }
  
    @Patch(':id/read')
    async markRead(@Param('id') id: string, @Req() req: any) {
      const userId = req.user.userId;
      return this.notificationsService.markRead(id, userId);
    }
  }
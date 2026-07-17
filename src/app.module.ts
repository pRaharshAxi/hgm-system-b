import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 2. Makes the config available everywhere in your app
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
import { ConfigService } from '@nestjs/config';
import { ClientsModuleAsyncOptions, Transport } from '@nestjs/microservices';

export const RABBITMQ_SERVICE = 'RABBITMQ_SERVICE';

export const rabbitmqConfig: ClientsModuleAsyncOptions = [
  {
    name: RABBITMQ_SERVICE,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RABBITMQ_URL')!],
        queue: 'hgm_queue',
        queueOptions: {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': 'hgm',
          },
        },
      },
    }),
  },
];

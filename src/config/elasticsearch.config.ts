import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

export const ELASTICSEARCH_CLIENT = 'ELASTICSEARCH_CLIENT';

export const elasticsearchProvider: Provider = {
  provide: ELASTICSEARCH_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Client({
      node: configService.get<string>('ELASTICSEARCH_NODE')!,
      auth: {
        username: configService.get<string>('ELASTICSEARCH_USERNAME')!,
        password: configService.get<string>('ELASTICSEARCH_PASSWORD')!,
      },
    });
  },
};

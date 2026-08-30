import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          synchronize: true,
          autoLoadEntities: true,
          url: configService.get('DATABASE_URL'),
          // ssl: {
          //   rejectUnauthorized: false,
          // },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
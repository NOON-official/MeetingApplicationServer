import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { OrdersModule } from './orders/orders.module';
import { MatchingsModule } from './matchings/matchings.module';
import { InvitationsModule } from './invitations/invitations.module';
import { CouponsModule } from './coupons/coupons.module';
import { TicketsModule } from './tickets/tickets.module';
import { AdminModule } from './admin/admin.module';
import * as redisStore from 'cache-manager-redis-store';
import type { ClientOpts } from 'redis';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.development' : '.env.production',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT, // Number
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity.{js,ts}'],
      synchronize: Boolean(process.env.DB_SYNCHRONIZE),
      timezone: 'Z',
    }),
    CacheModule.register<ClientOpts>({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
      isGlobal: true,
      ttl: 3 * 60, // 제한시간 3분
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    TeamsModule,
    OrdersModule,
    MatchingsModule,
    InvitationsModule,
    CouponsModule,
    TicketsModule,
    AdminModule,
  ],
})
export class AppModule {}

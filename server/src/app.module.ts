import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { JwtService } from '@nestjs/jwt';
import UserModule from './user/user.module';
import AuthModule from './auth/auth.module';
import HomeModule from './profile/home.module';
import { AtGuard } from './guards/at-auth.guard';
import PrismaModule from './prisma/prisma.module';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { FriendshipModule } from './friendship/friendship.module';
import { FriendshipService } from './friendship/friendship.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // To make the config Module global to all the app
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    HomeModule,
    PassportModule.register({}),
    FriendshipModule,
     // j'ai enlevé session:true
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard, // This is done to inject the reflector as we're using the At Guard as a global decorator
    },
    AuthService,
    UserService,
    JwtService,
    FriendshipService,
  ],
})
export default class AppModule {}

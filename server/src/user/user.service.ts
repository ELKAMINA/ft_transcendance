import { Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { send } from 'process';
import { UserUpdates } from './types';
import { GameService } from 'src/game/game.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private gameService: GameService,
  ) {}

  async searchUser(nick: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          login: nick,
        },
        include: {
          blocked: true,
          blockedBy: true,
          friendOf: true,
          friends: true,
          FriendRequestReceived: true,
          FriendRequestSent: true,
        },
      });
      return user;
    } catch (e) {
      //   console.log(e);
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany();
      //   console.log('all the users ', users);
      return users;
    } catch (e) {
      console.log(e);
    }
  }

  async getUserProfile(query: Record<string, any>) {
    const { ProfileName } = query;
    const user = await this.searchUser(ProfileName);
    if (user) return user;
    else return null;
  }

  async getActualUser(body) {
    // console.log('le body de la requete ', body)
    const user = await this.searchUser(body.nickname);
    // console.log('le user ', user)
    if (user) return user;
    else return null;
  }

  async updateUserInfo(userInfo: UserUpdates) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          login: userInfo.oldNick,
        },
      });
      // console.log('le user ', userInfo);
      // const {login, hash, avatar, email} = user
      if (
        (await argon.verify(user.hash, userInfo.pwd)) == false &&
        userInfo.pwd != ''
      ) {
        const newHashedPwd = await argon.hash(userInfo.pwd);
        const up1 = await this.prisma.user.update({
          where: {
            login: userInfo.oldNick,
          },
          data: {
            hash: newHashedPwd,
          },
        });
      }
      if (user.avatar != userInfo.atr && userInfo.atr != '') {
        const up2 = await this.prisma.user.update({
          where: {
            login: userInfo.oldNick,
          },
          data: {
            avatar: userInfo.atr,
          },
        });
      }
      if (user.email != userInfo.mail && userInfo.mail != '') {
        const up3 = await this.prisma.user.update({
          where: {
            login: userInfo.oldNick,
          },
          data: {
            email: userInfo.mail,
          },
        });
      }
      if (user.login != userInfo.login && userInfo.login != '') {
        const up4 = await this.prisma.user.update({
          where: {
            login: userInfo.oldNick,
          },
          data: {
            login: userInfo.login,
          },
        });
      }
      const finalUser = await this.prisma.user.findUnique({
        where: {
          login: userInfo.login,
        },
      });
      // console.log('le user apres modif ', finalUser);
      return finalUser;
    } catch (error: any) {
      if (
        error.constructor.name === Prisma.PrismaClientKnownRequestError.name
      ) {
        if (error.code === 'P2002') {
          return new ForbiddenException('Credentials taken');
        }
      }
      return error;
    } // PrismaClientKnownRequestEr
  }

  async updateData(nickName: string, dataToUpdate: any) {
    const user = await this.prisma.user.update({
      where: {
        login: nickName,
      },
      data: dataToUpdate,
      include: {
        blocked: true,
        blockedBy: true,
        friendOf: true,
        friends: true,
        FriendRequestReceived: true,
        FriendRequestSent: true,
      },
    });
    return user;
  }

  async updateUserGameStat(player: string, iswinner: boolean, score: number) {
    const user = await this.prisma.user.update({
      where: { login: player },
      data: {
        totalMatches: { increment: 1 },
        totalWins: iswinner ? { increment: 1 } : { increment: 0 },
        totalloss: iswinner ? { increment: 0 } : { increment: 1 },
        level: { increment: score },
      },
    });
  }

  // async updateRankOfAllUsers() {
  //   const sortedUsers = await this.gameService.getLeaderBoard();
  //   sortedUsers.map(async (element: any, index: number) => {
  //     await this.prisma.user.update({
  //       where: { login: element.login },
  //       data: { rank: index + 1 },
  //     });
  //   });
  // }
}

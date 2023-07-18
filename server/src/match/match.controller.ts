import { Controller, UseGuards, Get, Post } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('match')
export class MatchController {
  constructor(private prisma: PrismaService, private user: UserService) {}

  @Get('leaderboard')
  @UseGuards(AuthGuard('jwt'))
  getLeaderboard() {
    return "I'm the leaderboard";
  }

  /*** GET ALL USER FROM THE QUEUE ***/
  @Get('/all')
  getAll() {
    return;
  }

  /*** ADD A USER TO THE QUEUE ***/
  @Post('/add')
  addUser() {
    return;
  }

  /*** REMOVE A PLAYER TO THE QUEUE ***/
  @Post('/remove')
  removeUser() {
    return;
  }

  /** FIND AN OPPONENT FROM THE QUEUE ***/
  @Get('/match')
  findUser() {
    return;
  }

  /*** UPDATE USER STATUS TO `IN GAME` ***/
  @Post('/update')
  updateStateUser() {
    return;
  }
}

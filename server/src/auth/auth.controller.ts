import { UserService } from 'src/user/user.service';
import { GetCurrentUserOAuth } from './../decorators/get-user-Oauth.decorator';
import { OauthPayload } from './types/OauthPayload.type';
import { User } from '@prisma/client';
import { Get, UseGuards, Controller, Body, Post, HttpStatus, HttpCode, Redirect} from '@nestjs/common';
import { Request, Response } from 'express';
import { Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { fortyTwoOauthGuard } from '../guards/42-oauth.guard';
import { Tokens } from './types/tokens-types';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HomeService } from 'src/profile/home.service';
import { RtGuard } from 'src/guards/rt-guard';
import { AtGuard } from 'src/guards/at-auth.guard';
import { GetCurrentUserId} from 'src/decorators/get-current-userId.decorator';
import { GetCurrentUser } from 'src/decorators/get-current-user.decorator';
import { Public } from 'src/decorators';
import { JwtPayload} from './types';
import { UnauthorizedException } from '@nestjs/common';


@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService, private userServ: UserService) {}

 /* Simple Login Strategy */
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('Signup')
  // @Redirect('/home')
  signup(@Body() dto: AuthDto): Promise<object>{
    return this.authService.signup(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('Signin')
  @ApiOkResponse({ type: Tokens })
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('Logout')
  @ApiOkResponse({ type: Tokens })
  logout(@GetCurrentUserId() userInfo: JwtPayload, @Req() req: Request) {
    return this.authService.logout(userInfo);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RtGuard)
  @Post('refresh')
  @ApiOkResponse({type: Tokens}) //=> this is for Swagger
  async refresh(@GetCurrentUserId() userInfo: JwtPayload,
  @GetCurrentUser('refreshToken') refreshToken: string) {
    return await this.authService.refresh(userInfo, refreshToken);
  }

 /* ******************** */

  /* 42 Login Strategy */ 

  @Public()
  @Get('42/callback')
  @UseGuards(fortyTwoOauthGuard)
  async oAuthLogin() {
    // console.log("je rentre ici 1 ??")
    return {};
  }

  @Public()
  @Get('42/redirect')
  @UseGuards(fortyTwoOauthGuard)
  @Redirect("http://localhost:3000/welcome")
  async oAuthRedirect(@GetCurrentUserOAuth() userInfo: OauthPayload, @Res({passthrough: true}) res: Response, @Req() req) {
    const infos = await this.authService.findUser(userInfo);
    // console.log("infos de lolo ", infos);
    const {user, access_token, refresh_token} = infos;
    res.cookie(
      'User',
      user,
      {
        maxAge: 18000000,
        httpOnly: false,
        sameSite: 'none',
        secure: true
      }
    )
    res.cookie(
      'access_token',
      access_token,
      {
        maxAge: 18000000,
        httpOnly: false,
        sameSite: 'none',
        secure: true
      }
    )
    res.cookie(
      'refresh_token',
      refresh_token,
      {
        maxAge: 18000000,
        httpOnly: false,
        sameSite: 'none',
        secure: true
      }
    )
    return user;
  }

 /* ******************** */
  /* 2FA Strategy */ 

  @Post('2fa/generate')
  async register(@Res() response: Response, @Req() request) {
    const { otpauthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(
        request.user,
      );
    // const url = this.authService.generateQrCodeDataURL(otpauthUrl);
    return response.json(
      await this.authService.generateQrCodeDataURL(otpauthUrl),
    );
    // return this.authService.pipeQrCodeStream(response, otpauthUrl);
  }

  @Post('2fa/turn-on')
  async turnOnTwoFactorAuthentication(@Req() request, @Body() body) {
    const isCodeValid =
    this.authService.isTwoFactorAuthenticationCodeValid(
      body.TfaCode,
      request.user,
      );
    console.log("userr  ", isCodeValid);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    this.authService.turnOnTwoFactorAuthentication(request.user.sub);
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  async authenticate(@Req() request, @Body() body) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.TfaCode,
      request.user,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return this.authService.loginWith2fa(request.user);
  }

}

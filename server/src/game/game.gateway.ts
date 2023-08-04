import { Injectable, Body } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

import { UserService } from '../user/user.service';
import { FriendshipGateway } from '../friendship/friendship.gateway';
import { GameService } from './game.service';
import { GameDto } from './dto/game.dto';
import {
  EServerPlayType,
  EGameServerStates,
  ERoomStates,
} from './enum/EServerGame';

@WebSocketGateway(4010, { cors: '*' })
@Injectable()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private userService: UserService,
    private friendshipGateway: FriendshipGateway,
    private gameService: GameService,
  ) {}

  @WebSocketServer() server: Server;

  // CONTAINS EVERY CREATED GAME ROOM
  private AllRooms: Array<GameDto> = new Array<GameDto>();
  // CONTAINS EVERY CONNECTED SOCKETS USER
  private socketsPool: Map<string, Socket> = new Map<string, Socket>();

  async handleConnection() {
    this.socketsPool.forEach((element, key, map) => {
      console.log(
        '[GATEWAY] Socket Pool:',
        `key = ${key} | value = ${element}`,
      );
    });
    // Récupération du user connecté à partir du cookie
    // const user = await this.friendshipGateway.getUserInfoFromSocket(
    //   client.handshake.headers.cookie,
    // );
    // if (!user){
    //   console.error('[GATEWAY] USER NOT FOUND')
    // };
    // console.log("[GATEWAY] user: ", user.nickname);
    // Vérification du statut du user à la connexion
    // const isPlaying = (await this.userService.searchUser(user.nickname)).status;
    // console.log(" 2 - Normalement c'est False or Statut Playing ", isPlaying);
    // Si user a le statut "isPlaying", renvoi vers HomePage
    // Cas de reconnexion ou ouverture d'un nouvel onglet
    // if (isPlaying === 'Playing') result = EGameServerStates.HOMEPAGE;
    // Checker si le statut est 'Offline' ???
    // Si user a le statut 'Online', on cherche une room dispo ou on crée une nouvelle
    // else result = this.assignAroomToPlayer(user.nickname);
    // console.log('Statut pour render component ', result);
    // if (result === 1) {
    //   const amItheSndPlayer = this.AllRooms.find((obj) =>
    //     obj.players.includes(user.nickname),
    //   );
    //   if (amItheSndPlayer) result = EGameServerStates.HOMEPAGE;
    //   else {
    //     roomAssigned = this.AllRooms.find(
    //       (el) => el.roomStatus === ERoomStates.WaitingOpponent,
    //     );
    //     roomAssigned.players.push(user.nickname);
    //     roomAssigned.roomStatus = ERoomStates.Busy;
    //     roomAssigned.isFull = true;
    //     client.join(roomAssigned.id);
    //   }
    //   const [socketId, roomName ] = [...client.rooms]
    //   console.log('Assigned room ', roomAssigned)
    //   this.server
    //     .to(roomName)
    //     .emit('updateComponent', { status: result, room: roomAssigned });
    // } else this.server.to(client.id).emit('updateComponent', { status: result, room: roomAssigned });
    // console.log('le résultat ', resultat);
  }

  @SubscribeMessage('initPlayground')
  async initPlayground(@ConnectedSocket() client: Socket, @Body() body) {
    // TODO: ADD A SECURITY ??
    let result = EGameServerStates.HOMEPAGE;
    let roomAssigned: GameDto; // UNDEFINED
    let socketClientRoomId = client.id; // STORE THE SOCKET ID OR THE ROOM TO COMMUNICATE

    console.log('[GATEWAY] body', body);

    // Récupération du user connecté à partir du cookie
    const user = await this.friendshipGateway.getUserInfoFromSocket(
      client.handshake.headers.cookie,
    );
    if (!user) {
      console.error('[GATEWAY] USER NOT FOUND');
    }
    const isPlaying = (await this.userService.searchUser(user.nickname)).status;
    console.log('[GATEWAY] isPlaying:', isPlaying);
    // Si user a le statut "isPlaying", renvoi vers HomePage
    // Cas de reconnexion ou ouverture d'un nouvel onglet
    if (isPlaying === 'Playing') {
      result = EGameServerStates.HOMEPAGE;
    } else {
      // UPDATE THE USER STATUS
      this.userService.updateData(user.nickname, { status: 'Playing' });
      // ADD THE SOCKET USER TO THE SOCKETS POOL
      this.socketsPool.set(user.nickname, client);
      /*** CASE OF RANDOM MATCH FROM HOME OR NAVBAR ***/
      if (body.type === EServerPlayType.RANDOM) {
        result = this.assignAroomToPlayer(user.nickname);
        console.log('[GATEWAY] Statut pour render component ', result);
        // CASE OF JOINING A ROOM
        if (result === EGameServerStates.MATCHMAKING) {
          // SAFETY OF PLAYING AGAINST THE SAME PLAYER
          // CHECK IF THE SECOND PLAYER HAS A WAITING ROOM WITH HIS NAME
          const amItheSndPlayer = this.userInRoom(user.nickname);
          // IF THE SECOND PLAYER HAS ALREADY A ROOM OF HIS NAME
          if (amItheSndPlayer) result = EGameServerStates.HOMEPAGE;
          else {
            // IF THE SECOND PLAYER DOES NOT HAVE A ROOM
            // THEN FIND A WAITING ROOM AVAILABLE
            roomAssigned = this.AllRooms.find(
              (el) => el.roomStatus === ERoomStates.WaitingOpponent,
            );
            // UPDATE THE ROOM WITH THE SECOND PLAYER INFO
            roomAssigned.players.push(user.nickname);
            roomAssigned.roomStatus = ERoomStates.Busy;
            roomAssigned.isFull = true;
            client.join(roomAssigned.id);
            socketClientRoomId = roomAssigned.id;
            console.log('[GATEWAY] Assigned room ', roomAssigned);
            result = EGameServerStates.VERSUS;
          }
        }
        console.log('[GATEWAY] le résultat ', result);
      }
      // CASE OF ONE TO ONE MATCH FROM CHANNEL
      else if (body.type === EServerPlayType.ONETOONE) {
        console.log('[GATEWAY] Match type: ONE TO ONE');
        // CHECK IF BOTH PLAYERS ARE NOT ALREADY IN A ROOM
        // IF ONE ON BOTH === TRUE
        // RESULT ==> EGameServerStates.HOMEPAGE;
        // IF NOT FOR BOTH
        // THEN SENDER --> EGameServerStates.SETTINGS
        // THEN RECEIVER --> EGameServerStates.MATHCMAKING
        const senderRoom = this.userInRoom(body.sender);
        const receiverRoom = this.userInRoom(body.receiver);
        if (senderRoom || receiverRoom) {
          console.error('[GATEWAY - ONE-TO-ONE] One user is already in a rrom');
          result = EGameServerStates.HOMEPAGE;
        } else {
          if (user.nickname === body.sender) {
            result = EGameServerStates.SETTINGS;
          } else {
            result = EGameServerStates.MATCHMAKING;
          }
        }
      } else {
        console.error('[GATEWAY] Match type: UNKNOW');
      }
    }
    // EMIT TO EVERY PLAYER INSIDE THE ROOM THEIR STATE TO DISPLAY THE RIGHT COMPONENT
    // AND UPDATE THE ROOM SETTINGS (PLAYING COLOR, SCORES, PLAYERS)
    // CASE OF CREATION OF THE ROOM
    // EMIT TO THE PLAYER THE STATE TO DISPLAY THE SETTINGS COMPONENT
    // ROOM VARIABLE IS EMPTY GAMEDTO
    console.log('CHECK roomAssigned', roomAssigned);
    this.server
      .to(socketClientRoomId)
      .emit('updateComponent', { status: result, room: roomAssigned });
  }

  @SubscribeMessage('RequestGameSettings')
  async requestGameSettings(@ConnectedSocket() client: Socket, @Body() body) {
    const user = await this.friendshipGateway.getUserInfoFromSocket(
      client.handshake.headers.cookie,
    );
    console.log('[GATEWAY] Request game settings by: ', user.nickname);
    let roomId = client.id;
    let playType = body.roomInfo.type;
    const room: GameDto = {
      id: user.nickname,
      createdDate: new Date(),
      totalSet: 1,
      mapName: 'Default',
      power: false,
      isFull: false,
      players: new Array<string>(),
      playerOneId: client.id,
      playerTwoId: '0',
      collided: true,
      scorePlayers: new Array<number>(),
      roomStatus: ERoomStates.WaitingOpponent,
      isEndGame: false,
      totalPoint: body.points,
      boardColor: body.board,
      ballColor: body.ball,
      paddleColor: body.paddle,
      netColor: body.net,
    };

    room.players.push(user.nickname);
    room.scorePlayers.push(0);
    room.scorePlayers.push(0);
    this.AllRooms.push(room);
    client.join(room.id);
    if (playType === EServerPlayType.ONETOONE) {
      roomId = room.id;
      // TODO: ADD SAFETY CHECK IF THE RECEIVER SOCKETS IS NOT ANYMORE IN THE POOL
      const playerTwoSocket = this.socketsPool.get(body.roomInfo.receiver);
      // SAFETY CHECK WHERE THE RECEIVER HAS ALREADY LEFT THE GAME BEFORE THE END
      // OF THE GAME SETTINGS DEFINITION
      if (!playerTwoSocket) {
        console.error(
          `[GATEWAY] Receiver ${body.roomInfo.receiver} has left the game before the submit of game settings`,
        );
        this.server.to(roomId).emit('updateComponent', {
          status: EGameServerStates.HOMEPAGE,
          room: room,
        });
        return;
      }
      console.log('[GATEWAY] receiverSocket: ', playerTwoSocket.id);
      playerTwoSocket.join(roomId);
      room.players.push(body.roomInfo.receiver);
      room.playerTwoId = playerTwoSocket.id;
      room.isFull = true;
      room.roomStatus = ERoomStates.Busy;
    }
    console.log('TEST');
    if (playType === EServerPlayType.RANDOM) {
      this.server.to(roomId).emit('updateGameSettings', {
        status: EGameServerStates.MATCHMAKING,
        room: room,
      });
    } else {
      this.server.to(roomId).emit('updateGameSettings', {
        status: EGameServerStates.VERSUS,
        room: room,
      });
    }
  }
  // CHANGE THE CLIENT GAME STATES TO GAMEON WHICH WILL DISPLAY
  // PONG BOARD AND ACTIVATE THE GAME
  // THE EMIT SIGNAL WILL BE ACTIVATED ONLY ONE TIME
  // WHEN ONE OF TWO USER OF THE ROOM WILL SEND THE REQUEST
  // THE SECOND USER WILL BE IGNORED BECAUSE THE STATUS OF THE ROOM SERVER
  // WILL BE GAMEON
  @SubscribeMessage('RequestGameOn')
  async requestGameOn(@ConnectedSocket() client: Socket) {
    // TODO: ADD A SECURITY ??
    const user = await this.friendshipGateway.getUserInfoFromSocket(
      client.handshake.headers.cookie,
    );
    if (!user) {
      console.error('[GATEWAY] USER NOT FOUND');
    }
    const room = this.userInRoom(user.nickname); // SHALLOW COPY
    if (room.roomStatus !== ERoomStates.GameOn) {
      this.updateRoomData(room.id, 'roomStatus', ERoomStates.GameOn);
      this.server.to(room.id).emit('updateComponent', {
        status: EGameServerStates.GAMEON,
        room: room,
      });
    }
  }

  @SubscribeMessage('requestEndOfGame')
  async requestEndOfGame(@ConnectedSocket() client: Socket, @Body() body) {
    // TODO: ADD A SECURITY ??
    const user = await this.friendshipGateway.getUserInfoFromSocket(
      client.handshake.headers.cookie,
    );
    if (!user) {
      console.error('[GATEWAY] USER NOT FOUND');
    }
    const room = this.userInRoom(user.nickname); // SHALLOW COPY
    if (room.isEndGame === false) {
      this.updateRoomData(room.id, 'isEndGame', true);
      // TEMPORARY TEST
      this.updateRoomData(room.id, 'scorePlayers', [2, 0]);
      this.server.to(room.id).emit('updateComponent', {
        status: EGameServerStates.ENDGAME,
        room: room,
      });
    }
  }

  async handleDisconnect(client: Socket) {
    let room: GameDto; // UNDEFINED
    // TODO: ADD A SECURITY ??
    const user = await this.friendshipGateway.getUserInfoFromSocket(
      client.handshake.headers.cookie,
    );
    if (!user) {
      console.error('[GATEWAY] USER NOT FOUND');
    }
    console.log('[GATEWAY] user: ', user);
    room = this.userInRoom(user.nickname);
    if (room) {
      // DELETE THE ROOM OF THE USER IF HE IS THE OWNER AND ALONE IN THE ROOM (WAITING)
      // USE CASE:
      // - PLAYER TYPE RANDOM AND NO OPPONENT IS COMING TO THE ROOM
      // - PLAYER TYPE ONE TO NONE BUT THE OPPONENT HAS LEFT THE ROOM BEFORE THE END OF GAME SETTINGS
      if (
        room.id === user.nickname &&
        room.isFull === false &&
        room.roomStatus === ERoomStates.WaitingOpponent
      ) {
        this.AllRooms = this.AllRooms.filter((element) => {
          element.id === room.id;
        });
      }
      // USE CASES:
      // - DISCONNECTION OF ONE OF BOTH PLAYERS IN VERSUS SCREEN
      // - RAGEQUIT
      // - ENDGAME (FIRST DISCONNECTION OF A PLAYER)
      else if (room.isFull === true) {
        // DISCONNECTION OF ONE OF BOTH PLAYERS IN VERSUS SCREEN
        if (room.roomStatus === ERoomStates.Busy) {
          if (room.players.length != 2) {
            this.AllRooms = this.AllRooms.filter((element) => {
              element.id === room.id;
            });
          }
        }
      }
    }

    console.log('[GATEWAY] AllRooms: ', this.AllRooms);
    // DELETE THE USER FROM THE SOCKETS POOL
    this.socketsPool.delete(user.nickname);

    // TODO:
    // HANDLE IN A BETTER WAY THE MODIFICATION OF THE STATUS
    // OR MAKE SURE TO NOT HAVE SIDE EFFECT IF THE USER IS ALREADY PLAYING
    this.userService.updateData(user.nickname, { status: 'Online' });
    // console.log(
    //   `Socket disconnection >>${client.id}<< user: >>${user.nickname}<<`,
    // );
  }

  /*** UTILS ***/

  assignAroomToPlayer(nickname: string) {
    const possibleRooms = this.AllRooms.filter(
      (el) => el.roomStatus === ERoomStates.WaitingOpponent,
    );
    console.log('[GATEWAY] All waiting room: ', possibleRooms);
    if (possibleRooms.length === 0)
      return EGameServerStates.SETTINGS; // pas de room en attente => création
    else return EGameServerStates.MATCHMAKING; // room en attente d'opponent
  }

  // CHECK IF A USER IS ALREADY IN A ROOM
  userInRoom(userName: string): GameDto | undefined {
    const room = this.AllRooms.find((obj) => obj.players.includes(userName));
    console.log('[GATEWAY] userInRoom: ', room);
    return room;
  }

  // FIND A ROOM WHICH IS RELATED TO THE USER AS OWNER AND IN WAITING OF OPPONENT
  findWaitingOwnerRoom(userName: string): GameDto | undefined {
    const room = this.AllRooms.find(
      (element) =>
        element.id === userName &&
        element.isFull === false &&
        element.roomStatus === ERoomStates.WaitingOpponent,
    );
    console.log('[GATEWAY] findWaitingOwnerRoom: ', room);
    return room;
  }

  updateRoomData(roomId: string, data: string, newValue: any) {
    this.AllRooms.forEach((element) => {
      if (element.id === roomId) {
        element[data] = newValue;
      }
    });
  }
}

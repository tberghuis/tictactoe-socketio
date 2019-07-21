// any reason to use a class if a singleton?
// no

const uuid = require("uuid/v1");
const connectionIdToUsername = require("./connectionIdToUsername");

// is technically a list but object makes it easier to retrieve
// required gameRoom object
const gameRooms = {};

// matched unmatched will be derived,
// if slow then add state to data structure

// data structure
// I can see why typescript is good
/*
const gameRooms = {
  <game id>: {
    player1: <connection id>,
    player2: null | <connection id>,
    gameRequestList: [<connection id>, ...]
  }
};
*/

class GameRoom {
  constructor() {

    this.gameId = uuid();

    // could refactor as
    // this.players{<playerId>:{role:"GAME_CREATOR"|"GAME_JOINER",score:2,...}}

    // connectionId
    this.player1 = null;
    this.player2 = null;
    // [<connectionId>, ...]
    this.gameRequestList = [];
    this.board = [["", "", ""], ["", "", ""], ["", "", ""]];
    this.playerTurn = "PLAYER1";
    this.gameFinished = false;
    // e.g. [rematch[player1]=true,rematch[player2]=undefined]
    this.rematch = {};
    // TODO
    this.score = {};
    // TODO
    // this.spectators = []
  }
}

const getJoinGameList = () => {
  return Object.keys(gameRooms)
    .filter(gameId => gameRooms[gameId].player2 === null)
    .map(gameId => ({
      gameId,
      player1Username: connectionIdToUsername[gameRooms[gameId].player1]
    }));
};

const getGameId = playerId => {
  return Object.keys(gameRooms).find(
    gameId =>
      gameRooms[gameId].player1 === playerId ||
      gameRooms[gameId].player2 === playerId
  );
};

const getGameRoom = playerId => {
  return gameRooms[getGameId(playerId)];
};

module.exports = {
  GameRoom,
  gameRooms,
  getJoinGameList,
  getGameId,
  getGameRoom
};

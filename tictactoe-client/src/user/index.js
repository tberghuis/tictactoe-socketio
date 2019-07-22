// probably should rename this file

import store from "../store";
import socket from "../socket";

const socketListenJoinGameList = () => {
  socket.on("join-game-list", joinGameList => {
    store.state.joinGameList = joinGameList;
  });
};

// if real app should use a joinGameRequestId
// instead of exposing another users connectionId
const socketListenJoinGameRequests = () => {
  // be lazy, server can send whole list on any change?
  socket.on("s2c-join-game-request-list", joinGameRequestList => {
    store.state.joinGameRequestList = joinGameRequestList;
  });
};

const socketListenStartGame = () => {
  socket.on(
    "s2c-start-game",
    ({ opponentUsername, turn, playerSymbol, score }) => {
      store.state.opponentUsername = opponentUsername;
      store.state.turn = turn;
      store.state.playerSymbol = playerSymbol;
      store.state.screen = "STATE_SCREEN_SHOW_BOARD";

      store.state.board = [["", "", ""], ["", "", ""], ["", "", ""]];
      store.state.gameResult = null;
      store.state.score = score;
      store.state.joinGameRequestList = [];
      store.state.waitingRematchResponse = false;
    }
  );
};

const socketListenUpdateGame = () => {
  socket.on("s2c-update-game", ({ board, turn, gameResult, score }) => {
    store.state.board = board;
    store.state.turn = turn;
    store.state.gameResult = gameResult;
    store.state.score = score;
  });
};

const socketListenExitGame = () => {
  socket.on("s2c-exit-game", () => {
    store.state.screen = "STATE_SCREEN_GAME_CHOICE";
  });
};

const initSocketListenHandlers = () => {
  socketListenJoinGameList();
  socketListenJoinGameRequests();
  socketListenStartGame();
  socketListenUpdateGame();
  socketListenExitGame();
};

export { initSocketListenHandlers };

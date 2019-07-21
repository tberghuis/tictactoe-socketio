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
  // TODO, use event naming convention for all socket events
  socket.on("s2c-join-game-request-list", joinGameRequestList => {
    console.log(
      "TCL: socketListenJoinGameRequests -> joinGameRequestList",
      joinGameRequestList
    );
    // TODO
    store.state.joinGameRequestList = joinGameRequestList;
  });
};

const socketListenStartGame = () => {
  // be lazy, server can send whole list on any change?
  // TODO, use event naming convention for all socket events
  socket.on(
    "s2c-start-game",
    ({ opponentUsername, turn, playerSymbol, score }) => {
      console.log("s2c-start-game");
      store.state.opponentUsername = opponentUsername;
      store.state.turn = turn;
      store.state.playerSymbol = playerSymbol;
      store.state.screen = "STATE_SCREEN_SHOW_BOARD";

      store.state.board = [["", "", ""], ["", "", ""], ["", "", ""]];
      store.state.gameResult = null;
      store.state.score = score;
      store.state.joinGameRequestList = [];
      store.state.waitingRematchResponse = false;

      console.log("TCL: socketListenUpdateGame -> store.state", store.state);
    }
  );
};

const socketListenUpdateGame = () => {
  socket.on("s2c-update-game", ({ board, turn, gameResult, score }) => {
    console.log(
      "TCL: socketListenUpdateGame -> board, turn, gameResult",
      board,
      turn,
      gameResult
    );
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

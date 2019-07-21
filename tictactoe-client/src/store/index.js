import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    screen: "STATE_SCREEN_GET_USERNAME",
    board: [["", "", ""], ["", "", ""], ["", "", ""]],
    user: { username: null },
    joinGameList: [],
    joinGameRequestList: [],
    opponentUsername: null,
    turn: null,
    playerSymbol: null,
    gameResult: null,
    score: null,
    waitingRematchResponse: false
  }
});

/* valid states */
/*
screen:
  STATE_SCREEN_GET_USERNAME
  STATE_SCREEN_GAME_CHOICE
  STATE_SCREEN_SELECT_OPPONENT
  STATE_SCREEN_JOIN_GAME
  STATE_SCREEN_SHOW_BOARD

user:
  username: null | 'somestring'

joinGameRequestList: [
  { connectionId: "some-connection-id", username: "someusername" }
]
*/

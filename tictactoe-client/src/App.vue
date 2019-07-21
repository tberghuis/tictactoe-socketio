<template>
  <div>
    <h1>tictactoe-socketio</h1>
    <GetUsername v-if="screen === 'STATE_SCREEN_GET_USERNAME'"></GetUsername>
    <GameChoice v-else-if="screen === 'STATE_SCREEN_GAME_CHOICE'"></GameChoice>
    <SelectOpponent v-else-if="screen === 'STATE_SCREEN_SELECT_OPPONENT'"></SelectOpponent>
    <JoinGame v-else-if="screen === 'STATE_SCREEN_JOIN_GAME'"></JoinGame>
    <Board v-else-if="screen === 'STATE_SCREEN_SHOW_BOARD'"></Board>
  </div>
</template>

<script>
import Board from "./components/Board.vue";
import GetUsername from "./components/GetUsername.vue";
import GameChoice from "./components/GameChoice.vue";
import SelectOpponent from "./components/SelectOpponent.vue";
import RoomChoice from "./components/RoomChoice.vue";
import JoinGame from "./components/JoinGame.vue";

export default {
  name: "app",
  components: {
    Board,
    GetUsername,
    GameChoice,
    RoomChoice,
    SelectOpponent,
    JoinGame
  },
  computed: {
    screen() {
      return this.$store.state.screen;
    }
  }
};
</script>

<style>
h1,
p {
  text-align: center;
}
</style>

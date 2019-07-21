<template>
  <div>
    <p v-if="joinGameList.length === 0">Waiting for games to join...</p>
    <div v-if="joinGameList.length > 0">
      <p v-for="game in joinGameList" :key="game.gameId">
        <button v-on:click="joinGame(game.gameId)">Join</button>
        game created by {{game.player1Username}}
      </p>
    </div>
  </div>
</template>

<script>
import socket from "../socket";

export default {
  name: "JoinGame",

  data: function() {
    return {};
  },
  computed: {
    joinGameList() {
      return this.$store.state.joinGameList;
    }
  },
  methods: {
    joinGame(gameId) {
      socket.emit("c2s-join-game-request", gameId);
    }
  }
};
</script>

<style scoped>
</style>

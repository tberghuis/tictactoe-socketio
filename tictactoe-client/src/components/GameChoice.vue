<template>
  <div>
    <p>Welcome {{username}}</p>
    <p>
      <button v-on:click="createGame">create a game</button>
      <button v-on:click="joinGame">join a game</button>
      <button v-on:click="changeUsername">change username</button>
    </p>
  </div>
</template>

<script>
import socket from "../socket";

export default {
  name: "GameChoice",

  data: function() {
    return {};
  },
  computed: {
    username() {
      return this.$store.state.user.username;
    }
  },
  methods: {
    createGame: function() {
      socket.emit("create-game", res => {
        this.$store.state.screen = "STATE_SCREEN_SELECT_OPPONENT";
      });
    },
    joinGame: function() {
      socket.emit("subscribe-join-game-list");
      this.$store.state.screen = "STATE_SCREEN_JOIN_GAME";
    },
    changeUsername() {
      this.$store.state.screen = "STATE_SCREEN_GET_USERNAME";
    }
  }
};
</script>

<style scoped>
</style>

<template>
  <div>
    <p>Please enter your username:</p>
    <p>
      <input v-on:keyup.enter="submit" v-model="username" placeholder="username" />
      <button v-on:click="submit">submit</button>
    </p>
  </div>
</template>

<script>
import socket from "../socket";

export default {
  name: "GetUsername",
  data: function() {
    return {
      username: ""
    };
  },
  methods: {
    submit: function() {
      const username = this.username;
      socket.emit("validate-username", username, response => {
        if (response === "username-valid") {
          this.$store.state.user.username = username;
          this.$store.state.screen = "STATE_SCREEN_GAME_CHOICE";
        }
      });
    }
  }
};
</script>

<style scoped>

</style>

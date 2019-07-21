<template>
  <div>
    <p v-if="joinGameRequestList.length === 0">Waiting for opponent...</p>
    <div v-else>
      <p v-for="gameRequest in joinGameRequestList" :key="gameRequest.connectionId">
        Allow player {{gameRequest.username}} to join
        <button
          @click="acceptRequest(gameRequest.connectionId)"
        >Accept</button>
        <!-- TODO -->
        <!-- <button @click="rejectRequest(gameRequest.connectionId)">Reject</button> -->
      </p>
    </div>
  </div>
</template>

<script>
import socket from "../socket";

export default {
  name: "SelectOpponent",

  data: function() {
    return {
      joinRequests: []
    };
  },
  computed: {
    joinGameRequestList() {
      return this.$store.state.joinGameRequestList;
    }
  },
  methods: {
    acceptRequest(connectionId) {
      console.log("TCL: acceptRequest -> connectionId", connectionId);
      socket.emit("c2s-accept-join-request", connectionId);
    }
  }
};
</script>

<style scoped>
</style>

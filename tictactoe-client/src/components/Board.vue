<template>
  <div>
    <p v-if="gameResult">{{gameResultMessage}}</p>
    <p v-else-if="turn">Your turn {{playerSymbol}}</p>
    <p v-else>Opponent's turn {{opponentSymbol}}</p>

    <p>Score: {{score}}</p>
    <p>Opponent: {{opponentUsername}}</p>
    <div
      class="board"
      :style="{width: boardSize+'px',height:boardSize+'px',fontSize:boardFontSize+'px'}"
    >
      <div class="row row1">
        <div class="col col1" @click="cellClick(0,0)">{{board[0][0]}}</div>
        <div class="col col2" @click="cellClick(0,1)">{{board[0][1]}}</div>
        <div class="col col3" @click="cellClick(0,2)">{{board[0][2]}}</div>
      </div>
      <div class="row row2">
        <div class="col col1" @click="cellClick(1,0)">{{board[1][0]}}</div>
        <div class="col col2" @click="cellClick(1,1)">{{board[1][1]}}</div>
        <div class="col col3" @click="cellClick(1,2)">{{board[1][2]}}</div>
      </div>
      <div class="row row3">
        <div class="col col1" @click="cellClick(2,0)">{{board[2][0]}}</div>
        <div class="col col2" @click="cellClick(2,1)">{{board[2][1]}}</div>
        <div class="col col3" @click="cellClick(2,2)">{{board[2][2]}}</div>
      </div>
    </div>
    <p v-if="gameResult">
      <button @click="rematch">Rematch</button>
      <button @click="exit">Exit</button>
      {{waitingRematchResponse?' waiting rematch response...':''}}
    </p>
  </div>
</template>

<script>
// TODO write a function which scales font size depending on board_size
import socket from "../socket";

export default {
  name: "Board",
  props: {},
  data: function() {
    return { boardSize: 300 };
  },
  computed: {
    board() {
      return this.$store.state.board;
    },
    score() {
      return this.$store.state.score;
    },
    boardFontSize() {
      // do i need to round to closest integer?
      return this.boardSize / 4;
    },
    turn() {
      return this.$store.state.turn;
    },
    playerSymbol() {
      return this.$store.state.playerSymbol;
    },
    opponentSymbol() {
      return this.$store.state.playerSymbol === "X" ? "O" : "X";
    },
    opponentUsername() {
      return this.$store.state.opponentUsername;
    },
    gameResult() {
      return this.$store.state.gameResult;
    },
    gameResultMessage() {
      if (this.gameResult === "DRAW") {
        return "Game result is a draw";
      }
      if (this.gameResult === "WINNER") {
        return "Congratulations, you have won!";
      }
      if (this.gameResult === "LOSER") {
        return "Game over, loser";
      }
      return null;
    },
    waitingRematchResponse() {
      return this.$store.state.waitingRematchResponse;
    }
  },
  methods: {
    cellClick(row, col) {
      if (!this.turn) {
        return;
      }
      console.log("row,col", row, col);

      // TODO is cell empty, let server side deal with that for now

      // emit row col
      socket.emit("c2s-player-turn", { row, col });
    },
    rematch() {
      socket.emit("c2s-rematch");
      this.$store.state.waitingRematchResponse = true;
    },
    exit() {
      socket.emit("c2s-exit");
    }
  }
};
</script>

<style scoped>
.board {
  background-image: url(/images/board-background.svg);
  background-size: contain;
  display: flex;
  flex-direction: column;
  /* when board_size 500 */
  /* font-size: 100px; */
  /* font-size: 50px; */

  margin-left: auto;
  margin-right: auto;
}
.row {
  flex-grow: 1;
  flex-basis: 0;
  display: flex;
}
.col {
  flex-grow: 1;
  flex-basis: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

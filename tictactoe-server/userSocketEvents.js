const connectionIdToUsername = require("./connectionIdToUsername");
const {
  GameRoom,
  gameRooms,
  getJoinGameList,
  getGameId,
  getGameRoom
} = require("./gameRooms");
const { io } = require("./server");

// should i import socket rather than expect it passed in?
// since socket singleton should probably expect it passed in
// but other modules are designed with objects passed in
// stick with this design for now

module.exports = socket => {
  socket.on("validate-username", (username, ack) => {
    if ([undefined, null, ""].includes(username)) {
      ack("username-invalid");
      return;
    }
    connectionIdToUsername[socket.id] = username;
    ack("username-valid");
    // TODO filter connectionIdToUsername length > 0
    // ack("username-taken");
    // TODO regex not valid chars
    // ack("username-invalid");
  });

  socket.on("create-game", ack => {
    // if real app need to restrict user can only create one game at a time (authorisation)
    const gameRoom = new GameRoom();
    gameRooms[gameRoom.gameId] = gameRoom;
    gameRoom.player1 = socket.id;

    // redundant?
    ack("game-created");

    io.to("join-game-list-subscribers").emit(
      "join-game-list",
      getJoinGameList()
    );
  });

  socket.on("subscribe-join-game-list", () => {
    socket.join("join-game-list-subscribers");
    socket.emit("join-game-list", getJoinGameList());
  });

  socket.on("c2s-join-game-request", gameId => {
    gameRooms[gameId].gameRequestList.push({
      connectionId: socket.id,
      username: connectionIdToUsername[socket.id]
    });
    socket.broadcast
      .to(gameRooms[gameId].player1)
      .emit("s2c-join-game-request-list", gameRooms[gameId].gameRequestList);
  });

  // assumptions: player who create game is player1, has first turn
  // and is symbol 'X'
  socket.on("c2s-accept-join-request", (connectionId, ack) => {
    // remove connectionId from all game request lists
    Object.keys(gameRooms).forEach(gameId => {
      const updatedGameRequestList = gameRooms[gameId].gameRequestList.filter(
        gameRequest => gameRequest.connectionId !== connectionId
      );
      if (updatedGameRequestList.length !== gameRooms[gameId].gameRequestList) {
        gameRooms[gameId].gameRequestList = updatedGameRequestList;
        socket.broadcast
          .to(gameRooms[gameId].player1)
          .emit(
            "s2c-join-game-request-list",
            gameRooms[gameId].gameRequestList
          );
      }
    });

    const gameId = Object.keys(gameRooms).find(
      gameId => gameRooms[gameId].player1 === socket.id
    );

    gameRooms[gameId].player2 = connectionId;
    // redundant but being explicit
    gameRooms[gameId].playerTurn = "PLAYER1";

    gameRooms[gameId].score[connectionId] = 0;
    gameRooms[gameId].score[socket.id] = 0;

    socket.emit("s2c-start-game", {
      opponentUsername: connectionIdToUsername[connectionId],
      turn: true,
      playerSymbol: "X",
      // client should calc this instead
      score: calcScorePlayer(gameRooms[gameId]).player1()
    });
    socket.broadcast.to(connectionId).emit("s2c-start-game", {
      opponentUsername: connectionIdToUsername[socket.id],
      turn: false,
      playerSymbol: "O",
      score: calcScorePlayer(gameRooms[gameId]).player2()
    });
  });

  // this is doing it wrong, lets take this as far as i can go
  socket.on("c2s-player-turn", ({ row, col }) => {
    // TODO validate
    // TODO authorised
    // TODO valid move

    const gameId = getGameId(socket.id);
    if (gameRooms[gameId].gameFinished) {
      return;
    }
    const isPlayer1 = gameRooms[gameId].player1 === socket.id;

    // stop cheating
    if (
      (isPlayer1 && gameRooms[gameId].playerTurn === "PLAYER2") ||
      (!isPlayer1 && gameRooms[gameId].playerTurn === "PLAYER1") ||
      gameRooms[gameId].board[row][col] !== ""
    ) {
      return;
    }

    // update game state
    gameRooms[gameId].playerTurn = isPlayer1 ? "PLAYER2" : "PLAYER1";
    gameRooms[gameId].board[row][col] = isPlayer1 ? "X" : "O";

    const { player1, player2, board, playerTurn } = gameRooms[gameId];

    const didWinRow = rowIndex => {
      return (
        board[rowIndex][0] !== "" &&
        board[rowIndex][0] === board[rowIndex][1] &&
        board[rowIndex][1] === board[rowIndex][2]
      );
    };

    const didWinCol = colIndex => {
      return (
        board[0][colIndex] !== "" &&
        board[0][colIndex] === board[1][colIndex] &&
        board[1][colIndex] === board[2][colIndex]
      );
    };

    const didWinDiag = () => {
      return (
        board[1][1] !== "" &&
        ((board[0][0] === board[1][1] && board[1][1] === board[2][2]) ||
          (board[2][0] === board[1][1] && board[1][1] === board[0][2]))
      );
    };

    let player1Won = false;
    let player2Won = false;
    let draw = false;

    // did player win?
    if (
      didWinRow(0) ||
      didWinRow(1) ||
      didWinRow(2) ||
      didWinCol(0) ||
      didWinCol(1) ||
      didWinCol(2) ||
      didWinDiag()
    ) {
      player1Won = isPlayer1;
      player2Won = !isPlayer1;
      if (player1Won) {
        gameRooms[gameId].score[player1]++;
      } else {
        gameRooms[gameId].score[player2]++;
      }
      gameRooms[gameId].gameFinished = true;
    }
    // is it a draw
    else if (!board.flat().includes("")) {
      draw = true;
      gameRooms[gameId].gameFinished = true;
    }

    const calcGameResultPlayer1 = () => {
      return draw
        ? "DRAW"
        : player1Won
        ? "WINNER"
        : player2Won
        ? "LOSER"
        : null;
    };
    const calcGameResultPlayer2 = () => {
      return draw
        ? "DRAW"
        : player1Won
        ? "LOSER"
        : player2Won
        ? "WINNER"
        : null;
    };

    // should refactor so server calcs generic result and client calcs if they are
    // the winner or not
    // will probably need uuids for players
    io.to(player1).emit("s2c-update-game", {
      board,
      turn: playerTurn === "PLAYER1",
      gameResult: calcGameResultPlayer1(),
      score: calcScorePlayer(gameRooms[gameId]).player1()
    });

    io.to(player2).emit("s2c-update-game", {
      board,
      turn: playerTurn === "PLAYER2",
      gameResult: calcGameResultPlayer2(),
      score: calcScorePlayer(gameRooms[gameId]).player2()
    });
  });

  socket.on("c2s-rematch", () => {
    const gameRoom = getGameRoom(socket.id);
    gameRoom.rematch[socket.id] = true;
    const { rematch, player1, player2 } = gameRoom;
    if (rematch[player1] && rematch[player2]) {
      // reset state in gameRoom
      gameRoom.board = [["", "", ""], ["", "", ""], ["", "", ""]];
      gameRoom.playerTurn = "PLAYER1";
      gameRoom.gameFinished = false;
      gameRoom.rematch = {};

      // swap player1 & 2 because I assume player1 is X
      // really do need to refactor
      gameRoom.player1 = player2;
      gameRoom.player2 = player1;

      io.to(gameRoom.player1).emit("s2c-start-game", {
        opponentUsername: connectionIdToUsername[gameRoom.player2],
        turn: true,
        playerSymbol: "X",
        score: calcScorePlayer(gameRoom).player1()
      });
      io.to(gameRoom.player2).emit("s2c-start-game", {
        opponentUsername: connectionIdToUsername[gameRoom.player1],
        turn: false,
        playerSymbol: "O",
        score: calcScorePlayer(gameRoom).player2()
      });
    }
  });

  socket.on("c2s-exit", () => {
    const gameRoom = getGameRoom(socket.id);
    delete gameRooms[gameRoom.gameId];
    io.to(gameRoom.player1).emit("s2c-exit-game");
    io.to(gameRoom.player2).emit("s2c-exit-game");
  });

  socket.on("disconnect", () => {
    const gameRoom = getGameRoom(socket.id);
    if (!gameRoom) {
      return;
    }
    delete gameRooms[gameRoom.gameId];
    // null values don't matter
    io.to(gameRoom.player1).emit("s2c-exit-game");
    io.to(gameRoom.player2).emit("s2c-exit-game");
  });
};

const calcScorePlayer = gameRoom => {
  const player1Username = connectionIdToUsername[gameRoom.player1];
  const player2Username = connectionIdToUsername[gameRoom.player2];
  const scorePlayer1 = gameRoom.score[gameRoom.player1];
  const scorePlayer2 = gameRoom.score[gameRoom.player2];

  return {
    player1: () =>
      `${scorePlayer1} (${player1Username}) - ${scorePlayer2} (${player2Username})`,
    player2: () =>
      `${scorePlayer2} (${player2Username}) - ${scorePlayer1} (${player1Username})`
  };
};

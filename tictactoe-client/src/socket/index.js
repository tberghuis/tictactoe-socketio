import io from "socket.io-client";

// TODO https
// proxy pass /socket.io/
// const socket = io("http://localhost:3000");
// TODO env var localhost for dev
const socket = io("https://tictactoe-socketio.tomberghuis.site");

export default socket;

// TODO control with env var
require("./devGlobals");
const { io, server } = require("./server");
const userSocketEvents = require("./userSocketEvents");
const port = process.env.PORT || 3000;

// TODO cors???

server.listen(port, () => {
  console.log("Server listening at port %d", port);
});

io.on("connection", socket => {
  userSocketEvents(socket);
});

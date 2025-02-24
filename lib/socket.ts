import { Server } from "socket.io"

export function initSocket(server: any) {
  const io = new Server(server, {
    path: "/api/socket",
    addTrailingSlash: false,
  })

  io.on("connection", (socket) => {
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId)
    })

    socket.on("message", (data) => {
      io.to(data.roomId).emit("message", data)
    })
  })

  return io
} 
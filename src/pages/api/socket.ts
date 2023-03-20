import { NextApiRequest } from "next";
import { Server, Socket } from "socket.io";
import { NextApiResponseWithSocket } from "types/types";

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (res.socket.server.io) {
        console.log("Socket is already attached");
        return res.end();
    }

    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket: Socket) => {
        console.log(`User Connected: ${socket.id}`);

        // user joins
        socket.on("join", (roomName: string) => {
            const { rooms } = io.sockets.adapter;
            const room = rooms.get(roomName);

            if (room === undefined) {
                socket.join(roomName);
                socket.emit("created");
            } else if (room.size === 1) {
                socket.join(roomName);
                socket.emit("joined");
            } else {
                socket.emit("full");
            }
            console.log(rooms);
        });

        // user who joined is ready to communicate
        socket.on("ready", (roomName: string) => {
            socket.broadcast.to(roomName).emit("ready");
        });

        // server gets an IceCandidate from a peer in the room
        socket.on("ice-candidate", (candidate: RTCIceCandidate, roomName: string) => {
            console.log(candidate);
            socket.broadcast.to(roomName).emit("ice-candidate", candidate);
        });

        // server gets an offer from a peer in the room
        socket.on("offer", (offer: RTCOfferOptions, roomName: string) => {
            socket.broadcast.to(roomName).emit("offer", offer);
        });

        // server gets an answer from a peer in the room
        socket.on("answer", (answer: RTCAnswerOptions, roomName: string) => {
            socket.broadcast.to(roomName).emit("answer", answer);
        });

        // user leaves room
        socket.on("leave", (roomName: string) => {
            socket.leave(roomName);
            socket.broadcast.to(roomName).emit("leave");
        });
    });

    return res.end();
}

import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

export interface SocketServer extends HTTPServer {
    io?: IOServer | undefined;
}

export interface SocketWithIO extends NetSocket {
    server: SocketServer;
}

export interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO;
}

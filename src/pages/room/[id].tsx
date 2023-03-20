import useSocket from "@/hooks/useSocket";
import { useRouter } from "next/router";
import { EffectCallback, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";

export default function Room() {
    useSocket();

    const router = useRouter();
    const userVideoRef: any = useRef();
    const peerVideoRef: any = useRef();
    const rtcConnectionRef: any = useRef(null);
    const socketRef = useRef<Socket>();
    const userStreamRef: any = useRef();
    const hostRef = useRef(false);

    const { id: roomName } = router.query;

    useEffect((): any => {
        socketRef.current = io();

        socketRef.current.emit('join', roomName);

        socketRef.current.on('created', handleRoomCreated);

        socketRef.current.on('joined', handleRoomJoined);

        socketRef.current.on('ready', initiateCall);

        socketRef.current.on('leave', onPeerLeave);

        socketRef.current.on('full', () => {
            window.location.href = "/";
        });

        socketRef.current.on('offer', handleReceivedOffer);
        socketRef.current.on('answer', handleAnswer);
        socketRef.current.on('ice-candidate', handleNewIceCandidateMessage);

        return () => socketRef.current?.disconnect
    }, [roomName]);

    const handleRoomCreated = () => {
        hostRef.current = true;
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {width: 500, height: 500}
        }).then((stream) => {
            userStreamRef.current = stream;
            userVideoRef.current.srcObject = stream;
            userVideoRef.current.onloadedmetadata = () => {
                userVideoRef.current.play();
            }
        }).catch((error) => {
            console.log(error);
        })
    };

    const handleRoomJoined = () => {
        navigator.mediaDevices
            .getUserMedia({
                audio: true,
                video: {width: 500, height: 500}
            }).then((stream) => {
                userStreamRef.current = stream;
                userVideoRef.current.srcObject = stream;
                userVideoRef.current.onloadedmetadata = () => {
                    userVideoRef.current.play();
                };
                socketRef.current?.emit('ready', roomName);
            }).catch((err) => {
                console.log('error: ', err);
            });
    };

    const initiateCall = () => {
        if(hostRef.current) {
            rtcConnectionRef.current = createPeerConnection();
            rtcConnectionRef.current.addTrack(
                userStreamRef.current.getTracks()[0],
                userStreamRef.current
            );
            rtcConnectionRef.current.addTrack(
                userStreamRef.current.getTracks()[1],
                userStreamRef.current
            );
            rtcConnectionRef.current
                .createOffer()
                .then((offer: Promise<RTCSessionDescription>) => {
                    rtcConnectionRef.current.setLocalDescription(offer);
                    socketRef.current?.emit('offer', offer, roomName);
                })
                .catch((error: Error) => {
                    console.log(error)
                })
        }
    }

    return(
        <div>
            <video autoPlay ref={userVideoRef} />
            <video autoPlay ref={peerVideoRef} />
        </div>
    )
}
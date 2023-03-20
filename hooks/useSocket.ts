import { useEffect, useRef } from "react";

export default function useSocket() {
    const socketCreated = useRef(false);

    useEffect(() => {
        if(!socketCreated.current) {
            const socketInitializer = async() => {
                await fetch('/api/socket')
            }
            try {
                socketInitializer()
                socketCreated.current = true;
            } catch(error) {
                console.log(error)
            }
        }
    }, []);
}
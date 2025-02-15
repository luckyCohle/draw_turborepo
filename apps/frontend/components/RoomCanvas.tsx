"use client";

import { httpUrl, wsUrl } from "@/url";
import { useEffect, useState } from "react";
import { Loading } from "./Loading";
import Canvas from "./Canvas";
import { useRouter } from "next/navigation";
import RedirectPage from "./Redirecting";
import axios from "axios";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isValidRoomId, setIsValidRoomId] = useState<boolean | null>(null);

  // Verifying and setting token
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setIsRedirecting(true);
      return;
    }
    setToken(storedToken);
  }, []);

  // Verifying roomId
  useEffect(() => {
    const validateRoom = async () => {
      try {
        const isValid = await checkRoomValidity(roomId);
        console.log("isValid "+isValid);
        setIsValidRoomId(isValid);
      } catch (err) {
        console.error("Room validation error:", err);
        setIsValidRoomId(false);
      }
    };
    validateRoom();
  }, [roomId]);

  // Connecting to WebSocket server
  useEffect(() => {
    if (!token || isValidRoomId === null) return;

    if (!isValidRoomId) {
      setIsLoading(false);
      return;
    }

    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: roomId,
        })
      );
      setIsLoading(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsLoading(false);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [token, isValidRoomId]);

  // Redirecting if unauthorized
  if (isRedirecting) {
    return (
      <RedirectPage
        message={"Unauthorized: Please log in to access this page"}
        destination={"/signin"}
        timeoutTime={3000}
      />
    );
  }

  // Handling invalid room
  if (isValidRoomId === false) {
    return (
      <RedirectPage
        message={"Not a valid roomId, redirecting to landing page"}
        destination={"/"}
        timeoutTime={4000}
      />
    );
  }

  // Show loading state
  if (isLoading || !socket) {
    return <Loading />;
  }

  return <Canvas roomId={roomId} socket={socket} />;
}

// API call to check room validity
async function checkRoomValidity(roomId: string): Promise<boolean> {
  try {
    const response = await axios.get(`${httpUrl}/roomCheck/${roomId}`);
    return response.data.isValidRoom; 
  } catch (error) {
    console.error("Error checking room validity:", error);
    return false;
  }
}

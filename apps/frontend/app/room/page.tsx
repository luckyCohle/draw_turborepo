"use client";
import { useState, useEffect } from "react";
import { Button, btnType } from "@repo/ui/button";
import { Input } from "@/components/input";
import axios from "axios";
import { httpUrl } from "@/url";
import { Loading } from "@/components/Loading";

interface Room {
  id: string;
  roomName: string;
  adminId?: string;
  adminName?: string;
}

const RoomPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setRoomsArray = async () => {
      const existingRooms: Room[] = await getRooms();
      setRooms(existingRooms);
      setIsLoading(false)
    }

    setRoomsArray();
  }, []);

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      alert("Room name cannot be empty!");
      return;
    }

    setRooms((prev) => [...prev, { id: Date.now().toString(), roomName: newRoomName }]);
    setNewRoomName("");
  };

  if (isLoading) {
    return (
      <div>
        <Loading messagePrimary="preparing the page" messageSecondary="fetching the Data.." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex justify-evenly items-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white text-center">
          <h2 className="text-xl font-bold">Rooms</h2>
          <p className="text-blue-100 text-sm mt-1">Join a room</p>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold  text-gray-700 mb-2">Available Rooms</h3>
          <div className="h-48 overflow-y-auto">
            <ul className="space-y-2">
              {rooms?.map((room) => (
                <li key={room.id} className="bg-gray-50 px-3 py-2 flex justify-around rounded-md text-gray-800 text-sm font-medium shadow-sm hover:bg-gray-100 transition">
                  <p className="font-semibold">{room.roomName}</p><p>admin name:{room.adminName}</p>
                </li>
              )) || <p>No rooms available</p>}
            </ul>
          </div>

          <div className="h-6 p-2">
            <hr className="border-t-2 border-gray-300 my-4" />
          </div>
          <Button
                btn={btnType.primary}
                handleClick={handleCreateRoom}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Join Room
              </Button>
        </div>
      </div>

      <p className="underline text-2xl font-serif text-purple-600">
        OR
      </p>

      <div className="max-w-sm w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white text-center">
          <h2 className="text-xl font-bold">Rooms</h2>
          {/* <p className="text-blue-100 text-sm mt-1">Create a new Room </p> */}
        </div>

        <div className="p-4">
          <div className="mt-4">
            <h3 className="text-lg  font-semibold text-gray-600 mb-2">Create a new Room</h3>
            <div className="space-y-3">
              <Input
                placeholder="Enter room name"
                value={newRoomName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoomName(e.target.value)}
                classes="w-full bg-gray-200 shadow-2 my-2"
                name="roomName"
              />
              <Button
                btn={btnType.primary}
                handleClick={handleCreateRoom}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Create Room
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
async function getRooms(): Promise<Room[]> {
  console.log("called getRooms")
  try {
    const response = await axios.get(`${httpUrl}/getRooms`);
    const roomArray: Room[] = response.data.rooms
    console.log(response.data)
    console.log(roomArray)
    return roomArray;

  } catch (error) {
    console.error(error);
    return [];
  }
}

export default RoomPage;

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../utils/socket";
import { incrementGiftRequestCount } from "../slices/giftRequestsReceivedSlice";

export function useGiftRequestSocket() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) return;

    socket.emit("joinUser", userInfo.userId);

    const handleGiftRequest = (request) => {
      console.log("🔔 Received gift request via socket", request);
      dispatch(incrementGiftRequestCount());
    };

    socket.on("giftRequest:new", handleGiftRequest);

    return () => {
      socket.off("giftRequest:new", handleGiftRequest);
    };
  }, [userInfo, dispatch]);
}

import { onlineUsers, lastSeen } from '../sockets/state';

export const getUserStatus = (userId: string) => {
  if (onlineUsers.has(userId) && onlineUsers.get(userId)!.size > 0) {
    return { isOnline: true, lastSeen: null };
  }

  return {
    isOnline: false,
    lastSeen: lastSeen.get(userId) || null,
  };
};

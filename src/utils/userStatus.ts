import User from "../models/User";

export const getUserStatus = async (userId: string) => {
  const user = await User.findById(userId).select("isOnline lastSeen");
  if (!user) return { isOnline: false, lastSeen: null };
  return { isOnline: user.isOnline, lastSeen: user.lastSeen };
};

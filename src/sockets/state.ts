export const onlineUsers = new Map<string, Set<string>>();
// userId -> set of socketIds

export const lastSeen = new Map<string, number>();
// userId -> timestamp

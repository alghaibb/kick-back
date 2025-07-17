"use client";

import { createContext, useContext } from "react";

export interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  nickname: string | null;
  image: string | null;
}

const UserContext = createContext<User | null>(null);

export const useUser = () => useContext(UserContext);

export function UserProvider({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

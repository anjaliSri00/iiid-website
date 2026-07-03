// app/providers.js
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children, session }) {
  return (
    <SessionProvider 
      session={session} 
      refetchInterval={0} 
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
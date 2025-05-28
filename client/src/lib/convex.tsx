import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient("https://neat-goldfish-714.convex.cloud");

interface ConvexClientProviderProps {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export { convex };
// somewhere in a .d.ts file (e.g. socket.d.ts) or above in index.ts
import { Socket } from "socket.io";

declare module "socket.io" {
  interface Socket {
    decodedUser?: any;
  }
}

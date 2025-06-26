
import { Session } from 'express-session';
declare module 'express-session' {
  interface Session {
    youtubeState?: string;
    instagramState?: string;
    influencerId?: string;
    userId?: string;
    codeVerifier?: string;
    twitterState?: string;
  }
}

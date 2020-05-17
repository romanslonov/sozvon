export const SIGNAL_SERVER_URL = process.env.VUE_APP_HOST || 'http://localhost:3000';
export const PEER_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

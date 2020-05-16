export const SIGNAL_SERVER_URL = 'http://localhost:3000';
export const PEER_CONFIG = {
  iceTransportPolicy: 'all',
  reconnectTimer: 3000,
  iceServers: [
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

export const SIGNAL_SERVER_URL = process.env.VUE_APP_HOST || 'http://localhost:3000';
export const ICE_CONFIG = {
  iceTransportPolicy: 'all',
  reconnectTimer: 3000,
  iceServers: [
    { urls: 'stun:stun.sozvon.co:5349' },
    { urls: 'turn:turn.sozvon.co:5349', username: 'romans', credential: '1qaz2wsx' },
  ],
};

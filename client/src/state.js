import { messages } from './emitter';
import setupWebRTC from './connection';
import {
  getDevices, getUserMedia,
} from './stream';

// ROOM

const room = window.location.pathname.substr('/'.length);
console.log('Room =', room);

// STATE

export const state = {

  // ID of this room
  room,

  // Local users peer ID
  peerID: null,

  // IDs of all currently active WebRTC peers
  peers: [],

  // Video stream of the local user without sound
  stream: null,

  status: {},

  blur: false,
  bandwidth: false,

  muteVideo: false,
  muteAudio: false,

  deviceVideo: null,
  deviceAudio: null,

  devices: [],
};

function updateStream() {
  // eslint-disable-next-line no-param-reassign
  state.stream.getAudioTracks().forEach((t) => { t.enabled = !state.muteAudio; });
  // eslint-disable-next-line no-param-reassign
  state.stream.getVideoTracks().forEach((t) => { t.enabled = !state.muteVideo; });
}

messages.on('updateStream', updateStream);

// let blurLib;

// async function switchVideo() {
//   const audio = {
//     ...defaultAudioConstraints,
//   };

//   if (state.deviceAudio) {
//     audio.deviceId = state.deviceAudio;
//   }

//   let video = {
//     ...defaultVideoConstraints,
//   };

//   if (state.deviceVideo) {
//     video.deviceId = state.deviceVideo;
//   }

//   const constraints = {
//     audio,
//     video,
//   };

//   let stream;
//   const showsDesktop = state.deviceVideo === 'desktop';

//   if (showsDesktop) {
//     console.log('desktop');
//     video = {
//       video: {
//         cursor: 'always',
//       },
//     };
//     stream = await navigator.mediaDevices.getDisplayMedia(video);
//   } else {
//     stream = await navigator.mediaDevices.getUserMedia(constraints);
//   }
//   log('Stream', stream, constraints);
//   if (stream) {
//     let success = true;
//     const videoTracks = stream.getVideoTracks();
//     if (state.deviceVideo && videoTracks?.length <= 0) {
//       state.deviceVideo = null;
//       success = false;
//     }
//     const audioTracks = stream.getAudioTracks();
//     if (state.deviceAudio && audioTracks?.length <= 0) {
//       state.deviceAudio = null;
//       success = false;
//     }

//     if (!success) {
//       return await switchVideo();
//     }

//     log('blur what?', state.blur, blurLib);
//     if (state.blur && !showsDesktop) {
//       if (!blurLib) {
//         blurLib = await import(/* webpackChunkName: 'blur' */ './logic/blur');
//       }
//       stream = await blurLib.startBlurTransform(stream);
//       Array.from(stream.getAudioTracks()).forEach((t) => stream.removeTrack(t));
//       audioTracks.forEach((t) => stream.addTrack(t));
//     } else if (blurLib) {
//       log('stop blur');
//       blurLib.stopBlurTransform();
//     }

//     state.stream = stream;
//     updateStream();

//     messages.emit('setLocalStream', state.stream);
//   } else {
//     log('Stream not found');
//   }
// }

// messages.on('switchVideo', switchVideo);

export async function setup() {
  let rtc;
  try {
    rtc = await setupWebRTC(state);

    if (!rtc) {
      alert('Your browser does not support the required WebRTC technologies.');
      // location.assign('/ng/');
      return;
    }

    const stream = await getUserMedia();

    // Safari getDevices only works immediately after getUserMedia (bug)
    state.devices = await getDevices();

    state.stream = stream;
    updateStream();

    messages.emit('setLocalStream', state.stream);
  } catch (err) {
    console.error('Exception:', err);
  }

  // eslint-disable-next-line consistent-return
  return {
    cleanup() {
      if (rtc) rtc.cleanup();
    },
  };
}

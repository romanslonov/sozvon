export async function getDevices() {
  try {
    return navigator.mediaDevices.enumerateDevices();
  } catch (err) {
    console.warn('enumerateDevices err', err);
  }
  return [];
}

export const bandwidthVideoConstraints = {
  video: {
    width: { ideal: 320 },
    height: { ideal: 240 },
  },
  width: { ideal: 320 },
  height: { ideal: 240 },
};

export const defaultVideoConstraints = {
  frameRate: {
    min: 1,
    ideal: 15,
  },
};

export const defaultAudioConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};


export async function getUserMedia(constraints = {
  audio: {
    ...defaultAudioConstraints,
  },
  video: {
    ...defaultVideoConstraints,
    facingMode: 'user',
  },
}) {
  return navigator.mediaDevices.getUserMedia(constraints);
}

// CIS 3830 - Week 9: Learning the JavaScript Language
// Colton Reynolds
// Run with: node learning-js.js

// ---------- Object model ----------
class SoundClip {
  constructor(name, seconds, volume) {
    this.name = name;
    this.seconds = seconds;
    this.volume = volume;
    this.loaded = false;
  }

  describe() {
    return `${this.name} (${this.seconds}s, volume ${this.volume})`;
  }
}

class VoiceClip extends SoundClip {
  constructor(name, seconds, volume, speaker) {
    super(name, seconds, volume);
    this.speaker = speaker;
  }

  describe() {
    return `${super.describe()} - voice: ${this.speaker}`;
  }
}

// ---------- Arrays ----------
const clips = [
  new SoundClip('pellet', 0.2, 0.8),
  new SoundClip('ghost', 1.5, 0.6),
  new VoiceClip('intro', 4.0, 1.0, 'Colton'),
  new SoundClip('game-over', 2.5, 0.9),
];

// ---------- Asynchronous logic ----------
// Pretends to load a clip from disk, like fetch() would in the browser.
function loadClip(clip) {
  return new Promise((resolve) => {
    setTimeout(() => {
      clip.loaded = true;
      resolve(clip);
    }, clip.seconds * 100);
  });
}

async function loadAll(list) {
  const results = await Promise.all(list.map(loadClip));
  return results;
}

// ---------- Validation checks ----------
let passed = 0;
let failed = 0;

function check(label, condition) {
  if (condition) {
    passed++;
    console.log(`PASS - ${label}`);
  } else {
    failed++;
    console.log(`FAIL - ${label}`);
  }
}

async function main() {
  console.log('--- Clips ---');
  for (const clip of clips) {
    console.log(clip.describe());
  }

  // array tracking loop
  let totalSeconds = 0;
  for (let i = 0; i < clips.length; i++) {
    totalSeconds += clips[i].seconds;
  }

  const shortClips = clips.filter((c) => c.seconds < 2);
  const names = clips.map((c) => c.name);

  console.log('\n--- Loading ---');
  const loaded = await loadAll(clips);
  loaded.forEach((c) => console.log(`loaded ${c.name}`));

  console.log('\n--- Validation ---');
  check('array has 4 clips', clips.length === 4);
  check('loop total is 8.2 seconds', Math.abs(totalSeconds - 8.2) < 0.001);
  check('filter finds 2 short clips', shortClips.length === 2);
  check('map returns clip names', names.join(',') === 'pellet,ghost,intro,game-over');
  check('async load marks every clip loaded', loaded.every((c) => c.loaded));
  check('VoiceClip is a SoundClip', clips[2] instanceof SoundClip);
  check('VoiceClip overrides describe()', clips[2].describe().includes('voice: Colton'));

  console.log(`\n${passed} passed, ${failed} failed`);
}

main();

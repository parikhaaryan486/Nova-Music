class MusicQueue {
  constructor(player, guildId, client) {
    this.player = player;
    this.guildId = guildId;
    this.client = client;

    this.tracks = [];      // upcoming
    this.history = [];     // played

    this.currentTrack = null;
    this.playing = false;
    this.skipped = false;
    this.allowTrackLoop = true;
    this.stopping = false;

    this.loopMode = "off"; // off | track | queue
    this.timeout = null;
  }

  add(track) {
    this.tracks.push(track);

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  async play() {
    if (this.playing) return;

    let track;

    // 🔁 TRACK LOOP (only if NOT skipped)
    if (
      this.loopMode === "track" &&
      this.currentTrack &&
      !this.forceSkip
    ) {
      track = this.currentTrack;
    }
    // ▶️ NORMAL FLOW
    else {
      if (this.currentTrack) {
        this.history.push(this.currentTrack);
      }

      track = this.tracks.shift();

      // 🔁 QUEUE LOOP
      if (!track && this.loopMode === "queue") {
        this.tracks = [...this.history];
        this.history = [];
        track = this.tracks.shift();
      }

      this.currentTrack = track;
    }

    // ✅ NOW reset skip flag (after decision)
    this.forceSkip = false;

    // ❌ NOTHING LEFT
    if (!track) {
      this.startTimeout();
      return;
    }

    this.playing = true;

    await this.player.playTrack({
      track: { encoded: track.encoded }
    });
  }

  async handleTrackEnd(reason) {
    if (this.stopping) return;

    this.playing = false;

      // stop / destroy → do nothing
    if (reason === "stopped" && !this.skipped) return;

      // skip or natural end allowed
    const skipped = this.skipped;
    this.skipped = false;

      // mark whether currentTrack may be reused
    this.allowTrackLoop = !skipped;

    await this.play();
  }


  async skip() {
    await this.player.stopTrack();
  }

  async onTrackEnd(reason) {
    this.playing = false;

    // ❌ forced stop → do nothing
    if (reason === "stopped") {
      return;
    }

    // ✅ natural end
    await this.play();
  }

  stopAndDestroy() {
    this.stopping = true;

    this.tracks = [];
    this.loopMode = "off";
    this.currentTrack = null;

    try {
      this.player.destroy();
    } catch {}

    this.client.queues.delete(this.guildId);
  }

  setLoop(mode) {
    this.loopMode = mode;
    return true;
  }

  startTimeout() {
    this.timeout = setTimeout(() => {
      this.destroy();
    }, 30_000);
  }

  destroy() {
    try {
      this.player.destroy();
    } catch {}

    this.client.queues.delete(this.guildId);
  }
}

module.exports = MusicQueue;

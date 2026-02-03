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

    this.loopMode = "off"; // off | track | queue
    this.timeout = null;
    this.idleTimer = null;

    this.volume = 100; // default 100%
    this.autoplay = false;
  }

  add(track) {
    this.tracks.push(track);
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  startIdleTimer() {
    if (this.idleTimer) return;

    this.idleTimer = setTimeout(() => {
      // still idle?
      if (!this.playing && this.tracks.length === 0) {
        this.disconnect("idle");
      }
    }, 30_000); // 30 seconds
  }

  clearIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  async play() {
    
    if (this.playing) return;
    
    let track;
    
    await this.player.setFilters({
      volume: this.volume / 100
    });
    
    // 🔁 TRACK LOOP
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
      
      this.forceSkip = false;
      
      track = this.tracks.shift();
      
      // 🔁 QUEUE LOOP
      if (!track && this.loopMode === "queue") {
        this.tracks = [...this.history];
        this.history = [];
        track = this.tracks.shift();
      }
      
      this.currentTrack = track;
    }
    
    // ❌ NOTHING LEFT
    if (!track) {
      if (this.autoplay && this.history.length > 0) {
        return this.handleAutoplay(); // Trigger autoplay logic
      }
      this.startIdleTimer();
      return;
    }
    this.clearIdleTimer();
    this.playing = true;
    
    await this.player.playTrack({
      track: { encoded: track.encoded }
    });
  }

  async setVolume(volume) {
    if (!this.player) return false;

    this.volume = volume;

    try {
      await this.player.setFilters({
        volume: volume / 100
      });
      return true;
    } catch (e) {
      console.error("Volume filter error:", e);
      return false;
    }
  }

  async handleTrackEnd(reason) {
    this.playing = false;

    // STOP or DESTROY → do nothing
    if (reason === "stopped" && !this.skipped) {
      return;
    }

    // If skipped → temporarily disable track loop
    const wasSkipped = this.skipped;
    this.skipped = false;

    // If skip happened, ignore loop-track ONCE
    if (wasSkipped && this.loopMode === "track") {
      const oldLoop = this.loopMode;
      this.loopMode = "off";
      await this.play();
      this.loopMode = oldLoop;
      return;
    }

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

  async handleAutoplay() {
    // 1. Get the last track played from history
    const lastTrack = this.history[this.history.length - 1];
    if (!lastTrack) return this.startIdleTimer();

    // 2. Build a "Related" search query
    // We search for the artist + "similar songs" to avoid getting the same track title
    const search = `ytsearch:songs similar to ${lastTrack.info.author} ${lastTrack.info.title} mix`;

    const res = await this.client.shoukaku.getIdealNode().rest.resolve(search);

    if (!res.data || !res.data.length) {
        return this.startIdleTimer();
    }

    // 3. Filter out the current/last song so it doesn't play again immediately
    // We look at the first 10 results and pick one that isn't the same title
    const filteredResults = res.data.filter(t => 
        t.info.title.toLowerCase() !== lastTrack.info.title.toLowerCase()
    );

    // 4. If filtering left us with nothing, just take the 2nd result from the original search
    const nextTrack = filteredResults.length > 0 
        ? filteredResults[Math.floor(Math.random() * Math.min(filteredResults.length, 5))]
        : res.data[1]; 

    if (!nextTrack) return this.startIdleTimer();

    // 5. Set requester as "Autoplay"
    nextTrack.requester = {
        id: this.client.user.id,
        tag: "Autoplay Mode",
        avatar: this.client.user.displayAvatarURL()
    };

    this.add(nextTrack);
    this.playing = false; // Reset status to allow .play() to execute
    return this.play();
  }

  checkEmptyVoiceChannel() {
    try {
      const voiceChannel = this.client.guilds.cache
        .get(this.guildId)
        ?.channels.cache.get(this.player.connection.channelId);

      if (!voiceChannel) return;

      const nonBotMembers = voiceChannel.members.filter(
        member => !member.user.bot
      );

      if (nonBotMembers.size === 0) {
        // Start idle timer if not already started
        this.startIdleTimer();
      } else {
        // Someone joined, cancel idle timer
        this.clearIdleTimer();
      }
    } catch (err) {
      console.error("Error checking empty VC:", err);
    }
  }

  disconnect(reason = "manual") {
    try {
      this.player.stopTrack();
    } catch {}

    try {
      this.player.destroy();
    } catch {}

    try {
      this.client.shoukaku.leaveVoiceChannel(this.guildId);
    } catch {}

    this.client.queues.delete(this.guildId);
  }

  setLoop(mode) {
    this.loopMode = mode;
    return true;
  }

  startTimeout() {
    if (this.timeout) return;

    this.timeout = setTimeout(() => {
      this.disconnect("idle");
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

const { EmbedBuilder } = require("discord.js");

const COLORS = {
  SUCCESS: 0x57F287,
  ERROR: 0xED4245,
  INFO: 0x2F3136
};

module.exports = {
  create: (client, data) => {
    return new EmbedBuilder()
      .setColor(data.color || 0x2f3136)
      .setTitle(data.title || null)
      .setDescription(data.description || null)
  },

  success(description) {
    return new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setDescription(description);
  },

  error(description) {
    return new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription(description);
  },

  info(title, description) {
    return new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(title)
      .setDescription(description);
  },

  nowPlaying(track, volume, loopMode) {
    return new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle("🎶 Now Playing")
      .setDescription(
        `**${track.info.title}**\n\n` +
        `⏱ **Duration:** ${formatDuration(track.info.length)}\n` +
        `🔊 **Volume:** ${volume}%\n` +
        `🔁 **Loop:** ${loopMode.toUpperCase()}\n` +
        `👤 **Requested by:** ${track.requester?.tag || "Unknown"}`
      )
      .setThumbnail(track.info.artworkUrl || null);
  }
};

function formatDuration(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

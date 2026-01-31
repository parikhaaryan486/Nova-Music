const { EmbedBuilder } = require("discord.js");

function formatTime(ms) {
  if (!ms || ms === 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function progressBar(current, total, size = 10) {
  if (!total) return "▱".repeat(size);
  const progress = Math.round((current / total) * size);
  const empty = size - progress;
  return "▰".repeat(progress) + "▱".repeat(empty);
}

module.exports = {
  name: "nowplaying",
  aliases: ["np"],

  async execute(client, message) {
    const queue = client.queues.get(message.guild.id);

    if (!queue || !queue.currentTrack) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("❌ Nothing is playing right now.")]
      });
    }

    const track = queue.currentTrack;
    const position = queue.player.position || 0;
    const duration = track.info.length;

    const bar = progressBar(position, duration);
    const timeNow = formatTime(position);
    const timeTotal = formatTime(duration);

    // Dynamic Thumbnail Logic
    const DEFAULT_THUMB = "https://i.imgur.com/8qZ6FQm.png";
    const thumbnail = 
      track.info.artworkUrl || 
      track.info.thumbnail || 
      (track.info.uri?.includes("youtube") 
        ? `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg` 
        : DEFAULT_THUMB);

    const loopText =
      queue.loopMode === "track" ? "🔂 Track" : 
      queue.loopMode === "queue" ? "🔁 Queue" : "Off";

    const embed = new EmbedBuilder()
      .setColor(0x3aeb34)
      .setTitle("🎵 Now Playing")
      .setThumbnail(thumbnail) // Added thumbnail here
      .setDescription(`
**${track.info.title}**

${bar} \`${timeNow} / ${timeTotal}\`

👤 **Requested by:** <@${track.requester.id}>
🔊 **Volume:** ${queue.volume}%
🔁 **Loop:** ${loopText}
      `);

    return message.reply({ embeds: [embed] });
  }
};
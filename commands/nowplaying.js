const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "nowplaying",
  aliases: ["np"],
  description: "Show currently playing song",

  execute: async (client, message) => {
    const queue = client.queues.get(message.guild.id);
    if (!queue || !queue.currentTrack)
      return message.reply("❌ Nothing is playing.");

    const track = queue.currentTrack.info;
    const requester = queue.currentTrack.requester;

    const duration = msToTime(track.length);
    const position = msToTime(queue.player.position || 0);

    const embed = new EmbedBuilder()
      .setTitle("🎵 Now Playing")
      .setDescription(`**[${track.title}](${track.uri})**`)
      .addFields(
        { name: "⏱ Duration", value: `${position} / ${duration}`, inline: true },
        { name: "🔁 Loop", value: queue.loopMode, inline: true },
        { name: "📄 Queue", value: `${queue.tracks.length} songs`, inline: true },
        { name: "🙋 Requested by", value: requester?.tag || "Unknown", inline: false }
      )
      .setColor(0x2f3136);

    // 🎨 Thumbnail (if exists)
    if (track.artworkUrl) {
      embed.setThumbnail(track.artworkUrl);
    }

    if (requester?.avatar) {
      embed.setFooter({
        text: requester.tag,
        iconURL: requester.avatar
      });
    }

    message.reply({ embeds: [embed] });
  }
};

// helper
function msToTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    : `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

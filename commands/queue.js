// module.exports = {
//   name: "queue",
//   aliases: ["q"],
//   description: "Show current queue",
//   execute: async (client, message) => {
//     const queue = client.queues.get(message.guild.id);
//     if (!queue || queue.tracks.length === 0)
//       return message.reply("📭 Queue is empty.");

//     const list = queue.tracks
//       .map((t, i) => `${i + 1}. ${t.info.title}`)
//       .join("\n");

//     message.reply(`🎶 **Queue:**\n${list}`);
//   }
// };

const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "queue",
  aliases: ["q"],
  async execute(client, message) {
    const queue = client.queues.get(message.guild.id);

    if (!queue || (!queue.currentTrack && queue.tracks.length === 0)) {
      return message.reply("❌ Queue is empty.");
    }
    
    function formatDuration(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
      }

      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setTitle("🎶 Music Queue");

    // 🎵 Now playing
    const now = queue.currentTrack;
    const nowDuration = formatDuration(now.info.length);

    embed.addFields({
      name: "▶️ Now Playing",
      value:
        `**${now.info.title}**\n` +
        `⏱ ${nowDuration}\n` +
        `👤 ${now.requester?.tag || "Unknown"}`
    });
      
    // 📜 Upcoming
    if (queue.tracks.length > 0) {
      const upcoming = queue.tracks
      .slice(0, 10)
      .map((t, i) => {
        const duration = formatDuration(t.info.length);
        return `${i + 1}. ${t.info.title}  \`[${duration}]\``;
      })
      .join("\n");

      embed.addFields({
        name: "📜 Up Next",
        value: upcoming
      });
    }

    // 🔁 Loop info
    embed.setFooter({
      text: `Loop: ${queue.loopMode.toUpperCase()}`
    });


    message.channel.send({ embeds: [embed] });
  }
};

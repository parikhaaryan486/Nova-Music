const formatDuration = require("../utils/formatDuration");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function totalQueueDuration(queue) {
  let totalMs = 0;

  if (queue.currentTrack) totalMs += queue.currentTrack.info.length;
  totalMs += queue.tracks.reduce((acc, track) => acc + track.info.length, 0);

  return formatDuration(totalMs);
}

module.exports = {
  name: "queue",
  aliases: ["q"],
  async execute(client, message) {
    const queue = client.queues.get(message.guild.id);
    
    if (!queue || (!queue.currentTrack && queue.tracks.length === 0)) {
      return message.reply("❌ Queue is empty.");
    }
    
    const tracksPerPage = 10;
    const totalPages = Math.ceil(queue.tracks.length / tracksPerPage) || 1;
    let page = 1;
    
    function getPageEmbed(pageNum) {
      const start = (pageNum - 1) * tracksPerPage;
      const end = start + tracksPerPage;
      const tracksPage = queue.tracks.slice(start, end);
      
      const upcoming = tracksPage
      .map((t, i) => {
        const duration = formatDuration(t.info.length);
        return `${start + i + 1}. ${t.info.title} \`[${duration}]\``;
      })
      .join("\n") || "No more songs.";
      
      const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setTitle("🎶 Music Queue")
      .setDescription(`Total songs: ${queue.tracks.length + (queue.currentTrack ? 1 : 0)} • ⏱ ${totalQueueDuration(queue)}`)
      .setThumbnail(queue.currentTrack?.thumbnail || null) // <-- add thumbnail here
      .addFields(
        { name: "▶️ Now Playing", value: `**${queue.currentTrack.info.title}**\n⏱ ${formatDuration(queue.currentTrack.info.length)}\n👤 ${queue.currentTrack.requester?.tag || "Unknown"}` },
        { name: "📜 Up Next", value: upcoming }
      )
      .setFooter({ text: `Loop: ${queue.loopMode.toUpperCase()} • Page ${pageNum}/${totalPages}` });
      
      return embed;
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
    
    embed.setDescription(`Total songs: ${queue.tracks.length + (queue.currentTrack ? 1 : 0)} • ⏱ ${totalQueueDuration(queue)}`);
    
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
    
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("⬅ Previous")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 1),
      new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Next ➡")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === totalPages)
    );
    
    const queueMessage = await message.channel.send({ embeds: [getPageEmbed(page)], components: [row] });
    const collector = queueMessage.createMessageComponentCollector({ time: 120000 });
    
    collector.on("collect", async i => {
      if (i.user.id !== message.author.id) return i.reply({ content: "You cannot control this queue.", ephemeral: true });

      if (i.customId === "prev" && page > 1) page--;
      if (i.customId === "next" && page < totalPages) page++;

      await i.update({ embeds: [getPageEmbed(page)], components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("prev").setLabel("⬅ Previous").setStyle(ButtonStyle.Primary).setDisabled(page === 1),
          new ButtonBuilder().setCustomId("next").setLabel("Next ➡").setStyle(ButtonStyle.Primary).setDisabled(page === totalPages)
        )
      ]});
  });

  collector.on("end", () => {
    queueMessage.edit({ components: [] }).catch(() => {});
  });


    // message.channel.send({ embeds: [embed] });
  }
};

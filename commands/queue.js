module.exports = {
  name: "queue",
  description: "Show current queue",
  execute: async (client, message) => {
    const queue = client.queues.get(message.guild.id);
    if (!queue || queue.tracks.length === 0)
      return message.reply("📭 Queue is empty.");

    const list = queue.tracks
      .map((t, i) => `${i + 1}. ${t.info.title}`)
      .join("\n");

    message.reply(`🎶 **Queue:**\n${list}`);
  }
};

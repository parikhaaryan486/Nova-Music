module.exports = {
  name: "disconnect",
  aliases: ["dc"],
  execute: async (client, message) => {
    const queue = client.queues.get(message.guild.id);
    if (!queue) return message.reply("❌ Not connected.");

    queue.disconnect("manual");
    message.reply("👋 Disconnected from voice channel.");
  }
};

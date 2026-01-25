module.exports = {
  name: "loop",
  description: "Set loop mode: track, queue, off",
  execute: async (client, message, args) => {
    const queue = client.queues.get(message.guild.id);
    if (!queue) return message.reply("❌ Nothing is playing.");

    const mode = args[0]?.toLowerCase();
    if (!["off", "track", "queue"].includes(mode))
      return message.reply("❌ Usage: !loop <off|track|queue>");

    queue.setLoop(mode);
    message.reply(`🔁 Loop mode set to: **${mode}**`);
  }
};

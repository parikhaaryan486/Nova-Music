module.exports = {
  name: "skip",
  description: "Skip current track",
  execute: async (client, message) => {
    const queue = client.queues.get(message.guild.id);
    if (!queue) return message.reply("❌ Nothing is playing.");

    queue.skipped = true;
    await queue.player.stopTrack();
  
    message.reply("⏭ Skipped.");
  }
};

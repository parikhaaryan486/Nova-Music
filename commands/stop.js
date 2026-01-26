module.exports = {
  name: "stop",
  aliases: ["st"],
  description: "Stop music and leave VC",
  execute: async (client, message) => {
    const queue = client.queues.get(message.guild.id);
    if (!queue) return message.reply("❌ Nothing is playing.");

    queue.tracks = [];
    queue.history = [];
    queue.currentTrack = null;
    queue.loopMode = "off";
    queue.playing = false;

    queue.startTimeout();

    await queue.player.stopTrack();
    message.reply("⏹ Music stopped and left VC.");
  }
};

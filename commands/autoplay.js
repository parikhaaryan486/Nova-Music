module.exports = {
  name: "autoplay",
  description: "Toggle autoplay related songs",
  execute: async (client, message) => {
    const queue = client.queues.get(message.guild.id);
    if (!queue) return message.reply("❌ No music is playing.");

    queue.autoplay = !queue.autoplay;

    return message.reply({
      embeds: [{
        color: queue.autoplay ? 0x57F287 : 0xED4245,
        description: `📻 Autoplay is now **${queue.autoplay ? "Enabled" : "Disabled"}**.`
      }]
    });
  }
};
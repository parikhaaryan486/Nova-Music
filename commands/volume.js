const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "volume",
  aliases: ["vol"],
  description: "Set or show current music volume",

  async execute(client, message, args) {
    const queue = client.queues.get(message.guild.id);

    if (!queue || !queue.player) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("❌ Nothing is playing.")]
      });
    }

    // Function to create the status embed
    const createVolEmbed = () => {
      return new EmbedBuilder()
        .setColor(0x001eff)
        .setDescription(`🔊 Current volume: **${queue.volume}%**`);
    };

    // Control buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("vol_down")
        .setLabel("🔉")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("vol_up")
        .setLabel("🔊")
        .setStyle(ButtonStyle.Secondary)
    );

    // Initial check: if user provided a number, set it first
    if (args[0]) {
      const vol = parseInt(args[0]);
      if (!isNaN(vol) && vol >= 0 && vol <= 200) {
        await queue.setVolume(Math.min(vol, 200)); // Clamp to 100 for Lavalink stability
      }
    }

    const msg = await message.reply({
      embeds: [createVolEmbed()],
      components: [row]
    });

    // Collector to handle button clicks
    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 30000 // Buttons stay active for 30 seconds
    });

    collector.on("collect", async (interaction) => {
      let currentVol = queue.volume;

      if (interaction.customId === "vol_down") {
        currentVol = Math.max(0, currentVol - 10);
      } else if (interaction.customId === "vol_up") {
        currentVol = Math.min(100, currentVol + 10);
      }

      await queue.setVolume(currentVol);

      await interaction.update({
        embeds: [createVolEmbed()]
      });
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};
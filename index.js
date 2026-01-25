require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { Shoukaku, Connectors } = require("shoukaku");
const fs = require("fs");

// 1️⃣ Create the client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 2️⃣ Setup Shoukaku
const nodes = [
    {
        name: "lavalink.jirayu.net",
        url: "lavalink.jirayu.net:13592",
        auth: process.env.LAVALINK_PASSWORD
    }
];

client.shoukaku = new Shoukaku(
    new Connectors.DiscordJS(client),
    nodes
);

// 3️⃣ Initialize commands map
client.commands = new Map();
fs.readdirSync("C:/vs code/Discord music/Node Music/New Music Bot/commands").forEach(file => {
    const cmd = require(`C:/vs code/Discord music/Node Music/New Music Bot/commands/${file}`);
    client.commands.set(cmd.name, cmd);
});

// 4️⃣ Queue map
client.queues = new Map();

// 5️⃣ Event listeners
client.on("messageCreate", async (message) => {
    const prefix = "!";
    if (!message.guild || message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const cmd = client.commands.get(command);
    if (!cmd) return;

    try {
        await cmd.execute(client, message, args);
    } catch (err) {
        console.error(err);
        message.reply("❌ Something went wrong.");
    }
});

client.once("ready", () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.shoukaku.on("ready", (name) => console.log(`✅ Lavalink connected: ${name}`));
client.shoukaku.on("error", (name, error) => console.error(`❌ Lavalink error on ${name}`, error));

// 6️⃣ Login

client.login(process.env.TOKEN);

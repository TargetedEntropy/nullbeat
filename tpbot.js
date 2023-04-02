const config = require("./config.json");
const mineflayer = require("mineflayer");
const { listenerCount } = require("process");
var prefix = config.prefix;
const { pathfinder, Movements } = require("mineflayer-pathfinder");
const { GoalXZ } = require("mineflayer-pathfinder").goals;
const mcData = require("minecraft-data")("1.12.2");
const colors = require("colors");
var tpsPlugin = require("mineflayer-tps")(mineflayer);
const fetch = require("node-fetch");
const roundToHundredth = (value) => {
  return Number(value.toFixed(2));
};

// Access lists
let tp_whitelist = [""]; // TP Access

// Discord
const Discord = require("discord.js");
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ],
});
client.commands = new Discord.Collection();
client.on("ready", () => {
  console.log("Bot online!".blue);
  client.user.setActivity(`0b0t.org `, { type: "PLAYING" });
});
client.login(config.token);

// Mineflayer setttings
let options = {
  host: `116.203.85.245`, // 0b0t.org
  port: 25565,
  username: `${config.email}`,
  auth: "microsoft",
  version: `1.12.2`,
};

const bot = mineflayer.createBot(options);
bindEvents(bot);
function bindEvents(bot) {
  //=================
  // Console Login
  //=================
  bot.once("login", () => {
    setTimeout(() => {
      console.log(`──────────────────────────────────────────`.blue);
    }, 0);
    setTimeout(() => {
      console.log(`Logged in as: `.green + `${bot.username}`.yellow);
    }, 1);
    setTimeout(() => {
      console.log(`Server: `.green + `${options.host}`.yellow);
    }, 2);
    setTimeout(() => {
      console.log(`Port: `.green + `${options.port}`.yellow);
    }, 3);
    setTimeout(() => {
      console.log(`──────────────────────────────────────────`.blue);
    }, 4);
    client.channels.cache.get(config.bridgeID).send(`${bot.username} Online!`);
  });

  //=================
  // Auto Relog
  //=================
  bot.on("error", function (err) {
    console.log("Error attempting to reconnect: " + err.errno + ".");
    if (err.code == undefined) {
      console.log(
        "Invalid credentials OR bot needs to wait because it relogged too quickly."
      );
      console.log("Will retry to connect in 30 seconds. ");
      setTimeout(relog, 30000);
    }
  });
  bot.on("kicked", function (reason) {
    console.log(`Bot kicked for ${reason}`.red);
    setTimeout(relog, 30000);
  });
  bot.on("error", (err) => {
    console.error(err);
  });
  function relog() {
    client.destroy();
    console.log("Attempting to reconnect...");
    bot = mineflayer.createBot(options);
    bindEvents(bot);
    client.login(config.token);
  }

  //================
  // Chat Patterns
  //================
  // bot.chatAddPattern(
  //   /^Teleported to ([a-zA-Z0-9_]{3,16})!$/,
  //   "tpaccepted",
  //   "tpa accepted"
  // );
  bot.chatAddPattern(
    /^([a-zA-Z0-9_]{3,16}) wants to teleport to you\.$/,
    "tpRequest",
    "tpa request"
  );

  //=======================
  // Tpa to bot
  //=======================
  bot.on("tpRequest", function (username) {
    console.log("TP Request");
    if (tp_whitelist.includes(username)) {
      client.channels.cache
        .get(config.bridgeID)
        .send(`${bot.username} is accepting TP Request from ${username}!`);
      return (
        bot.chat(`/msg ${username} Auto Accepting..`),
        bot.chat(`/tpy ${username}`)
      );
    }
  });

  //=======================
  // UUID Function
  //=======================
  function uuid(username, callback) {
    const dash = require("add-dashes-to-uuid");
    var MojangAPI = require("mojang-api");
    var date = new Date();
    MojangAPI.uuidAt(username, date, function (err, res) {
      if (err) console.log(err);
      else var dashuuid = dash(res.id);
      callback(dashuuid);
    });
  }

  //=====================
  // Log function
  //=====================
  function log(msg, color, user) {
    if (bot.players[user].uuid != undefined) {
      client.channels.cache.get(config.logsID).send(`Log: ${user} > ${msg}`);
    }
  }

  //==================
  // Whisper Function
  //==================
  bot.on("whisper", (username, message) => {
    if (!bot.players[username]) return;
    client.channels.cache
      .get(config.bridgeID)
      .send(`${username} w> ${message}`);

      if (message == "testies") {
        bot.chat(`/w ${username} hello`)
      }

      if (tp_whitelist.includes(username)) {
        if (message == "kill") {
            bot.chat(`/w ${username} Terminating Bot`)
            return bot.end();
        }
      }
  });


  //=================
  // Tpa Event
  //=================
  let p = "";
  bot.on("goal_reached", () => {
    bot.chat(`/tpa ${p}`);
    bot.pathfinder.setGoal(null);
  });

}

const config = require("./config.json");
const mineflayer = require("mineflayer");
const { listenerCount } = require("process");
var prefix = config.prefix;
const { pathfinder, Movements } = require("mineflayer-pathfinder");
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } =
  require("mineflayer-pathfinder").goals;
const mcData = require("minecraft-data")("1.12.2");
const colors = require("colors");
// const prettyMilliseconds = require("pretty-ms");
var tpsPlugin = require("mineflayer-tps")(mineflayer);
const fetch = require("node-fetch");
const roundToHundredth = (value) => {
  return Number(value.toFixed(2));
};
const fs = require("fs");

// Discord
const Discord = require("discord.js");
const {
  Client,
  Events,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js");

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
  console.log("Bridge online!".blue);
  client.user.setActivity(`0b0t.org `, { type: "PLAYING" });
});
client.login(config.token);

let options = {
  host: `116.203.85.245`,
  // host: `10.0.0.39`,
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
    client.channels.cache.get(config.bridgeID).send("Bot Online!");
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

  bot.chatAddPattern(
    /^Teleported to ([a-zA-Z0-9_]{3,16})!$/,
    "tpaccepted",
    "tpa accepted"
  );
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
        .send(`Accepting TP Request from ${username}!`);
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
  });

  //==========================
  // Chat Commands
  //==========================
  bot.on("chat", (username, message) => {
    const args = message.split(" ");
    const cmd = message.split(" ")[0];
    //=================
    // Help Command
    //=================
    // if (cmd === `${prefix}help`) {
    //       bot.chat(`: ${username}, https://mrfast-js.github.io/`)
    //       log(`${prefix}help was used.`, 0xFFA500, username)
    //   }
    //=================
    // Kits Command
    //=================
    // if (cmd === `${prefix}kits`) {
    //   bot.chat(`: ${username}, Current kits are: wtf, redstone, arik, teeleel, gspot, fix, gnome.`)
    //   log(`${prefix}kits was used.`, 0xFFA500, username)
    // }
    //=================
    // Kill Command
    //=================
    // if (cmd === `${prefix}kill`) {
    //   if (array.includes(username)) {
    //       bot.chat(`/kill`)
    //       log(`${prefix}kill was used.`, 0xFF4500, username)
    //   }}

    //=================
    // Ping Command
    //=================s
    // if (cmd === `${prefix}ping`) {
    //   if (!args[1]) {
    //     if (!bot.players[username]) return;
    //   if (bot.players[username].ping == '0') return bot.chat(': '+username +`'s ping hasnt been calculated by the server yet.`)
    //   bot.chat(`: ${username}'s ping is ${bot.players[username].ping}ms`)
    //   log(`${prefix}ping was used.`, 0xFFA500, username)
    //   } else {
    //     if (!bot.players[args[1]]) return bot.chat(': Player not found!')
    //     if (bot.players[args[1]].ping == '0') return bot.chat(': '+args[1] +`'s ping hasnt been calculated by the server yet.`)
    //     bot.chat(`: ${args[1]}'s ping is ${bot.players[args[1]].ping}ms`)
    //     log(`${prefix}ping was used on ${args[1]}.`, 0xFFA500, username)
    //   }
    // }
  });
  //============================
  // Kit Grabber
  //============================
  bot.loadPlugin(pathfinder);
  let array = ["robbyfox", "Toomani"]; // Kit Access
  let tp_whitelist = ["robbyfox", "Toomani"]; // TP Access
  const defaultMove = new Movements(bot, mcData);
  bot.on("chat", function (username, message) {
    const cmd = message.split(" ")[0];
    const args = message.split(" ");
    if (cmd === `${prefix}end`) {
      if (array.includes(username)) {
        return bot.end();
      } else return;
    }
    //=================
    // Kit WTF
    //=================
    if (message.startsWith(`${prefix}kit wtf`)) {
      console.log("recognized kit wtf cmd");
      if (array.includes(username)) {
        bot.chat(": Grabbing wtf kit...");
        console.log("array included username");
        const x = parseFloat(`420`, 10);
        const z = parseFloat(`69`, 10);
        p = username;
        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(new GoalXZ(x, z));
        console.log("Navigating");
      }
    }

    //=================
    // Kit gnome
    //=================
    // if (message.startsWith(`${prefix}kit gnome`)){
    //     console.log("recognized kit gnome cmd")
    //    if (array.includes(username)) {
    //     bot.chat(': Grabbing gnome kit...')
    //        console.log("array included username")
    //        const x = parseFloat(`420`, 10)
    //        const z = parseFloat(`69`, 10)
    //        p = username
    //        bot.pathfinder.setMovements(defaultMove)
    //        bot.pathfinder.setGoal(new GoalXZ(x, z))
    //        console.log("Navigating")
    //       }
    //     }
  });

  //=================
  // Tpa Event
  //=================
  let p = "";
  bot.on("goal_reached", () => {
    bot.chat(`/tpa ${p}`);
    bot.pathfinder.setGoal(null);
  });

  //=================
  // Kill on tp
  //=================
  let kitstaken = 0;
  bot.on("tpaccepted", function (username) {
    setTimeout(() => {
      bot.chat(`/kill`);
      console.log("bot /killed");
      client.channels.cache
        .get(config.logsID)
        .send(`[Kit] Gave a kit to ${username}.`);
    }, 500);
  });

  //==============================
  // Discord Commands
  //==============================
  // bot.loadPlugin(tpsPlugin)
  // client.on("message", msg => {
  //  if (msg.content.startsWith('!info')) { /*Info Command*/
  //       let embed = new Discord.MessageEmbed()
  //       .addField(`Bot Info`,`Username: ${bot.username}\nUptime: ${prettyMilliseconds(client.uptime)}\nKits Taken: ${kitstaken}`, true)
  //       .setTimestamp()
  //       .addField('Server Info',`IP: ${options.host}\nPort: ${options.port}\nPing: ${bot.players[bot.username].ping}\nTPS: ${bot.getTps()}`, true)
  //       msg.channel.send(embed)
  //     }
  // })
}

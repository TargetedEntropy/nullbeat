const config = require("./config.json");
const mineflayer = require("mineflayer");
const colors = require("colors");

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
  client.user.setActivity("0b0t.org ", {
    type: "PLAYING",
  });
});
client.login(config.token);

// Mineflayer setttings
const options = {
  // host: "6b6t.org", // 0b0t.org
  port: 25565,
  host: "10.0.0.39",
  username: `${config.email}`,
  auth: "microsoft",
  version: "1.19.2",
};

const bot = mineflayer.createBot(options);
const mcData = require("minecraft-data")(bot.version);
const nbt = require('prismarine-nbt')
bindEvents(bot);
let chest, itemsToDeposit;

function bindEvents(bot) {


  //= ================
  // Console Login
  //= ================
  bot.once("login", () => {
    setTimeout(() => {
      console.log("──────────────────────────────────────────".blue);
    }, 0);
    setTimeout(() => {
      console.log("Logged in as: ".green + `${bot.username}`.yellow);
    }, 1);
    setTimeout(() => {
      console.log("Server: ".green + `${options.host}`.yellow);
    }, 2);
    setTimeout(() => {
      console.log("Port: ".green + `${options.port}`.yellow);
    }, 3);
    setTimeout(() => {
      console.log("──────────────────────────────────────────".blue);
    }, 4);
    client.channels.cache.get(config.channelID).send(`${bot.username} Online!`);
  });

  //= ================
  // Auto Relog
  //= ================
  bot.on("error", function (err) {
    console.log("Error attempting to reconnect: " + err.errno + ".");
    if (err.code === undefined) {
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

  bot.on("death", function () {
    console.log(`I Died.`.red);
    setTimeout(relog, 30000);
  });

  bot.on("error", (err) => {
    console.error(err);
  });

  bot.on("entitySpawn", (entity) => {
    if (entity.type === "player") {
      console.log(`Player Spawned ${entity.username}`.red);
      client.channels.cache
        .get(config.channelID)
        .send(`Player Spawned ${entity.username}`);
    }
  });

  function relog() {
    client.destroy();
    console.log("Attempting to reconnect...");
    bot = mineflayer.createBot(options);
    bindEvents(bot);
    client.login(config.token);
  }

    bot.on("spawn", () => {
    setTimeout(() => {
      openEChest();
    }, 1000);
  });

  async function publishEchest() {
    // this uploads the contents of the echest

    items = openEChest();
    



  }

  async function openEChest() {
    const chestToOpen = bot.findBlock({
      matching: ["ender_chest"].map((name) => mcData.blocksByName[name].id),
      maxDistance: 3,
    });

    chest = await bot.openChest(chestToOpen);
    items = chest.containerItems();
    items.forEach(item => {
      console.log("--------------------------");
      console.log(item);
      console.log("------");
      if (item.nbt !== null && item.name.includes('shulker_box')) {
        const shulker_name = JSON.parse(nbt.simplify(item.nbt.value.display).Name).text;
        console.log(`ShulkerName: ${shulker_name}`);
        console.log("------");
        console.log(nbt.simplify(item.nbt.value.BlockEntityTag).Items);
        console.log("--------------------------");
        var obj = new Object();
        obj.item_name = shulker_name;
        obj.item_contents  = nbt.simplify(item.nbt.value.BlockEntityTag).Items;
        var jsonString= JSON.stringify(obj);
        console.log(jsonString);
      }

   });
    return items;
    
  }

  //= ======================
  // depositItems Function
  //= ======================
      // itemsToDeposit = bot.inventory.items();
    //      depositItems(itemsToDeposit);
  async function depositItems(itemsToDeposit) {
    if (itemsToDeposit.length === 0) {
      chest.close();
      return;
    }

    const itemToDeposit = itemsToDeposit.shift();

    console.log(itemToDeposit.name);
    console.log(itemToDeposit.type);
    console.log(itemToDeposit.count);

    await chest.deposit(itemToDeposit.type, null, itemToDeposit.count);

    depositItems();
  }

  //= ======================
  // UUID Function
  //= ======================
  async function withdrawItem(name, amount) {
    const item = itemByName(chest.containerItems(), name);
    if (item) {
      try {
        await chest.withdraw(item.type, null, amount);
        bot.chat(`withdrew ${amount} ${item.name}`);
      } catch (err) {
        bot.chat(`unable to withdraw ${amount} ${item.name}`);
      }
    } else {
      bot.chat(`unknown item ${name}`);
    }
  }

  //= ======================
  // UUID Function
  //= ======================
  async function depositItem(name, amount) {
    const item = itemByName(chest.items(), name);
    if (item) {
      try {
        await chest.deposit(item.type, null, amount);
        bot.chat(`deposited ${amount} ${item.name}`);
      } catch (err) {
        bot.chat(`unable to deposit ${amount} ${item.name}`);
      }
    } else {
      bot.chat(`unknown item ${name}`);
    }
  }

  //= ======================
  // UUID Function
  //= ======================
  function uuid(username, callback) {
    const dash = require("add-dashes-to-uuid");
    const MojangAPI = require("mojang-api");
    const date = new Date();
    MojangAPI.uuidAt(username, date, function (err, res) {
      if (err) console.log(`err: ${err}`);
      else var dashuuid = dash(res.id);
      callback(dashuuid);
    });
  }

  //= ====================
  // Log function
  //= ====================
  function log(msg, color, user) {
    if (bot.players[user].uuid !== undefined) {
      console.log(`${msg}`);
      client.channels.cache.get(config.logsID).send(`Log: ${user} > ${msg}`);
    }
  }

  //= ===============
  // Chat Patterns
  //= ===============
  bot.chatAddPattern(
    /^([a-zA-Z0-9_]{3,16}) wants to teleport to you\.$/,
    "tpRequest",
    "tpa request"
  );

  //= ======================
  // Tpa to bot
  //= ======================
  bot.on("tpRequest", function (username) {
    console.log(`TP Request from ${username}`);
    uuid(bot.username, (id) => {
      if (config.whitelist_uuid.includes(id)) {
        client.channels.cache
          .get(config.channelID)
          .send(`${bot.username} is accepting TP Request from ${username}!`);
        console.log(`accepting TP Request from ${username}!`);
        return (
          bot.chat(`/msg ${username} Auto Accepting..`),
          bot.chat(`/tpy ${username}`)
        );
      }
    });
  });

  //= =================
  // Stalker Function
  //= =================
  bot.on("entitySpawn", (entity) => {
    if (bot.username === entity.username) return;
    if (entity.type === "player") {
      uuid(bot.username, (id) => {
        if (!config.whitelist_uuid.includes(id)) {
          log(`ALARM: ${entity.username} -> ${entity.position}`);
        }
      });
    }
  });

  //= =================
  // Whisper Function
  //= =================
  bot.on("whisper", (username, message) => {
    if (!bot.players[username]) return;

    // Log
    console.log(`${username} w> ${message}`);
    client.channels.cache
      .get(config.channelID)
      .send(`${username} w> ${message}`);

    // Verify
    uuid(bot.username, (id) => {
      if (config.whitelist_uuid.includes(id)) {
        if (message === "kill") {
          bot.chat(`/w ${username} Terminating Bot`);
          return bot.end();
        }

        if (message === "tpa") {
          client.channels.cache
            .get(config.channelID)
            .send(`Sent TPA request to ${username}`);
          bot.chat(`/tpa ${username}`);
        }

        if (message === "get_echest") {
          console.log(`${username} get_echest`);
          setTimeout(() => {
            publishEchest();
          }, 1000);
        }
      }
    });
  });
}

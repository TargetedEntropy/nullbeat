const config = require("./config.json");
const mineflayer = require("mineflayer");
const { listenerCount } = require("process");
const { pathfinder, Movements } = require("mineflayer-pathfinder");
// const { GoalXZ } = require("mineflayer-pathfinder").goals;
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } =
  require("mineflayer-pathfinder").goals;
// const mcData = require("minecraft-data")("1.12.2");
const colors = require("colors");
var tpsPlugin = require("mineflayer-tps")(mineflayer);
const { performance } = require("perf_hooks");
// const fetch = require("node-fetch");
const roundToHundredth = (value) => {
  return Number(value.toFixed(2));
};

// Mineflayer setttings
let options = {
  host: `116.203.85.245`, // 0b0t.org
  //host: `9b9t.org`, // 9b9t.org

  port: 25565,
  username: `${config.email}`,
  auth: "microsoft",
  version: `1.12.2`,
};
const streamServer = ""; // see https://stream.twitch.tv/ingests for list, choose the closest to you
const streamKey = ""; // your streaming key

const bot = mineflayer.createBot(options);
bot.loadPlugin(pathfinder);
const { mineflayer: mineflayerViewer } = require("prismarine-viewer");
const { headless } = require('prismarine-viewer')
// const mineflayerViewer = require('prismarine-viewer').headless
bot.once("spawn", () => {
  // mineflayerViewer(bot, { port: 3007, firstPerson: true }); // port is the web server port, if first person is false, you get a bird's-eye view
  mineflayerViewer(bot, { port: 3008, firstPerson: false }); // port is the web server port, if first person is false, you get a bird's-eye view
  headless(bot, {
    output: `rtmp://jfk.contribute.live-video.net/app/live_171748551_9940v2iAT9ZIFuEns9DWzsVaKqjuAs`,
    width: 1280,
    height: 720,
    logFFMPEG: true,
  });

  bot.on("path_update", (r) => {
    const path = [bot.entity.position.offset(0, 0.5, 0)];
    for (const node of r.path) {
      path.push({ x: node.x, y: node.y + 0.5, z: node.z });
    }
    bot.viewer.drawLine("path", path, 0xff00ff);
  });
});

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
    /^([a-zA-Z0-9_]{3,16}) wants to teleport to you\.$/,
    "tpRequest",
    "tpa request"
  );

  //=======================
  // Tpa to bot
  //=======================
  bot.on("tpRequest", function (username) {
    console.log("TP Request");
    // if (config.whitelist.includes(username)) {
    return (
      // bot.chat(`/msg ${username} Auto Accepting..`),
      bot.chat(`/tpy ${username}`)
    );
    // }
  });

  //==================
  // Whisper Function
  //==================
  bot.on("whisper", (username, message) => {
    if (!bot.players[username]) return;
    if (config.whitelist.includes(username)) {
      if (message == "tpa") {
        bot.chat(`/tpa ${username}`);
      }
      if (message == "kill") {
        bot.chat(`/kill`);
        console.log("Killed Myself");
      }
      if (message == "stop") {
        bot.pathfinder.stop();
        console.log("Stopped Pathfinding");
      }

      if (message == "portal") {
        const ids = [bot.registry.blocksByName["portal"].id];

        const block = bot.findBlock({
          matching: ids,
          maxDistance: 128,
          count: 1,
        });

        const mcData = require("minecraft-data")(bot.version);
        const defaultMove = new Movements(bot, mcData);

        const p = block.position.offset(0, -5, 0);
        defaultMove.scafoldingBlocks = [];
        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(new GoalBlock(p.x, p.y, p.z));
      }
    }
  });

  //==================
  // Follow Players
  //==================
  let friend_holder;
  bot.on("move", () => {
    bot.pathfinder.searchRadius = 6;
    let friend = bot.nearestEntity(({ type }) => type === "player");

    if (friend) {
      if (friend.name.toLowerCase() != "player") return;

      bot.lookAt(friend.position.offset(0, friend.height, 0));
      friend_holder = friend;
    }
  });

  var walking = false;

  bot.on("entityMoved", (entity) => {
    bot.waitForChunksToLoad();
    if (entity.name.toLowerCase() != "player") return;

    if (entity != friend_holder) return;
    walking = !walking;

    const mcData = require("minecraft-data")(bot.version);
    const defaultMove = new Movements(bot, mcData);

    const p = friend_holder.position.offset(0, 1, 0);
    defaultMove.scafoldingBlocks = [];
    bot.pathfinder.setMovements(defaultMove);
    bot.pathfinder.setGoal(new GoalBlock(p.x, p.y, p.z));
  });
}

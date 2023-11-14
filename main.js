const config = require("./config.json");
const mineflayer = require("mineflayer");
const colors = require("colors");
const { pathfinder, Movements } = require("mineflayer-pathfinder");
const { GoalXZ } = require("mineflayer-pathfinder").goals;

const axios = require("axios");

// Mineflayer setttings
const options = {
  host: `${config.server}`,
  port: 25565,
  username: `${config.email}`,
  auth: "microsoft",
  version: `${config.server_version}`,
};

const bot = mineflayer.createBot(options);
const mcData = require("minecraft-data")(bot.version);
const nbt = require("prismarine-nbt");
bindEvents(bot);
let chest, temp_nbt;

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

  function relog() {
    console.log("Attempting to reconnect...");
    bot = mineflayer.createBot(options);
    bindEvents(bot);
  }
  bot.loadPlugin(pathfinder);
  const defaultMove = new Movements(bot, mcData);

  var func = function (i) {
    return function () {
      if (i >= 75) return;

      if (bot.game.dimension == "overworld") {
        console.log("Bot is ready!");

        getJob();
      } else {
        setTimeout(func(++i), 500);
      }
    };
  };

  bot.on("spawn", () => {
    setTimeout(func(0), 500);
  });

  async function processJobs(jsonBody) {
    console.log(`Json: ${jsonBody}`);
    for (const job of jsonBody) {
      switch (job.job_type) {
        case "withdraw":
          // Execute the function for "withdraw" job type
          console.log("Doing Withdraw");
          break;

        case "deposit":
          // Execute the function for "deposit" job type
          console.log("Doing depoist");
          break;

        case "publish":
          // Execute the function for "deposit" job type
          console.log("Publishing Echest");
          publishEchest();
          break;

        // case "exit":
        //   // Execute the function for "deposit" job type
        //   console.log("Bot Exiting");
        //   bot.quit();
        //   break;

        default:
          // Handle unknown job types
          console.error(`Unknown job_type: ${job.job_type}`);
          break;
      }
    }
  }

  async function getJob() {
    console.log("OH SHIT IM GETTINGJOBS");
    jobs = await fetchAndProcessJobs("http://10.0.0.39:8000/job");
  }
  function fetchAndProcessJobs(endpoint) {
    httpGet(endpoint)
      .then((jsonBody) => {
        processJobs(jsonBody);
      })
      .catch((error) => {
        console.error("Error fetching and processing JSON:", error);
      });
  }
  function httpGet(endpoint) {
    return fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // You can adjust the content type as needed
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  }

  async function httpPost(endpoint, content) {
    return axios
      .post(endpoint, content, {
        headers: {
          "Content-Type": "application/json", // You can adjust the content type as needed
        },
      })
      .then((response) => {
        return response.data;
      });
  }

  escape = function (str) {
    return str
      .replace(/[\\]/g, "\\\\")
      .replace(/[\"]/g, '\\"')
      .replace(/[\/]/g, "\\/")
      .replace(/[\b]/g, "\\b")
      .replace(/[\f]/g, "\\f")
      .replace(/[\n]/g, "\\n")
      .replace(/[\r]/g, "\\r")
      .replace(/[\t]/g, "\\t");
  };

  async function publishEchest() {
    const chestToOpen = bot.findBlock({
      matching: ["ender_chest"].map((name) => mcData.blocksByName[name].id),
      maxDistance: 3,
    });
    // await chestToOpen.GoalXZ();
    console.log(`Chest: ${chestToOpen}`);

    chest = await bot.openChest(chestToOpen);
    items = chest.containerItems();
    items.forEach((item) => {
      console.log("--------------------------");
      console.log(item);
      console.log("------");
      if (item.nbt !== null && item.name.includes("shulker_box")) {
        const shulker_name = JSON.parse(
          JSON.stringify(item.nbt.value.display.value.Name.value)
        );
        console.log(`ShulkerName: ${shulker_name}`);
        // console.log("------");
        // console.log(JSON.stringify(nbt.simplify(item.nbt)));
        // console.log("------");
        // console.log(JSON.stringify(item.nbt));
        console.log("--------------------------");
        console.log(`Stuff: ${item.nbt.value.display.value.Name.value}`);
        temp_nbt = item.nbt;
        var obj = new Object();
        obj.item_name = shulker_name;
        obj.item_contents = nbt.simplify(item.nbt.value.BlockEntityTag).Items;
        obj.character_name = bot.username;
        obj.nbt_data = JSON.stringify(item.nbt);
        var jsonString = JSON.stringify(obj);
        console.log(jsonString);

        const endpoint = "http://10.0.0.39:8000/item"; // Replace with your API endpoint
        // const data = { item_name: 'value1', key2: 'value2' }; // Replace with your data

        setTimeout(() => {
          httpPost(endpoint, jsonString)
            .then((responseData) => {
              console.log("Response data:", responseData);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        }, 1000);
      }
    });
    bot.quit();
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
  // withdrawItem Function
  //= ======================
  async function withdrawItem(name, amount, nbt) {
    const item = itemByName(chest.containerItems(), name);
    if (item) {
      try {
        await chest.withdraw(item.type, null, amount, nbt);
        console.log(`withdrew ${amount} ${name}`);
      } catch (err) {
        console.log(`unable to withdraw ${amount} ${name}`);
      }
    } else {
      console.log(`unknown item ${name}`);
    }
  }

  function itemByName(items, name) {
    let item;
    let i;
    for (i = 0; i < items.length; ++i) {
      item = items[i];
      if (item && item.name === name) return item;
    }
    return null;
  }

  //= ======================
  // depositItem Function
  //= ======================
  async function depositItem(name, amount) {
    const item = itemByName(chest.items(), name);
    if (item) {
      try {
        await chest.deposit(item.type, null, amount);
        console.log(`deposited ${amount} ${item.name}`);
      } catch (err) {
        console.log(`unable to deposit ${amount} ${item.name}`);
      }
    } else {
      console.log(`unknown item ${name}`);
    }
  }

  async function depositInventory(items = bot.inventory.items()) {
    if (!items) {
      return false;
    }

    const chestToOpen = bot.findBlock({
      matching: ["ender_chest"].map((name) => mcData.blocksByName[name].id),
      maxDistance: 3,
    });

    chest = await bot.openChest(chestToOpen);
    chest_items = chest.containerItems();

    items.forEach((item) => {
      depositItem(item.name, item.count);
    });
  }

  //= ====================
  // Log function
  //= ====================
  function log(msg, color, user) {
    console.log(`${msg}`);
  }

  //= =================
  // Whisper Function
  //= =================
  bot.on("whisper", (username, message) => {
    if (!bot.players[username]) return;

    // Log
    console.log(`${username} w> ${message}`);

    // Verify
    if (username == "robbyfox") {
      if (message === "get_echest") {
        console.log(`${username} get_echest`);
        setTimeout(() => {
          publishEchest();
        }, 1000);
      }

      if (message === "pop") {
        console.log(`${username} pop`);
        setTimeout(() => {
          getItem();
        }, 1000);
      }
      if (message === "drop") {
        console.log(`${username} pop`);
        setTimeout(() => {
          depositInventory();
        }, 1000);
      }
    }
  });

  async function getItem() {
    const chestToOpen = bot.findBlock({
      matching: ["ender_chest"].map((name) => mcData.blocksByName[name].id),
      maxDistance: 3,
    });

    chest = await bot.openChest(chestToOpen);
    items = chest.containerItems();

    withdrawItem("light_gray_shulker_box", 1, temp_nbt);

    return items;
  }
}

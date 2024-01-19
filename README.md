# nullbeat

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Description

Nullbeat is a Minecrat bot using the Mineflayer library.  This bot is intended to be run for multiple accounts and act as storage butlers.  The bot will use the [nullbeat-api](https://github.com/TargetedEntropy/nullbeat-api) to log their inventory/chest contents, retrieve jobs that will deposit items or fetch them for a user.

There is also a web front-end component, [nullbeat-site](https://github.com/TargetedEntropy/nullbeat-site).  This allows the owner to see all items across all characters, where requests for those items or deposits can be made.

This bot also supports and leverages Discord integration.  A bot token must be generated and that process is out of the scope of this readme.  Please generate a token at the [Discord Developer Portal](https://discord.com/developers/applications)

## Getting Started

### Prerequisites

This bot depends on the Nullbeat API, the storage and guidance for the bot.

- [nullbeat-api](https://github.com/TargetedEntropy/nullbeat-api)

### Installation

1. Clone the nullbeat-api repository:

    ```bash
    git clone https://github.com/TargetedEntropy/nullbeat.git
    cd nullbeat
    ```

2. Configure your database backend. Tables are auto-generated.
    ```
    cp config.sample.json config.json
    vi config.json
    ```
    The values that must be set are:
      * email - This is the Microsoft Account email used for the Minecraft Account.
      * server - The Minecraft Server
      * server_version - The Minecraft Server Version
      * token - The Bot Discord Token
      * channelID - The Discord Channel for reporting
      * whitelist_uuid - The Owners' Minecraft account UUID. 
         * This can be found at [https://mcuuid.net/](https://mcuuid.net/)

3. Install the dependencies
    ```
    npm install
    ```

4. Start the bot
   ```
   node main.js
   ```
5. Invite the bot to your Discord

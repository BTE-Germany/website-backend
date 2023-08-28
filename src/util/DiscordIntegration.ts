/*
 * DiscordIntegration.ts
 *
 * Copyright (c) 2022-2023 BuildTheEarth Germany e.V.
 * https://bte-germany.de
 * This project is released under the MIT license.
 */

import {Client, Intents, MessageEmbed} from "discord.js";
import Core from "../Core.js";

class DiscordIntegration {
    private core: Core;
    private client: Client;

    constructor(core: Core) {
        this.core = core;
        this.setup();
    }

    setup(): void {
        const client = new Client({intents: [Intents.FLAGS.GUILDS]});
        client.login(process.env.DISCORD_TOKEN).then(r => {
            this.core.getLogger().info(`Logged in to Discord as ${client.user.username}`);
            client.user.setActivity({type: "WATCHING", name: "Bewerbungen an", url: "https://buildthe.earth/apply"})
            client.user.setStatus("dnd")
        });
        this.client = client;
    }
}

export default DiscordIntegration;

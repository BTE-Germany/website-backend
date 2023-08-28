/*
 * LinkController.ts
 *
 * Copyright (c) 2023 BuildTheEarth Germany e.V.
 * https://bte-germany.de
 * This project is released under the MIT license.
 */

import Core from "../Core";
import core from "../Core";
import {validationResult} from "express-validator";
import axios from "axios";

class LinkController {
    private core: Core;
    constructor(core: Core) {
        this.core = core;
    }

    private randomString(length: number): string {
        let result = '';
        let chars = "1234567890abcdefghijklmnopqrstzuvkxyz"
        for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

    public async handleGetVerificationCode(request, response) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({errors: errors.array()});
        }

        let uuid = request.body.uuid;

        const {data} = await axios.get(`https://playerdb.co/api/player/minecraft/${uuid}`)
        let code: string = this.randomString(6);
        await this.core.getPrisma().verificationCode.create({
            data: {
                uuid: uuid,
                code: code,
                username: data.data.player.username
            }
        })
        response.send({code})
    }

    public async handleLinkMinecraft(request, response) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({errors: errors.array()});
        }

        let linkCode = await this.core.getPrisma().verificationCode.findUnique({
            where: {
                code: request.body.code
            }
        })
        if (!linkCode) {
            return response.status(400).send({error: "code_not_found"})
        }

        let accountLink = await this.core.getPrisma().accountLink.findFirst({
            where: {
                providerId: linkCode.uuid,
                type: "MINECRAFT"
            }
        })
        if (accountLink) {
            return response.status(400).send({error: "already_linked"})
        }

        accountLink = await this.core.getPrisma().accountLink.create({
            data: {
                user: {
                    connect: {
                        ssoId: request.kauth.grant.access_token.content.sub
                    }
                },
                type: "MINECRAFT",
                providerId: linkCode.uuid,
                providerUsername: linkCode.username
            }
        })
        await this.core.getPrisma().verificationCode.delete({
            where: {
                id: linkCode.id
            }
        })
        /*
        TODO: Add mcuuid to keycloak when keycloak not broken anymore
        let kcUser = await this.core.getKeycloakAdmin().getKeycloakAdminClient().users.findOne({
            id: request.kauth.grant.access_token.content.sub
        })
        await this.core.getKeycloakAdmin().getKeycloakAdminClient().users.update({
            id: kcUser.id
        }, {
            attributes: {
                mcUUID: linkCode.uuid
            }
        })*/
        response.send({status: "success", username: linkCode.username})
    }

    public async handleUnlinkMinecraft(request, response) {
        let accountLink = await this.core.getPrisma().accountLink.findFirst({
            where: {
                user: {
                    ssoId: request.kauth.grant.access_token.content.sub
                },
                type: "MINECRAFT"
            }
        })
        if (accountLink) {
            await this.core.getPrisma().accountLink.delete({
                where: {
                    id: accountLink.id
                }
            })
            return response.send("ok")
        } else {
            return response.status(400).send({error: "not_linked"})
        }


    }
}

export default LinkController;
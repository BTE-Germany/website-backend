/*
 * UserController.ts
 *
 * Copyright (c) 2023 BuildTheEarth Germany e.V.
 * https://bte-germany.de
 * This project is released under the MIT license.
 */

import Core from "../Core";

class UserController {

    private core: Core;
    constructor(core: Core) {
        this.core = core;
    }

    public async getOwnLinks(request, response) {
        const links = await this.core.getPrisma().accountLink.findMany({
            where: {
                user: {
                    ssoId: request.kauth.grant.access_token.content.sub
                }
            }
        })
        response.send(links)
    }

}

export default UserController;
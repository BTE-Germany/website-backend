/*
 * CheckNewUserMiddleware.ts
 *
 * Copyright (c) 2022-2023 BuildTheEarth Germany e.V.
 * https://bte-germany.de
 * This project is released under the MIT license.
 */

import {NextFunction, Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import Core from "../../../Core.js";

const checkNewUser = (prisma: PrismaClient, core: Core) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = await prisma.user.findUnique({
            where: {
                ssoId: req.kauth.grant.access_token.content.sub
            }
        })
        if (user) {
            const kcuser = await core.getKeycloakAdmin().getKeycloakAdminClient().users.findOne({
                id: req.kauth.grant.access_token.content.sub
            })
            if (kcuser.federatedIdentities?.length > 0) {
                const discordIdentity = kcuser.federatedIdentities.find((fi) => fi.identityProvider === "discord")
                if (discordIdentity) {
                    const accountLink = await prisma.accountLink.findFirst({
                        where: {
                            userId: user.id,
                            type: "DISCORD"
                        }
                    })
                    if (!accountLink) {
                        await prisma.accountLink.create({
                            data: {
                                type: "DISCORD",
                                user: {
                                    connect: {
                                        id: user.id
                                    }
                                },
                                providerId: discordIdentity.userId,
                                providerUsername: discordIdentity.userName
                            }
                        })
                    } else {
                        if (accountLink.providerId !== discordIdentity.userId) {
                            await prisma.accountLink.update({
                                where: {
                                    id: accountLink.id
                                },
                                data: {
                                    providerId: discordIdentity.userId,
                                    providerUsername: discordIdentity.userName
                                }
                            })
                        }
                    }

                } else {
                    const accountLink = await prisma.accountLink.findFirst({
                        where: {
                            userId: user.id,
                            type: "DISCORD"
                        }
                    })
                    if (accountLink) {
                        await prisma.accountLink.delete({
                            where: {
                                id: accountLink.id
                            }
                        })
                    }
                }
            } else {
                const accountLink = await prisma.accountLink.findFirst({
                    where: {
                        userId: user.id,
                        type: "DISCORD"
                    }
                })
                if (accountLink) {
                    await prisma.accountLink.delete({
                        where: {
                            id: accountLink.id
                        }
                    })
                }
            }
            next();
            return;
        } else {

            const kcuser = await core.getKeycloakAdmin().getKeycloakAdminClient().users.findOne({
                id: req.kauth.grant.access_token.content.sub
            })
            const discordIdentity = kcuser.federatedIdentities?.find((fi) => fi.identityProvider === "discord")
            if (discordIdentity) {
                await prisma.accountLink.create({
                    data: {
                        user: {
                            create: {
                                ssoId: req.kauth.grant.access_token.content.sub
                            }
                        },
                        type: "DISCORD",
                        providerId: discordIdentity.userId,
                        providerUsername: discordIdentity.userName
                    }
                })

            } else {
                await prisma.user.create({
                    data: {
                        ssoId: req.kauth.grant.access_token.content.sub
                    }
                })
            }

        }

        next()
    }

}

export default checkNewUser;

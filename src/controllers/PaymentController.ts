/*
 * PaymentController.ts
 *
 * Copyright (c) 2023 BuildTheEarth Germany e.V.
 * https://bte-germany.de
 * This project is released under the MIT license.
 */

import Core from "../Core";
import {User} from "@prisma/client";
import {Client} from "discord.js";
import axios from "axios";

class PaymentController {
    private core: Core;

    constructor(core: Core) {
        this.core = core;
    }

    public async getPlusPaymentSession(request, response) {

        // check if user has discord and minecraft linked
        const user = await this.core.prisma.user.findUnique({
            where: {
                ssoId: request.kauth.grant.access_token.content.sub
            },
            include: {
                accountLinks: true,
            }
        });
        if (!user) {
            response.status(401).send({error: 'User not found'});
            return;
        }

        if (!user.accountLinks.some(link => link.type === 'MINECRAFT')) {
            response.status(400).send({error: 'Minecraft account not linked'});
            return;
        }
        if (!user.accountLinks.some(link => link.type === 'DISCORD')) {
            response.status(400).send({error: 'Discord account not linked'});
            return;
        }

        if (user.plus) {
            response.status(400).send({error: 'User already has plus'});
        }
        if (user.stripeCustomerId) {
            const subscription = await this.core.stripeClient.subscriptions.list({
                customer: user.stripeCustomerId,
                status: 'active',
                limit: 1
            });
            if (subscription.data.length > 0) {
                response.status(400).send({error: 'User already subscribed'});
                return;
            }
        }

        if (request.body.billingPeriod === 'onetime') {
            let params: any = {
                line_items: [
                    {
                        price: this.getPriceId(request.body.billingPeriod),
                        quantity: 1,
                    },
                ],
                payment_intent_data: {
                    metadata: {
                        userId: user.id
                    },
                },
                mode: 'payment',
                success_url: "https://bte-germany.de/store/plus/success?session_id={CHECKOUT_SESSION_ID}",
                allow_promotion_codes: true,
            };
            if (user.stripeCustomerId) {
                params.customer = user.stripeCustomerId;
            }
            const session = await this.core.stripeClient.checkout.sessions.create(params);
            response.send({url: session.url});
        } else {
            let params: any = {
                line_items: [
                    {
                        price: this.getPriceId(request.body.billingPeriod),
                        quantity: 1,
                    },
                ],
                subscription_data: {
                    metadata: {
                        userId: user.id
                    }
                },
                mode: request.body.billingPeriod === 'onetime' ? 'payment' : 'subscription',
                success_url: "https://bte-germany.de/store/plus/success?session_id={CHECKOUT_SESSION_ID}",
                allow_promotion_codes: true,
                payment_method_collection: 'if_required',
            }

            if (user.stripeCustomerId) {
                params.customer = user.stripeCustomerId;
            }
            const session = await this.core.stripeClient.checkout.sessions.create(params);
            response.send({url: session.url});
        }


    }

    public async handleStripeWebhook(request, response) {
        const sig = request.headers['stripe-signature'];

        let event;

        try {
            event = this.core.stripeClient.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            response.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        switch (event.type) {
            case 'customer.subscription.updated':
            case 'customer.subscription.created':
                const subscriptionUpdated = event.data.object;
                if (subscriptionUpdated.status === 'active') {
                    const user = await this.core.prisma.user.findUnique({
                        where: {
                            id: subscriptionUpdated.metadata.userId
                        }
                    });
                    if (!user) {
                        response.status(400).send({error: 'User not found'});
                        return;
                    }
                    await this.core.prisma.user.update({
                        where: {
                            id: user.id
                        },
                        data: {
                            plus: true,
                            stripeCustomerId: subscriptionUpdated.customer
                        }
                    });
                    this.syncRoles(user.id);
                }
                break;
            case 'customer.subscription.deleted':
                const subscriptionDeleted = event.data.object;
                if (subscriptionDeleted.status === 'canceled') {
                    const user = await this.core.prisma.user.findUnique({
                        where: {
                            id: subscriptionDeleted.metadata.userId
                        }
                    });
                    if (!user) {
                        response.status(400).send({error: 'User not found'});
                        return;
                    }
                    await this.core.prisma.user.update({
                        where: {
                            id: user.id
                        },
                        data: {
                            plus: false,
                            stripeCustomerId: subscriptionDeleted.customer
                        }
                    });
                    this.syncRoles(user.id);
                }
                break;
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                if (!paymentIntent.metadata?.userId) {
                    response.status(200).send({received: true});
                    return;
                }
                const user = await this.core.prisma.user.findUnique({
                    where: {
                        id: paymentIntent.metadata?.userId
                    }
                });
                if (!user) {
                    response.status(400).send({error: 'User not found'});
                    return;
                }
                await this.core.prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        plus: true
                    }
                });
                this.syncRoles(user.id);

        }
        response.send({received: true});
    }

    public async handleSubscriptionInfo(request, response) {
        const user = await this.core.prisma.user.findUnique({
            where: {
                ssoId: request.kauth.grant.access_token.content.sub
            }
        });

        if (!user) {
            response.status(401).send({error: 'User not found'});
            return;
        }
        if (!user.stripeCustomerId) {
            response.status(400).send({error: 'User has no stripe customer id'});
            return;
        }
        const subscription = await this.core.stripeClient.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active',
            limit: 1
        });
        if (subscription.data.length === 0) {
            response.send({status: 'inactive'});
            return;
        }
        response.send({status: 'active', subscription: subscription.data[0]});
    }

    public async handleBillingPortalRequest(request, response) {
        const user = await this.core.prisma.user.findUnique({
            where: {
                ssoId: request.kauth.grant.access_token.content.sub
            }
        });
        if (!user) {
            response.status(401).send({error: 'User not found'});
            return;
        }
        if (!user.stripeCustomerId) {
            response.status(400).send({error: 'User has no stripe customer id'});
            return;
        }
        const portal = await this.core.stripeClient.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: "https://bte-germany.de/profile"
        });
        response.send({url: portal.url});
    }

    public async syncRoles(userId: string) {
        const user = await this.core.prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        const discordClient: Client = this.core.getDiscord().getClient();
        discordClient.guilds.fetch(process.env.DISCORD_GUILD_ID).then(guild => {
            // get discord link
            const link = this.core.getPrisma().accountLink.findFirst({
                where: {
                    userId: user.id,
                    type: 'DISCORD'
                }
            }).then(link => {
                const member = guild.members.fetch(link.providerId).then(member => {

                    if (user.plus) {
                        member.roles.add(process.env.DISCORD_PLUS_ROLE);
                        this.addMinecraftRole(user);
                    } else {
                        member.roles.remove(process.env.DISCORD_PLUS_ROLE);
                        this.removeMinecraftRole(user);
                    }

                }).catch(e => {
                    this.core.getLogger().error(e);
                })

            }).catch(e => {
                this.core.getLogger().error(e);
            })

        }).catch(e => {
            this.core.getLogger().error(e);
        });
    }

    private getPriceId(billingPeriod: string) {
        switch (billingPeriod) {
            case 'monthly':
                return process.env.STRIPE_PRICE_MONTHLY;
            case 'yearly':
                return process.env.STRIPE_PRICE_YEARLY;
            case 'onetime':
                return process.env.STRIPE_PRICE_ONETIME;
        }
    }

    private async addMinecraftRole(userId: User) {
        // get minecraft link
        const mcLink = await this.core.getPrisma().accountLink.findFirst({
            where: {
                userId: userId.id,
                type: 'MINECRAFT'
            }
        })
        if (!mcLink) {
            return;
        }
        await axios.post(`${process.env.LP_API_ENDPOINT}/user/${mcLink.providerId}/nodes`, {
            key: `group.plus`,
            value: true,
            context: []
        }, {
            headers: {
                Authorization: "Bearer " + process.env.LP_API_KEY
            }
        });
    }

    private async removeMinecraftRole(userId: User) {
        // get minecraft link
        const mcLink = await this.core.getPrisma().accountLink.findFirst({
            where: {
                userId: userId.id,
                type: 'MINECRAFT'
            }
        })
        if (!mcLink) {
            return;
        }
        await axios.delete(`${process.env.LP_API_ENDPOINT}/user/${mcLink.providerId}/nodes`, {
            headers: {
                Authorization: "Bearer " + process.env.LP_API_KEY
            },
            data: [
                {
                    key: `group.plus`,
                    value: true,
                    context: []
                }
            ]
        });
    }
}

export default PaymentController;
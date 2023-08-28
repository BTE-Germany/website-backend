/*
 * index.ts
 *
 * Copyright (c) 2022-2023 BuildTheEarth Germany e.V.
 * https://bte-germany.de
 * This project is released under the MIT license.
 */

import Web from '../Web.js';
import Router from './utils/Router.js';
import {RequestMethods} from './utils/RequestMethods.js';
import {Keycloak} from "keycloak-connect";
import UserController from "../../controllers/UserController.js";
import checkNewUser from "./utils/CheckNewUserMiddleware.js";
import LinkController from "../../controllers/LinkController.js";
import {body} from "express-validator";
import PaymentController from "../../controllers/PaymentController.js";


class Routes {
    app;

    web: Web;

    keycloak: Keycloak;

    constructor(web: Web) {
        web.getCore().getLogger().info('Registering API routes');
        this.web = web;
        this.app = web.getApp();
        this.keycloak = this.web.getKeycloak();
        this.registerRoutes();

    }

    private registerRoutes() {
        const router: Router = new Router(this.web, "v1");
        const userController: UserController = new UserController(this.web.getCore());
        const linkController: LinkController = new LinkController(this.web.getCore());
        const paymentController: PaymentController = new PaymentController(this.web.getCore());


        router.addRoute(RequestMethods.GET, "/users/@me/links", (request, response) => {
            userController.getOwnLinks(request, response);
        }, this.keycloak.protect(), checkNewUser(this.web.getCore().getPrisma(), this.web.getCore()))


        router.addRoute(RequestMethods.POST, "/links/minecraft/genCode", (request, response) => {
            linkController.handleGetVerificationCode(request, response);
        }, body("uuid").isUUID())

        router.addRoute(RequestMethods.POST, "/links/minecraft/", (request, response) => {
            linkController.handleLinkMinecraft(request, response);
        }, this.keycloak.protect(), checkNewUser(this.web.getCore().getPrisma(), this.web.getCore()), body("code").isString().isLength({min: 6, max: 6}))

        router.addRoute(RequestMethods.DELETE, "/links/minecraft/", (request, response) => {
            linkController.handleUnlinkMinecraft(request, response);
        }, this.keycloak.protect(), checkNewUser(this.web.getCore().getPrisma(), this.web.getCore()))

        router.addRoute(RequestMethods.POST, "/payments/donation", (request, response) => {
            paymentController.getDonationSession(request, response);
        })

    }
}

export default Routes;

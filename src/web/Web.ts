/*
 * Web.ts
 *
 * Copyright (c) 2022-2023 BuildTheEarth Germany e.V.
 * https://bte-germany.de
 * This project is released under the MIT license.
 */

import cors from "cors";
import express, { Express } from "express";
import fileUpload from "express-fileupload";
import session from "express-session";
import http from "http";
import Core from '../Core.js';
import Routes from './routes/index.js';

class Web {
    private app: Express;

    private core: Core;

    private routes: Routes;

    private server: http.Server;



    constructor(core: Core) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.core = core;
    }

    public startWebserver() {
        this.app.use(
            (
                req: express.Request,
                res: express.Response,
                next: express.NextFunction
            ): void => {
                if (req.originalUrl.includes("stripe-webhook")) {
                    next();
                } else {
                    express.json()(req, res, next);
                }
            }
        );
        this.app.use(session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: true,
            store: this.core.memoryStore
        }));
        this.app.use(cors())


        this.app.use(this.core.getKeycloak().middleware({
            logout: '/logout',
            admin: '/'
        }));
        this.core.getLogger().debug("Enabled keycloak-connect adapter")

        this.app.use(fileUpload({
            limits: { fileSize: 10 * 1024 * 1024 },
        }));


        this.server.listen(this.getPort(), () => {
            this.core.getLogger().info(`Starting webserver on port ${this.getPort()}`);
            this.routes = new Routes(this);
        });
    }

    public getPort() {
        return process.env.WEBPORT;
    }

    public getApp(): Express {
        return this.app;
    }

    public getCore(): Core {
        return this.core;
    }

    public getKeycloak() {
        return this.core.getKeycloak();
    }

}

export default Web;

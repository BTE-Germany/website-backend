/*
 * index.ts
 *
 * Copyright (c) 2022-2023 BuildTheEarth Germany e.V.
 * https://bte-germany.de
 * This project is released under the MIT license.
 */

import Core from './src/Core.js';

import * as dotenv from 'dotenv'

dotenv.config()

const core = new Core();
core.getLogger().info('Starting BTE Germany Apply backend');
core.getLogger().info('\n\n[107;40m[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;022m,[38;5;022m,[38;5;022m,[38;5;022m,[38;5;022m,[38;5;022m,[38;5;022m,[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@[38;5;254m@\n'
    + '[38;5;254m@[38;5;254m&[38;5;254m&[38;5;254m&[38;5;254m&[38;5;254m&[38;5;254m&[38;5;017m.[38;5;022m,[38;5;022m,[38;5;022m,[38;5;002m,[38;5;002m,[38;5;002m,[38;5;002m,[38;5;002m,[38;5;002m,[38;5;024m,[38;5;233m [38;5;002m,[38;5;004m,[38;5;004m,[38;5;017m.[38;5;017m.[38;5;254m&[38;5;254m&[38;5;254m&[38;5;254m&[38;5;254m&[38;5;254m&\n'
    + '[38;5;254m@[38;5;254m&[38;5;254m&[38;5;254m&[38;5;017m.[38;5;004m,[38;5;024m,[38;5;024m,[38;5;233m [38;5;028m*[38;5;028m*[38;5;028m*[38;5;028m*[38;5;028m*[38;5;028m*[38;5;028m*[38;5;028m*[38;5;028m*[38;5;002m,[38;5;002m,[38;5;002m,[38;5;002m,[38;5;022m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;017m.[38;5;254m&[38;5;254m&[38;5;254m&\n'
    + '[38;5;254m@[38;5;254m&[38;5;017m.[38;5;004m,[38;5;024m,[38;5;024m*[38;5;024m*[38;5;024m*[38;5;025m*[38;5;070m*[38;5;071m*[38;5;071m*[38;5;070m*[38;5;070m*[38;5;028m*[38;5;028m*[38;5;028m*[38;5;028m*[38;5;028m*[38;5;002m,[38;5;002m,[38;5;024m,[38;5;024m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;017m.[38;5;254m&\n'
    + '[38;5;254m@[38;5;017m.[38;5;004m,[38;5;024m,[38;5;024m*[38;5;024m*[38;5;024m*[38;5;025m*[38;5;025m*[38;5;025m*[38;5;233m [38;5;071m*[38;5;071m*[38;5;071m*[38;5;065m*[38;5;024m*[38;5;024m*[38;5;233m [38;5;233m [38;5;028m*[38;5;002m,[38;5;024m,[38;5;024m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;060m*\n'
    + '[38;5;017m.[38;5;004m,[38;5;024m,[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;025m*[38;5;025m*[38;5;025m*[38;5;025m*[38;5;025m*[38;5;025m*[38;5;233m [38;5;002m,[38;5;028m*[38;5;024m*[38;5;024m*[38;5;024m,[38;5;024m,[38;5;024m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;017m,\n'
    + '[38;5;017m.[38;5;024m,[38;5;024m,[38;5;024m,[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;022m.[38;5;238m,[38;5;233m [38;5;002m,[38;5;022m.[38;5;234m.[38;5;022m.[38;5;234m.[38;5;237m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;017m.\n'
    + '[38;5;017m.[38;5;004m,[38;5;024m,[38;5;024m,[38;5;024m,[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;024m*[38;5;235m.[38;5;002m,[38;5;002m,[38;5;002m,[38;5;022m,[38;5;022m,[38;5;022m,[38;5;022m,[38;5;022m,[38;5;023m,[38;5;023m,[38;5;023m,[38;5;004m,[38;5;017m.[38;5;017m.\n'
    + '[38;5;254m@[38;5;017m.[38;5;004m,[38;5;024m,[38;5;024m,[38;5;024m,[38;5;024m,[38;5;024m,[38;5;024m,[38;5;024m,[38;5;024m,[38;5;024m,[38;5;024m,[38;5;024m,[38;5;024m,[38;5;004m,[38;5;234m [38;5;022m,[38;5;022m,[38;5;022m,[38;5;022m,[38;5;022m,[38;5;023m,[38;5;023m,[38;5;023m,[38;5;023m,[38;5;023m,[38;5;023m,[38;5;017m.[38;5;060m*\n'
    + '[38;5;254m@[38;5;254m&[38;5;017m.[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;233m [38;5;023m,[38;5;023m,[38;5;023m,[38;5;023m,[38;5;023m,[38;5;023m,[38;5;023m,[38;5;017m,[38;5;017m.[38;5;254m&\n'
    + '[38;5;254m@[38;5;254m&[38;5;254m&[38;5;254m&[38;5;017m.[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;004m,[38;5;233m [38;5;023m,[38;5;023m,[38;5;023m,[38;5;023m,[38;5;017m.[38;5;017m.[38;5;017m.[38;5;254m&[38;5;254m&[38;5;254m&\n'
    + '[38;5;254m@[38;5;254m&[38;5;254m&[38;5;254m&[38;5;254m&[38;5;254m&[38;5;254m&[38;5;017m.[38;5;060m/[38;5;060m/[38;5;060m/[38;5;060m/[38;5;235m.[38;5;235m.[38;5;004m,[38;5;004m,[38;5;017m.[38;5;017m.[38;5;233m [38;5;023m,[38;5;023m,[38;5;023m,[38;5;017m.[38;5;017m.[38;5;254m&[38;5;254m&[38;5;254m&[38;5;254m&[38;5;254m&[38;5;254m&\n'
    + '[0m');
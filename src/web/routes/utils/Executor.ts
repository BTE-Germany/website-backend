/*
 * Executor.ts
 *
 * Copyright (c) 2022-2023 BuildTheEarth Germany e.V.
 * https://bte-germany.de
 * This project is released under the MIT license.
 */

import { Request, Response } from 'express';

export type Executor = (request: Request, response: Response) => void;



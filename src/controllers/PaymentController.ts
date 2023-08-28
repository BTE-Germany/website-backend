/*
 * PaymentController.ts
 *
 * Copyright (c) 2023 BuildTheEarth Germany e.V.
 * https://bte-germany.de
 * This project is released under the MIT license.
 */

import Core from "../Core";
import adyen from '@adyen/api-library';
const { CheckoutAPI } = adyen;

class PaymentController {
    private core: Core;
    constructor(core: Core) {
        this.core = core;
    }

    public async getDonationSession(request, response) {
        const checkout = new CheckoutAPI(this.core.getAdyenClient());
        const id = crypto.randomUUID();
        try {
            const result = await checkout.PaymentsApi.sessions({
                amount: { currency: "EUR", value: request.body.amount },
                reference: id,
                returnUrl: "https://bte-germany.de/donate/done",
                merchantAccount: process.env.ADYEN_MERCHANT,
                countryCode: "DE"
            });
            response.send({sessionData: result.sessionData, paymentId: result.id})
            return;
        } catch (e) {
            console.log(e)
            response.status(500).send("Error while creating payment session")
            return;
        }
    }
}

export default PaymentController;
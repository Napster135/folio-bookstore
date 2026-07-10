import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config/index.config.js";

export default class PaymentService {
    constructor() {
        this.stripe = new Stripe(STRIPE_SECRET_KEY);
    }

    createPaymentIntent = async (data) => {
        const paymentIntent = await this.stripe.paymentIntents.create(data);
        return paymentIntent;
    }

    retrievePaymentIntent = async (paymentIntentId) => {
        return this.stripe.paymentIntents.retrieve(paymentIntentId);
    }
}
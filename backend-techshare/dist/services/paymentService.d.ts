import Stripe from "stripe";
declare class PaymentService {
    createPaymentIntent(amount: number, currency?: string): Promise<Stripe.PaymentIntent>;
    refundPayment(paymentIntentId: string): Promise<Stripe.Refund>;
    getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    handleWebhook(event: Stripe.Event): Promise<void>;
    private handlePaymentSuccess;
    private handlePaymentFailure;
}
export declare const paymentService: PaymentService;
export {};

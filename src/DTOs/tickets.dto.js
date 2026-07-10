class TicketDTO {
    constructor(_id, code, purchase_datetime, amount, purchaser, guestEmail, items, discountAmount, discountRate, subtotal, paymentIntentId, customer, stripeSessionId) {
        this._id = _id
        this.code = code
        this.purchase_datetime = purchase_datetime
        this.amount = amount
        this.subtotal = subtotal || 0
        this.purchaser = purchaser
        this.guestEmail = guestEmail || ''
        this.items = items || []
        this.discountAmount = discountAmount || 0
        this.discountRate = discountRate || 0
        this.paymentIntentId = paymentIntentId || null
        this.customer = customer || null
        this.stripeSessionId = stripeSessionId || null
    }
}

export default TicketDTO

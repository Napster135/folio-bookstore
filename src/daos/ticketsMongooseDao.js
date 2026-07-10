import { ticketModel } from "../models/tickets.model.js";
import { ContenedorMongoDb } from "../persistence/mongoDbPersistence.js";
import TicketDTO from "../DTOs/tickets.dto.js";

const allTicketsFromObject = (tickets) => {
    return tickets.map((ticket) => {
        const { _id, code, purchase_datetime, amount, purchaser, guestEmail, items, discountAmount, discountRate, subtotal, paymentIntentId, customer, stripeSessionId } = ticket;
        return new TicketDTO(_id, code, purchase_datetime, amount, purchaser, guestEmail, items, discountAmount, discountRate, subtotal, paymentIntentId, customer, stripeSessionId);
    })
}

class TicketsDAOMongoDb extends ContenedorMongoDb {
    async createNewTicket(ticket) {
        try {
            const newTicket = await this.save(ticket);
            return newTicket;
        } catch (error) {
            throw new Error(error);
        }
    }

    async findTicketByPurchaser(uid) {
        try {
            let existTicket = await ticketModel.find({ purchaser: uid });
            return allTicketsFromObject(existTicket);
        } catch (error) {
            throw new Error(error);
        }
    }

    async findAllTickets() {
        try {
            let tickets = await ticketModel.find({}).populate('purchaser', 'first_name last_name email').sort({ purchase_datetime: -1 });
            return tickets;
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default TicketsDAOMongoDb;
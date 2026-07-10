import TicketsDAOMongoDb from "../daos/ticketsMongooseDao.js";
import { ticketSchema } from "../models/tickets.model.js";
const ticketDAO = new TicketsDAOMongoDb("tickets", ticketSchema);

class TicketRepository {
    async createNewTicket (ticket) {
        return ticketDAO.createNewTicket(ticket);
    }

    async findTicketByPurchaser (uid) {
        return ticketDAO.findTicketByPurchaser(uid);
    }

    async findAllTickets () {
        return ticketDAO.findAllTickets();
    }
}

export default TicketRepository;
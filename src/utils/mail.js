import nodemailer from "nodemailer";
import { GMAIL, GMAIL_PASSWORD } from "../config/index.config.js";

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: GMAIL,
        pass: GMAIL_PASSWORD
    }
})


export default transporter;
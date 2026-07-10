import PaymentService from "../services/stripe.js";
const paymentService = new PaymentService();
import { serviceDeleteProductInCart, serviceGetProductsInCart } from "../services/cart.js";
import { serviceGetProductById, serviceUpdateProduct, serviceGetProductsByIds } from "../services/product.js";
import { serviceCreateTicket, serviceFindTicketByPurchaser, serviceGetAllTickets } from "../services/ticket.js";
import { ticketModel } from "../models/tickets.model.js";
import { STRIPE_PUBLIC_KEY } from "../config/index.config.js";
import { isUserAdmin, isUserPremium } from "../utils/roles.js";

const PREMIUM_DISCOUNT = 0.10;
const ADMIN_DISCOUNT = 0.20;

const calculateCartTotalAndProducts = async (cid) => {
    const productsInCart = await serviceGetProductsInCart(cid);
    const ids = productsInCart.map(p => p._id);
    const productList = await serviceGetProductsByIds(ids);
    const productMap = new Map(productList.map(p => [p._id.toString(), p]));

    let amount = 0;
    let products = [];
    let outOfStockProducts = [];
    for (const productInCart of productsInCart) {
        const product = productMap.get(productInCart._id.toString());
        if (!product) continue;
        if (productInCart.quantity <= product.stock) {
            amount += product.price * productInCart.quantity;
            products.push({ product, quantity: productInCart.quantity });
        } else {
            outOfStockProducts.push({ product, quantity: productInCart.quantity });
        }
    }
    return { amount, products, outOfStockProducts };
};

export const renderCheckout = async (req, res, next) => {
    let user = req.session.user;
    const { cid } = req.params;
    try {
        const { amount, products, outOfStockProducts } = await calculateCartTotalAndProducts(cid);
        res.status(200).json({
            user: { user: user.user, role: user.role, cartId: user.cartId },
            total: amount,
            products,
            outOfStockProducts,
        });
    } catch (error) {
        res.status(500).send({ message: "Error al preparar el checkout" });
    }
}

export const processPayment = async (req, res) => {
    let user = req.session.user;
    const { cid } = req.params;
    const discountRate = isUserAdmin(user) ? ADMIN_DISCOUNT : isUserPremium(user) ? PREMIUM_DISCOUNT : 0;
    try {
        const { amount } = await calculateCartTotalAndProducts(cid);
        if (amount <= 0) {
            return res.status(400).send({ status: "error", payload: "El total de compra no puede ser 0" });
        }
        const discountAmount = Math.round(amount * discountRate * 100) / 100;
        const finalAmount = Math.round((amount - discountAmount) * 100) / 100;
        const charge = {
            amount: Math.round(finalAmount * 100),
            currency: 'usd',
        };
        const result = await paymentService.createPaymentIntent(charge);
        const { password: _pw, ...safeUser } = user || {};
        res.status(200).send({
            status: "success",
            payload: {
                client_secret: result.client_secret,
                purchaser: safeUser,
                discountRate,
                discountAmount,
                subtotal: amount,
                total: finalAmount,
            }
        });
    } catch (error) {
        res.status(500).send({ message: "Error al procesar el pago" });
    }
}

export const getPublicKey = async (req, res) => {
    const publicKey = STRIPE_PUBLIC_KEY;
    res.json({ publicKey });
}

export const confirmPurchase = async (req, res) => {
    const { cid } = req.params;
    const user = req.session.user;
    const { paymentIntentId, phone, shippingAddress, billingAddress } = req.body || {};
    const discountRate = isUserAdmin(user) ? ADMIN_DISCOUNT : isUserPremium(user) ? PREMIUM_DISCOUNT : 0;

    try {
        const productsInCart = await serviceGetProductsInCart(cid);
        const ids = productsInCart.map(p => p._id);
        const productList = await serviceGetProductsByIds(ids);
        const productMap = new Map(productList.map(p => [p._id.toString(), p]));

        let subtotal = 0;
        const productsTicket = [];
        const ticketItems = [];

        for (const productInCart of productsInCart) {
            const product = productMap.get(productInCart._id.toString());
            if (!product) continue;
            if (productInCart.quantity <= product.stock) {
                const lineTotal = product.price * productInCart.quantity;
                subtotal += lineTotal;
                await serviceUpdateProduct(product._id, { ...product, stock: product.stock - productInCart.quantity });
                productsTicket.push(product);
                ticketItems.push({
                    productId: product._id,
                    title: product.title,
                    quantity: productInCart.quantity,
                    unitPrice: product.price,
                    subtotal: lineTotal,
                    thumbnail: product.thumbnail || '',
                    category: product.category || '',
                });
                await serviceDeleteProductInCart(cid, productInCart._id.toString());
            }
        }

        const discountAmount = Math.round(subtotal * discountRate * 100) / 100;
        const total = Math.round((subtotal - discountAmount) * 100) / 100;

        let ticket;
        if (productsTicket.length) {
            ticket = await serviceCreateTicket({
                purchase_datetime: new Date(),
                amount: total,
                subtotal,
                purchaser: user,
                items: ticketItems,
                discountAmount,
                discountRate,
                paymentIntentId: paymentIntentId || undefined,
                customer: {
                    name: user.user || '',
                    email: user.email || '',
                    phone: phone || '',
                    type: 'registered',
                    shippingAddress: shippingAddress || '',
                    billingAddress: billingAddress || '',
                },
            });
        }
        res.status(201).send({ status: "success", payload: { ticket } });
    } catch (error) {
        res.status(500).send({ message: "Error al confirmar la compra" });
    }
}

// ── Guest checkout ────────────────────────────────────────────
export const guestCheckout = async (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'El carrito está vacío' });
    }
    try {
        let total = 0;
        const validItems = [];
        const invalidItems = [];

        for (const item of items) {
            // GuestCartContext stores _id; accept both for compatibility
            const pid = item._id ?? item.productId;
            if (!pid || item.quantity < 1) continue;
            const product = await serviceGetProductById(pid);
            if (product.error || item.quantity > product.stock) {
                invalidItems.push(pid);
            } else {
                const lineTotal = product.price * item.quantity;
                total += lineTotal;
                validItems.push({ productId: pid, quantity: item.quantity, lineTotal });
            }
        }

        if (validItems.length === 0) {
            return res.status(400).json({ message: 'Ningún producto está disponible en este momento' });
        }
        if (total <= 0) {
            return res.status(400).json({ message: 'El total de compra no puede ser 0' });
        }

        const paymentIntent = await paymentService.createPaymentIntent({
            amount: Math.round(total * 100),
            currency: 'usd',
        });

        res.status(200).json({
            client_secret: paymentIntent.client_secret,
            total,
            validItems,
            invalidItems,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar el pago' });
    }
}

export const guestConfirm = async (req, res) => {
    const { items, email, paymentIntentId, name, phone, shippingAddress, billingAddress } = req.body;

    if (!email || !paymentIntentId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Datos de compra incompletos' });
    }

    // ── IDEMPOTENCIA ─────────────────────────────────────────────────────────
    // Si el PI ya fue procesado devolvemos el ticket existente sin tocar nada.
    try {
        const existingTicket = await ticketModel.findOne({ paymentIntentId });
        if (existingTicket) {
            return res.status(200).json({ ticket: existingTicket, alreadyProcessed: true });
        }
    } catch {
        return res.status(500).json({ message: 'Error al verificar idempotencia' });
    }

    // ── FASE 1: Todas las validaciones — sin modificar datos ─────────────────

    // 1a. Verificar pago con Stripe
    let stripePI;
    try {
        stripePI = await paymentService.retrievePaymentIntent(paymentIntentId);
    } catch {
        return res.status(400).json({ message: 'No se pudo verificar el pago con Stripe' });
    }
    if (stripePI.status !== 'succeeded') {
        return res.status(402).json({ message: 'El pago no fue aprobado' });
    }

    // 1b. Validar existencia, stock y calcular totales — sin escribir
    let amount = 0;
    const validatedItems = []; // { product, quantity, lineTotal }

    try {
        for (const item of items) {
            const pid = item._id ?? item.productId;
            if (!pid || item.quantity < 1) continue;

            const product = await serviceGetProductById(pid);
            if (product.error) {
                return res.status(404).json({ message: `Producto no encontrado: ${pid}` });
            }
            if (item.quantity > product.stock) {
                return res.status(409).json({
                    message: `Stock insuficiente para "${product.title}". Disponible: ${product.stock}, solicitado: ${item.quantity}`
                });
            }
            const lineTotal = product.price * item.quantity;
            amount += lineTotal;
            validatedItems.push({ product, quantity: item.quantity, lineTotal });
        }
    } catch {
        return res.status(500).json({ message: 'Error al validar los productos' });
    }

    if (validatedItems.length === 0) {
        return res.status(400).json({ message: 'Ningún producto pudo procesarse' });
    }

    // 1c. Cross-check: monto calculado desde DB vs monto cobrado por Stripe
    const dbAmountCents = Math.round(amount * 100);
    if (dbAmountCents !== stripePI.amount) {
        return res.status(409).json({
            message: 'El precio de uno o más productos cambió durante el proceso. Por favor, iniciá la compra nuevamente.'
        });
    }

    // ── FASE 2: Todas las validaciones pasaron → escrituras ──────────────────

    try {
        const ticketItems = [];
        for (const { product, quantity, lineTotal } of validatedItems) {
            await serviceUpdateProduct(product._id, { ...product, stock: product.stock - quantity });
            ticketItems.push({
                productId: product._id,
                title: product.title,
                quantity,
                unitPrice: product.price,
                subtotal: lineTotal,
                thumbnail: product.thumbnail || '',
                category: product.category || '',
            });
        }

        const ticket = await serviceCreateTicket({
            purchase_datetime: new Date(),
            amount: Math.round(amount * 100) / 100,
            guestEmail: email,
            items: ticketItems,
            paymentIntentId,
            customer: {
                name: name || '',
                email,
                phone: phone || '',
                type: 'guest',
                shippingAddress: shippingAddress || '',
                billingAddress: billingAddress || '',
            },
        });

        res.status(201).json({ ticket });
    } catch (error) {
        res.status(500).json({ message: 'Error al confirmar la compra' });
    }
}

export const renderTickets = async (req, res) => {
    let user = req.session.user;
    try {
        const getTickets = await serviceFindTicketByPurchaser(user._id);
        let isAdmin = isUserAdmin(user);
        let isPremium = isUserPremium(user);
        if (req.headers.accept && req.headers.accept.includes("application/json")) {
            return res.status(200).json({
                tickets: getTickets ?? [],
                user: { user: user.user, role: user.role, cartId: user.cartId },
                isAdmin,
                isPremium,
            });
        }
        res.status(200).json({
            tickets: getTickets ?? [],
            user: { user: user.user, role: user.role, cartId: user.cartId },
            isAdmin,
            isPremium,
        });
    } catch (error) {
        res.status(500).send({ message: "Error al obtener los pedidos" });
    }
}

export const getAllTicketsAdmin = async (req, res) => {
    try {
        const tickets = await serviceGetAllTickets();
        return res.status(200).json({ tickets: tickets ?? [] });
    } catch (error) {
        res.status(500).send({ message: "Error al obtener todos los pedidos" });
    }
}

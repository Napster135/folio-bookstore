import {
    serviceAddProduct,
    serviceDeleteProductById,
    serviceGetProductById,
    serviceGetProducts,
    serviceUpdateProduct,
    serviceProductsCreatedBy,
    serviceGetCategories,
  } from "../services/product.js";
  import { serviceDeleteProductInCart } from "../services/cart.js";
  import { userModel } from "../models/users.model.js";
  import transporter from "../utils/mail.js";
  import { GMAIL } from "../config/index.config.js";
  import { isUserAdmin, isUserPremium } from "../utils/roles.js";
  
  const getProducts = async (req, res) => {
    let user = req.session.user;
    try {
      const products = await serviceGetProducts(req.query);
      let isAdmin = isUserAdmin(user);
      let isPremium = isUserPremium(user);
      const hasNextPage = products.hasNextPage;
      const hasPrevPage = products.hasPrevPage;
      const sort = products.sort;
      const page = products.page;
      const query = products.query;
      const categories = await serviceGetCategories();

      // Si piden JSON, devolver datos sin renderizar la vista
      if (req.headers.accept && req.headers.accept.includes("application/json")) {
        return res.status(200).json({
          products: products.docs,
          hasNextPage,
          hasPrevPage,
          page,
          totalPages: products.totalPages,
          totalDocs: products.totalDocs,
          categories,
          user: user ? { user: user.user, role: user.role, cartId: user.cartId } : null,
          isAdmin,
          isPremium,
        });
      }

      res.redirect("/products");
    } catch (error) {
      res.status(500).send({ message: "Error trying to get all products" });
    }
  };
  
  const getProductById = async (req, res) => {
    const id = req.params.pid;
    let user = req.session.user;
    try {
      let product = await serviceGetProductById(id);
      let isAdmin = isUserAdmin(user);
      let isPremium = isUserPremium(user);

      if (req.headers.accept && req.headers.accept.includes("application/json")) {
        return res.status(200).json({
          product,
          user: user ? { user: user.user, role: user.role, cartId: user.cartId } : null,
          isAdmin,
          isPremium,
        });
      }

      res.redirect(`/products/${id}`);
    } catch (error) {
      res.status(500).send({ message: "Error al obtener el producto" });
    }
  };
  
  const getProductsFromPremiumUsers = async (req, res) => {
    let user = req.session.user;
    try {
      let allProducts = await serviceProductsCreatedBy(user._id);
      let isPremium = isUserPremium(user);
      res.status(200).json({ user, isPremium, allProducts });
    } catch (error) {
      res.status(500).send({ message: "Error al obtener el producto" });
    }
  };
  
  const addProduct = async (req, res) => {
    let user = req.session.user;
    try {
      const newProduct = await serviceAddProduct(req.body, user._id);
      res.status(201).send({
        status: "success",
        message: "Registered succesfully!",
        payload: newProduct,
      });
    } catch (error) {
      res.status(500).send({ message: "Error adding new Product" });
    }
  };
  
  const updateProduct = async (req, res) => {
    const pid = req.params.pid;
    const { updates } = req.body;
    try {
      const result = await serviceUpdateProduct(pid, updates);
      if (result.status === "error") {
        res.status(404).send({ message: result.payload });
      } else {
        res.status(200).send(result);
      }
    } catch (error) {
      res.status(500).send({ message: "Error updating the product" });
    }
  };
  
  const deleteProductById = async (req, res) => {
    const id = req.params.pid;
    try {
      const deletedProduct = await serviceDeleteProductById(id);
  
      const premiumUsers = await userModel
        .find({ role: "premium" })
        .populate("cartId");
  
      for (const user of premiumUsers) {
        const cart = user.cartId;
        if (cart) {
          const productExists = cart.products.some(
            (product) => product.product.toString() === id
          );
          if (productExists) {
            const mailOptions = {
              from: GMAIL,
              to: user.email,
              subject: "Eliminación de producto en carrito",
              text: `Estimado ${user.first_name},\n\nEl producto en su carrito ha sido eliminado.`,
            };
            try {
              await transporter.sendMail(mailOptions);
            } catch {
              // email failure is non-fatal — product deletion continues
            }
  
            await serviceDeleteProductInCart(cart, id);
          }
        }
      }
  
      res.status(200).send({
        message: "Producto borrado exitosamente",
        payload: deletedProduct,
      });
    } catch (error) {
      res.status(500).send({ message: "Error al eliminar el producto", error });
    }
  };
  
  export {
    addProduct,
    getProducts,
    deleteProductById,
    getProductById,
    updateProduct,
    getProductsFromPremiumUsers,
  };
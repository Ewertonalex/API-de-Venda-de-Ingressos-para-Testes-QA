import { Router } from "express";
import { body, param } from "express-validator";
import { authMiddleware } from "../middleware/auth.middleware";
import { 
    getCart, 
    addItemToCart, 
    updateCartItem, 
    removeCartItem, 
    clearCart 
} from "../services/cart.service";

const router = Router();

// Obter carrinho atual do usuário
router.get(
    "/",
    [authMiddleware],
    getCart
);

// Adicionar item ao carrinho
router.post(
    "/items",
    [
        authMiddleware,
        body("tipoIngressoId").isUUID().withMessage("ID de tipo de ingresso inválido"),
        body("quantidade").isInt({ min: 1 }).withMessage("Quantidade deve ser um número inteiro maior que zero")
    ],
    addItemToCart
);

// Atualizar quantidade de um item no carrinho
router.put(
    "/items/:id",
    [
        authMiddleware,
        param("id").isUUID().withMessage("ID de item do carrinho inválido"),
        body("quantidade").isInt({ min: 1 }).withMessage("Quantidade deve ser um número inteiro maior que zero")
    ],
    updateCartItem
);

// Remover item do carrinho
router.delete(
    "/items/:id",
    [
        authMiddleware,
        param("id").isUUID().withMessage("ID de item do carrinho inválido")
    ],
    removeCartItem
);

// Limpar carrinho (remover todos os itens)
router.delete(
    "/",
    [authMiddleware],
    clearCart
);

export const cartRoutes = router; 
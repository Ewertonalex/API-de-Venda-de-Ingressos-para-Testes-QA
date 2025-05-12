import { Router } from "express";
import { body, param, query } from "express-validator";
import { authMiddleware, checkRole } from "../middleware/auth.middleware";

const router = Router();

// Rotas temporárias para pedidos
router.get("/", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Lista de pedidos (implementação pendente)"
  });
});

router.get("/:id", authMiddleware, (req, res) => {
  res.status(200).json({
    message: `Detalhes do pedido ${req.params.id} (implementação pendente)`
  });
});

router.post("/", authMiddleware, (req, res) => {
  res.status(201).json({
    message: "Pedido criado (implementação pendente)",
    data: req.body
  });
});

router.put("/:id", authMiddleware, (req, res) => {
  res.status(200).json({
    message: `Pedido ${req.params.id} atualizado (implementação pendente)`,
    data: req.body
  });
});

router.delete("/:id", authMiddleware, checkRole(["ADMIN"]), (req, res) => {
  res.status(200).json({
    message: `Pedido ${req.params.id} cancelado (implementação pendente)`
  });
});

export const orderRoutes = router; 
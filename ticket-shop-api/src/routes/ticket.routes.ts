import { Router } from "express";
import { body, param, query } from "express-validator";
import { authMiddleware, checkRole } from "../middleware/auth.middleware";

const router = Router();

// Rotas temporárias para ingressos
router.get("/:id", authMiddleware, (req, res) => {
  res.status(200).json({
    message: `Detalhes do ingresso ${req.params.id} (implementação pendente)`
  });
});

router.get("/verificar/:codigo", authMiddleware, checkRole(["ADMIN", "ORGANIZADOR"]), (req, res) => {
  res.status(200).json({
    message: `Verificação do ingresso com código ${req.params.codigo} (implementação pendente)`,
    valido: true
  });
});

router.put("/:id/utilizar", authMiddleware, checkRole(["ADMIN", "ORGANIZADOR"]), (req, res) => {
  res.status(200).json({
    message: `Ingresso ${req.params.id} marcado como utilizado (implementação pendente)`
  });
});

router.get("/pedido/:pedidoId", authMiddleware, (req, res) => {
  res.status(200).json({
    message: `Lista de ingressos do pedido ${req.params.pedidoId} (implementação pendente)`
  });
});

export const ticketRoutes = router; 
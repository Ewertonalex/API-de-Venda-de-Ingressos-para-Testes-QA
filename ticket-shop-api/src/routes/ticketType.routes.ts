import { Router } from "express";
import { body, param, query } from "express-validator";
import { authMiddleware, checkRole } from "../middleware/auth.middleware";

const router = Router();

// Rotas temporárias para tipos de ingressos
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Lista de tipos de ingressos (implementação pendente)"
  });
});

router.get("/:id", (req, res) => {
  res.status(200).json({
    message: `Detalhes do tipo de ingresso ${req.params.id} (implementação pendente)`
  });
});

router.post("/", authMiddleware, checkRole(["ADMIN", "ORGANIZADOR"]), (req, res) => {
  res.status(201).json({
    message: "Tipo de ingresso criado (implementação pendente)",
    data: req.body
  });
});

router.put("/:id", authMiddleware, checkRole(["ADMIN", "ORGANIZADOR"]), (req, res) => {
  res.status(200).json({
    message: `Tipo de ingresso ${req.params.id} atualizado (implementação pendente)`,
    data: req.body
  });
});

router.delete("/:id", authMiddleware, checkRole(["ADMIN", "ORGANIZADOR"]), (req, res) => {
  res.status(200).json({
    message: `Tipo de ingresso ${req.params.id} excluído (implementação pendente)`
  });
});

export const ticketTypeRoutes = router; 
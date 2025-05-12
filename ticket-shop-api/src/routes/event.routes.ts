import { Router } from "express";
import { body, param, query } from "express-validator";
import { authMiddleware, checkRole } from "../middleware/auth.middleware";
import { 
    getAllEvents, 
    getEventById, 
    createEvent, 
    updateEvent, 
    deleteEvent 
} from "../services/event.service";

const router = Router();

// Listar todos os eventos (público)
router.get(
    "/",
    [
        query("nome").optional(),
        query("categoriaId").optional().isUUID().withMessage("ID de categoria inválido"),
        query("ativo").optional().isBoolean().withMessage("O valor de ativo deve ser boolean")
    ],
    getAllEvents
);

// Obter evento por ID (público)
router.get(
    "/:id",
    [
        param("id").isUUID().withMessage("ID de evento inválido")
    ],
    getEventById
);

// Criar evento (ADMIN e ORGANIZADOR)
router.post(
    "/",
    [
        authMiddleware,
        checkRole(["ADMIN", "ORGANIZADOR"]),
        body("nome").notEmpty().withMessage("Nome é obrigatório"),
        body("descricao").notEmpty().withMessage("Descrição é obrigatória"),
        body("local").notEmpty().withMessage("Local é obrigatório"),
        body("dataInicio").isISO8601().withMessage("Data de início deve ser uma data válida"),
        body("dataFim").optional().isISO8601().withMessage("Data de fim deve ser uma data válida"),
        body("categoriaId").isUUID().withMessage("ID de categoria inválido")
    ],
    createEvent
);

// Atualizar evento (ADMIN e ORGANIZADOR)
router.put(
    "/:id",
    [
        authMiddleware,
        checkRole(["ADMIN", "ORGANIZADOR"]),
        param("id").isUUID().withMessage("ID de evento inválido"),
        body("nome").optional().notEmpty().withMessage("Nome não pode ser vazio"),
        body("descricao").optional(),
        body("local").optional(),
        body("dataInicio").optional().isISO8601().withMessage("Data de início deve ser uma data válida"),
        body("dataFim").optional().isISO8601().withMessage("Data de fim deve ser uma data válida"),
        body("ativo").optional().isBoolean().withMessage("O valor de ativo deve ser boolean"),
        body("categoriaId").optional().isUUID().withMessage("ID de categoria inválido")
    ],
    updateEvent
);

// Excluir evento (ADMIN e ORGANIZADOR)
router.delete(
    "/:id",
    [
        authMiddleware,
        checkRole(["ADMIN", "ORGANIZADOR"]),
        param("id").isUUID().withMessage("ID de evento inválido")
    ],
    deleteEvent
);

export const eventRoutes = router; 
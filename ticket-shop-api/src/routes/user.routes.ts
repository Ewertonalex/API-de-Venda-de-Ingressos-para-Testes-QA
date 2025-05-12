import { Router } from "express";
import { body, param, query } from "express-validator";
import { authMiddleware, checkRole } from "../middleware/auth.middleware";
import { 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser 
} from "../services/user.service";

const router = Router();

// Listar todos os usuários (apenas ADMIN)
router.get(
    "/",
    [
        authMiddleware,
        checkRole(["ADMIN"]),
        query("nome").optional(),
        query("email").optional().isEmail().withMessage("Email deve ser válido")
    ],
    getAllUsers
);

// Obter usuário por ID
router.get(
    "/:id",
    [
        authMiddleware,
        param("id").isUUID().withMessage("ID de usuário inválido")
    ],
    getUserById
);

// Atualizar usuário
router.put(
    "/:id",
    [
        authMiddleware,
        param("id").isUUID().withMessage("ID de usuário inválido"),
        body("nome").optional().notEmpty().withMessage("Nome não pode ser vazio"),
        body("email").optional().isEmail().withMessage("Email deve ser válido"),
        body("telefone").optional(),
        body("cpf").optional()
    ],
    updateUser
);

// Excluir usuário
router.delete(
    "/:id",
    [
        authMiddleware,
        checkRole(["ADMIN"]),
        param("id").isUUID().withMessage("ID de usuário inválido")
    ],
    deleteUser
);

export const userRoutes = router; 
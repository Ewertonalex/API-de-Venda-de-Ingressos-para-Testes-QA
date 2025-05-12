import { Router } from "express";
import { body, param, query } from "express-validator";
import { authMiddleware, checkRole } from "../middleware/auth.middleware";
import { 
    getAllCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from "../services/eventCategory.service";

const router = Router();

// Listar todas as categorias (público)
router.get(
    "/",
    [
        query("nome").optional()
    ],
    getAllCategories
);

// Obter categoria por ID (público)
router.get(
    "/:id",
    [
        param("id").isUUID().withMessage("ID de categoria inválido")
    ],
    getCategoryById
);

// Criar categoria (apenas ADMIN)
router.post(
    "/",
    [
        authMiddleware,
        checkRole(["ADMIN"]),
        body("nome").notEmpty().withMessage("Nome é obrigatório"),
        body("descricao").optional()
    ],
    createCategory
);

// Atualizar categoria (apenas ADMIN)
router.put(
    "/:id",
    [
        authMiddleware,
        checkRole(["ADMIN"]),
        param("id").isUUID().withMessage("ID de categoria inválido"),
        body("nome").optional().notEmpty().withMessage("Nome não pode ser vazio"),
        body("descricao").optional()
    ],
    updateCategory
);

// Excluir categoria (apenas ADMIN)
router.delete(
    "/:id",
    [
        authMiddleware,
        checkRole(["ADMIN"]),
        param("id").isUUID().withMessage("ID de categoria inválido")
    ],
    deleteCategory
);

export const eventCategoryRoutes = router; 
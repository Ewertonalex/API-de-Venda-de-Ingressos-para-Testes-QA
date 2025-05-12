import { Router } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";

const router = Router();
const userRepository = AppDataSource.getRepository(User);

// Rota para registro de usuário
router.post(
    "/register",
    [
        body("nome").notEmpty().withMessage("Nome é obrigatório"),
        body("email").isEmail().withMessage("Email deve ser válido"),
        body("senha").isLength({ min: 6 }).withMessage("Senha deve ter no mínimo 6 caracteres"),
    ],
    async (req, res) => {
        try {
            const { nome, email, senha, telefone, cpf } = req.body;
            
            // Verificar se o email já existe
            const existingUser = await userRepository.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    erro: "Email já cadastrado",
                    errors: [{ msg: "Este email já está em uso", param: "email", location: "body" }]
                });
            }
            
            // Hash da senha
            const hashedPassword = await bcrypt.hash(senha, 10);
            
            // Criar novo usuário
            const user = userRepository.create({
                nome,
                email,
                senha: hashedPassword,
                telefone,
                cpf,
                role: "CLIENTE",
                dataCriacao: new Date()
            });
            
            await userRepository.save(user);
            
            // Gerar token JWT
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || "secret",
                { expiresIn: "1d" }
            );
            
            // Retornar usuário e token (sem a senha)
            const { senha: _, ...userWithoutPassword } = user;
            
            return res.status(201).json({ user: userWithoutPassword, token });
        } catch (error) {
            console.error("Erro ao registrar usuário:", error);
            return res.status(500).json({
                erro: "Erro interno no servidor",
                errors: [{ msg: "Ocorreu um erro ao registrar o usuário", param: null, location: "server" }]
            });
        }
    }
);

// Rota para login
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Email deve ser válido"),
        body("senha").notEmpty().withMessage("Senha é obrigatória"),
    ],
    async (req, res) => {
        try {
            const { email, senha } = req.body;
            
            // Buscar usuário pelo email
            const user = await userRepository.findOne({
                where: { email },
                select: ["id", "nome", "email", "senha", "role", "dataCriacao"]
            });
            
            if (!user) {
                return res.status(401).json({
                    erro: "Credenciais inválidas",
                    errors: [{ msg: "Email ou senha incorretos", param: "email", location: "body" }]
                });
            }
            
            // Verificar senha
            const isPasswordValid = await bcrypt.compare(senha, user.senha);
            if (!isPasswordValid) {
                return res.status(401).json({
                    erro: "Credenciais inválidas",
                    errors: [{ msg: "Email ou senha incorretos", param: "senha", location: "body" }]
                });
            }
            
            // Gerar token JWT
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || "secret",
                { expiresIn: "1d" }
            );
            
            // Retornar usuário e token (sem a senha)
            const { senha: _, ...userWithoutPassword } = user;
            
            return res.status(200).json({ user: userWithoutPassword, token });
        } catch (error) {
            console.error("Erro ao realizar login:", error);
            return res.status(500).json({
                erro: "Erro interno no servidor",
                errors: [{ msg: "Ocorreu um erro ao realizar o login", param: null, location: "server" }]
            });
        }
    }
);

export const authRoutes = router; 
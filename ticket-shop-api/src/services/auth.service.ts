import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";

// Repositório de usuários
const userRepository = AppDataSource.getRepository(User);

// Registro de novos usuários
export const register = async (req: Request, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }

    const { nome, email, senha, telefone, cpf } = req.body;

    try {
        // Verificar se o email já existe
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                erro: "Email já cadastrado",
                errors: [
                    {
                        msg: "Este email já está em uso",
                        param: "email",
                        location: "body"
                    }
                ]
            });
        }

        // Criptografar a senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Criar novo usuário
        const user = userRepository.create({
            nome,
            email,
            senha: hashedPassword,
            telefone,
            cpf,
            role: "CLIENTE", // Por padrão, novos usuários são clientes
            dataCriacao: new Date()
        });

        // Salvar no banco de dados
        await userRepository.save(user);

        // Gerar token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1d" }
        );

        // Responder com os dados do usuário e token (sem a senha)
        const { senha: _, ...userWithoutPassword } = user;
        
        return res.status(201).json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        return res.status(500).json({
            erro: "Erro ao registrar usuário",
            errors: [
                {
                    msg: "Ocorreu um erro interno no servidor",
                    param: null,
                    location: "server"
                }
            ]
        });
    }
};

// Login de usuários
export const login = async (req: Request, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }

    const { email, senha } = req.body;

    try {
        // Buscar usuário pelo email (incluindo o campo senha)
        const user = await userRepository.findOne({
            where: { email },
            select: ["id", "nome", "email", "senha", "role", "dataCriacao"]
        });

        // Verificar se o usuário existe
        if (!user) {
            return res.status(401).json({
                erro: "Credenciais inválidas",
                errors: [
                    {
                        msg: "Email ou senha incorretos",
                        param: "email",
                        location: "body"
                    }
                ]
            });
        }

        // Verificar se a senha está correta
        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(401).json({
                erro: "Credenciais inválidas",
                errors: [
                    {
                        msg: "Email ou senha incorretos",
                        param: "senha",
                        location: "body"
                    }
                ]
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1d" }
        );

        // Responder com os dados do usuário e token (sem a senha)
        const { senha: _, ...userWithoutPassword } = user;
        
        return res.status(200).json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error("Erro ao realizar login:", error);
        return res.status(500).json({
            erro: "Erro ao realizar login",
            errors: [
                {
                    msg: "Ocorreu um erro interno no servidor",
                    param: null,
                    location: "server"
                }
            ]
        });
    }
}; 
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";
import { AuthRequest } from "../middleware/auth.middleware";
import bcrypt from "bcryptjs";
import { Order } from "../entities/Order";

// Repositório de usuários
const userRepository = AppDataSource.getRepository(User);
const orderRepository = AppDataSource.getRepository(Order);

// Obter todos os usuários (com filtros opcionais)
export const getAllUsers = async (req: Request, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }

    try {
        // Montar query com filtros
        const query = userRepository.createQueryBuilder("user");
        
        // Aplicar filtros se fornecidos
        if (req.query.nome) {
            query.andWhere("user.nome LIKE :nome", { nome: `%${req.query.nome}%` });
        }
        
        if (req.query.email) {
            query.andWhere("user.email = :email", { email: req.query.email });
        }
        
        // Executar query
        const users = await query.getMany();
        
        return res.status(200).json(users);
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        return res.status(500).json({
            erro: "Erro ao listar usuários",
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

// Obter usuário por ID
export const getUserById = async (req: AuthRequest, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }

    const { id } = req.params;

    try {
        // Verificar se o usuário existe
        const user = await userRepository.findOne({ 
            where: { id },
            relations: ["pedidos"]
        });
        
        if (!user) {
            return res.status(404).json({
                erro: "Usuário não encontrado",
                errors: [
                    {
                        msg: "Usuário com este ID não existe",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        // Verificar se o usuário tem permissão para acessar estes dados
        // Somente ADMIN ou o próprio usuário pode acessar
        if (req.userRole !== "ADMIN" && req.userId !== id) {
            return res.status(403).json({
                erro: "Acesso negado",
                errors: [
                    {
                        msg: "Você não tem permissão para acessar os dados deste usuário",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return res.status(500).json({
            erro: "Erro ao buscar usuário",
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

// Atualizar usuário
export const updateUser = async (req: AuthRequest, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }

    const { id } = req.params;
    const { nome, email, telefone, cpf, senha } = req.body;

    try {
        // Verificar se o usuário existe
        const user = await userRepository.findOne({ where: { id } });
        
        if (!user) {
            return res.status(404).json({
                erro: "Usuário não encontrado",
                errors: [
                    {
                        msg: "Usuário com este ID não existe",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        // Verificar se o usuário tem permissão para atualizar estes dados
        // Somente ADMIN ou o próprio usuário pode atualizar
        if (req.userRole !== "ADMIN" && req.userId !== id) {
            return res.status(403).json({
                erro: "Acesso negado",
                errors: [
                    {
                        msg: "Você não tem permissão para atualizar os dados deste usuário",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        // Se estiver atualizando o email, verificar se já existe outro usuário com este email
        if (email && email !== user.email) {
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
        }

        // Atualizar dados do usuário
        if (nome) user.nome = nome;
        if (email) user.email = email;
        if (telefone) user.telefone = telefone;
        if (cpf) user.cpf = cpf;
        
        // Se estiver atualizando a senha, criptografar
        if (senha) {
            user.senha = await bcrypt.hash(senha, 10);
        }

        // Salvar no banco de dados
        await userRepository.save(user);

        // Retornar os dados atualizados (sem a senha)
        const { senha: _, ...userWithoutPassword } = user;
        
        return res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return res.status(500).json({
            erro: "Erro ao atualizar usuário",
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

// Excluir usuário
export const deleteUser = async (req: AuthRequest, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }

    const { id } = req.params;

    try {
        // Verificar se o usuário existe
        const user = await userRepository.findOne({ where: { id } });
        
        if (!user) {
            return res.status(404).json({
                erro: "Usuário não encontrado",
                errors: [
                    {
                        msg: "Usuário com este ID não existe",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        // Verificar se o usuário tem pedidos
        const userOrders = await orderRepository.findOne({ where: { usuarioId: id } });
        
        if (userOrders) {
            return res.status(400).json({
                erro: "Usuário possui pedidos",
                errors: [
                    {
                        msg: "Não é possível excluir um usuário que possui pedidos",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        // Excluir usuário
        await userRepository.remove(user);
        
        return res.status(200).json({
            message: "Usuário excluído com sucesso"
        });
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        return res.status(500).json({
            erro: "Erro ao excluir usuário",
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
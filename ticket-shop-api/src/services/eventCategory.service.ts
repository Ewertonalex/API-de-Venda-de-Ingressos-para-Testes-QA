import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppDataSource } from "../database/data-source";
import { EventCategory } from "../entities/EventCategory";
import { Event } from "../entities/Event";

// Repositórios
const categoryRepository = AppDataSource.getRepository(EventCategory);
const eventRepository = AppDataSource.getRepository(Event);

// Obter todas as categorias
export const getAllCategories = async (req: Request, res: Response) => {
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
        const query = categoryRepository.createQueryBuilder("category");
        
        // Aplicar filtro por nome se fornecido
        if (req.query.nome) {
            query.where("category.nome LIKE :nome", { nome: `%${req.query.nome}%` });
        }
        
        // Executar query
        const categories = await query.getMany();
        
        return res.status(200).json(categories);
    } catch (error) {
        console.error("Erro ao listar categorias:", error);
        return res.status(500).json({
            erro: "Erro ao listar categorias",
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

// Obter categoria por ID
export const getCategoryById = async (req: Request, res: Response) => {
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
        // Buscar categoria com eventos relacionados
        const category = await categoryRepository.findOne({
            where: { id },
            relations: ["eventos"]
        });
        
        if (!category) {
            return res.status(404).json({
                erro: "Categoria não encontrada",
                errors: [
                    {
                        msg: "Categoria com este ID não existe",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        return res.status(200).json(category);
    } catch (error) {
        console.error("Erro ao buscar categoria:", error);
        return res.status(500).json({
            erro: "Erro ao buscar categoria",
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

// Criar categoria
export const createCategory = async (req: Request, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }

    const { nome, descricao, iconeUrl } = req.body;

    try {
        // Verificar se já existe categoria com este nome
        const existingCategory = await categoryRepository.findOne({ where: { nome } });
        
        if (existingCategory) {
            return res.status(400).json({
                erro: "Categoria já existe",
                errors: [
                    {
                        msg: "Já existe uma categoria com este nome",
                        param: "nome",
                        location: "body"
                    }
                ]
            });
        }

        // Criar nova categoria
        const category = categoryRepository.create({
            nome,
            descricao,
            iconeUrl,
            dataCriacao: new Date()
        });

        // Salvar no banco de dados
        await categoryRepository.save(category);
        
        return res.status(201).json(category);
    } catch (error) {
        console.error("Erro ao criar categoria:", error);
        return res.status(500).json({
            erro: "Erro ao criar categoria",
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

// Atualizar categoria
export const updateCategory = async (req: Request, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }

    const { id } = req.params;
    const { nome, descricao, iconeUrl } = req.body;

    try {
        // Verificar se a categoria existe
        const category = await categoryRepository.findOne({ where: { id } });
        
        if (!category) {
            return res.status(404).json({
                erro: "Categoria não encontrada",
                errors: [
                    {
                        msg: "Categoria com este ID não existe",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        // Se estiver atualizando o nome, verificar se já existe outra categoria com este nome
        if (nome && nome !== category.nome) {
            const existingCategory = await categoryRepository.findOne({ where: { nome } });
            
            if (existingCategory) {
                return res.status(400).json({
                    erro: "Nome de categoria já existe",
                    errors: [
                        {
                            msg: "Já existe uma categoria com este nome",
                            param: "nome",
                            location: "body"
                        }
                    ]
                });
            }
        }

        // Atualizar dados da categoria
        if (nome) category.nome = nome;
        if (descricao !== undefined) category.descricao = descricao;
        if (iconeUrl !== undefined) category.iconeUrl = iconeUrl;

        // Salvar no banco de dados
        await categoryRepository.save(category);
        
        return res.status(200).json(category);
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        return res.status(500).json({
            erro: "Erro ao atualizar categoria",
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

// Excluir categoria
export const deleteCategory = async (req: Request, res: Response) => {
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
        // Verificar se a categoria existe
        const category = await categoryRepository.findOne({ where: { id } });
        
        if (!category) {
            return res.status(404).json({
                erro: "Categoria não encontrada",
                errors: [
                    {
                        msg: "Categoria com este ID não existe",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        // Verificar se existem eventos nesta categoria
        const categoryEvents = await eventRepository.findOne({ where: { categoriaId: id } });
        
        if (categoryEvents) {
            return res.status(400).json({
                erro: "Categoria possui eventos",
                errors: [
                    {
                        msg: "Não é possível excluir uma categoria que possui eventos vinculados",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        // Excluir categoria
        await categoryRepository.remove(category);
        
        return res.status(200).json({
            message: "Categoria excluída com sucesso"
        });
    } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        return res.status(500).json({
            erro: "Erro ao excluir categoria",
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
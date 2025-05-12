import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppDataSource } from "../database/data-source";
import { Event } from "../entities/Event";
import { EventCategory } from "../entities/EventCategory";
import { TicketType } from "../entities/TicketType";
import { AuthRequest } from "../middleware/auth.middleware";

// Repositórios
const eventRepository = AppDataSource.getRepository(Event);
const categoryRepository = AppDataSource.getRepository(EventCategory);
const ticketTypeRepository = AppDataSource.getRepository(TicketType);

// Obter todos os eventos
export const getAllEvents = async (req: Request, res: Response) => {
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
        const query = eventRepository.createQueryBuilder("event")
            .leftJoinAndSelect("event.categoria", "categoria");
        
        // Aplicar filtros se fornecidos
        if (req.query.nome) {
            query.andWhere("event.nome LIKE :nome", { nome: `%${req.query.nome}%` });
        }
        
        if (req.query.categoriaId) {
            query.andWhere("event.categoriaId = :categoriaId", { categoriaId: req.query.categoriaId });
        }
        
        if (req.query.ativo !== undefined) {
            query.andWhere("event.ativo = :ativo", { ativo: req.query.ativo === 'true' });
        }
        
        // Executar query
        const events = await query.getMany();
        
        return res.status(200).json(events);
    } catch (error) {
        console.error("Erro ao listar eventos:", error);
        return res.status(500).json({
            erro: "Erro ao listar eventos",
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

// Obter evento por ID
export const getEventById = async (req: Request, res: Response) => {
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
        // Buscar evento com relações
        const event = await eventRepository.findOne({
            where: { id },
            relations: ["categoria", "tiposIngressos"]
        });
        
        if (!event) {
            return res.status(404).json({
                erro: "Evento não encontrado",
                errors: [
                    {
                        msg: "Evento com este ID não existe",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        return res.status(200).json(event);
    } catch (error) {
        console.error("Erro ao buscar evento:", error);
        return res.status(500).json({
            erro: "Erro ao buscar evento",
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

// Criar evento
export const createEvent = async (req: AuthRequest, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }

    const { 
        nome, 
        descricao, 
        local, 
        dataInicio, 
        dataFim, 
        imagemUrl, 
        ativo, 
        categoriaId 
    } = req.body;

    try {
        // Verificar se a categoria existe
        const category = await categoryRepository.findOne({ where: { id: categoriaId } });
        
        if (!category) {
            return res.status(404).json({
                erro: "Categoria não encontrada",
                errors: [
                    {
                        msg: "Categoria com este ID não existe",
                        param: "categoriaId",
                        location: "body"
                    }
                ]
            });
        }

        // Criar novo evento
        const event = eventRepository.create({
            nome,
            descricao,
            local,
            dataInicio: new Date(dataInicio),
            dataFim: dataFim ? new Date(dataFim) : null,
            imagemUrl,
            ativo: ativo !== undefined ? ativo : true,
            categoriaId,
            dataCriacao: new Date()
        });

        // Salvar no banco de dados
        await eventRepository.save(event);
        
        // Buscar evento com relações para retornar
        const savedEvent = await eventRepository.findOne({
            where: { id: event.id },
            relations: ["categoria"]
        });
        
        return res.status(201).json(savedEvent);
    } catch (error) {
        console.error("Erro ao criar evento:", error);
        return res.status(500).json({
            erro: "Erro ao criar evento",
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

// Atualizar evento
export const updateEvent = async (req: AuthRequest, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }

    const { id } = req.params;
    const { 
        nome, 
        descricao, 
        local, 
        dataInicio, 
        dataFim, 
        imagemUrl, 
        ativo, 
        categoriaId 
    } = req.body;

    try {
        // Verificar se o evento existe
        const event = await eventRepository.findOne({ where: { id } });
        
        if (!event) {
            return res.status(404).json({
                erro: "Evento não encontrado",
                errors: [
                    {
                        msg: "Evento com este ID não existe",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        // Se estiver atualizando a categoria, verificar se ela existe
        if (categoriaId && categoriaId !== event.categoriaId) {
            const category = await categoryRepository.findOne({ where: { id: categoriaId } });
            
            if (!category) {
                return res.status(404).json({
                    erro: "Categoria não encontrada",
                    errors: [
                        {
                            msg: "Categoria com este ID não existe",
                            param: "categoriaId",
                            location: "body"
                        }
                    ]
                });
            }
            
            event.categoriaId = categoriaId;
        }

        // Atualizar dados do evento
        if (nome) event.nome = nome;
        if (descricao !== undefined) event.descricao = descricao;
        if (local) event.local = local;
        if (dataInicio) event.dataInicio = new Date(dataInicio);
        if (dataFim !== undefined) event.dataFim = dataFim ? new Date(dataFim) : null;
        if (imagemUrl !== undefined) event.imagemUrl = imagemUrl;
        if (ativo !== undefined) event.ativo = ativo;

        // Salvar no banco de dados
        await eventRepository.save(event);
        
        // Buscar evento com relações para retornar
        const updatedEvent = await eventRepository.findOne({
            where: { id },
            relations: ["categoria"]
        });
        
        return res.status(200).json(updatedEvent);
    } catch (error) {
        console.error("Erro ao atualizar evento:", error);
        return res.status(500).json({
            erro: "Erro ao atualizar evento",
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

// Excluir evento
export const deleteEvent = async (req: AuthRequest, res: Response) => {
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
        // Verificar se o evento existe
        const event = await eventRepository.findOne({ where: { id } });
        
        if (!event) {
            return res.status(404).json({
                erro: "Evento não encontrado",
                errors: [
                    {
                        msg: "Evento com este ID não existe",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        // Verificar se o evento tem tipos de ingressos
        const eventTicketTypes = await ticketTypeRepository.findOne({ where: { eventoId: id } });
        
        if (eventTicketTypes) {
            return res.status(400).json({
                erro: "Evento possui tipos de ingressos",
                errors: [
                    {
                        msg: "Não é possível excluir um evento que possui tipos de ingressos vinculados",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }

        // Excluir evento
        await eventRepository.remove(event);
        
        return res.status(200).json({
            message: "Evento excluído com sucesso"
        });
    } catch (error) {
        console.error("Erro ao excluir evento:", error);
        return res.status(500).json({
            erro: "Erro ao excluir evento",
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
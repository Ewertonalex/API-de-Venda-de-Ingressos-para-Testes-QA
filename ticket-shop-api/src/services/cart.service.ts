import { Response } from "express";
import { validationResult } from "express-validator";
import { AppDataSource } from "../database/data-source";
import { AuthRequest } from "../middleware/auth.middleware";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";
import { TicketType } from "../entities/TicketType";

// Repositórios
const cartRepository = AppDataSource.getRepository(Cart);
const cartItemRepository = AppDataSource.getRepository(CartItem);
const ticketTypeRepository = AppDataSource.getRepository(TicketType);

// Obter ou criar o carrinho ativo do usuário
const getOrCreateActiveCart = async (userId: string): Promise<Cart> => {
    // Buscar carrinho ativo do usuário
    let cart = await cartRepository.findOne({
        where: { usuarioId: userId, ativo: true },
        relations: ["itens", "itens.tipoIngresso"]
    });
    
    // Se não tiver um carrinho ativo, criar um novo
    if (!cart) {
        cart = cartRepository.create({
            usuarioId: userId,
            ativo: true,
            dataCriacao: new Date(),
            itens: []
        });
        
        await cartRepository.save(cart);
    }
    
    return cart;
};

// Obter carrinho do usuário
export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        // Obter ID do usuário do token
        const userId = req.userId;
        
        if (!userId) {
            return res.status(401).json({
                erro: "Não autorizado",
                errors: [
                    {
                        msg: "Usuário não autenticado",
                        param: "authorization",
                        location: "header"
                    }
                ]
            });
        }
        
        // Obter carrinho ativo
        const cart = await getOrCreateActiveCart(userId);
        
        // Calcular valor total
        let valorTotal = 0;
        
        for (const item of cart.itens) {
            valorTotal += Number(item.precoUnitario) * item.quantidade;
        }
        
        return res.status(200).json({
            id: cart.id,
            dataCriacao: cart.dataCriacao,
            itens: cart.itens,
            valorTotal
        });
    } catch (error) {
        console.error("Erro ao buscar carrinho:", error);
        return res.status(500).json({
            erro: "Erro ao buscar carrinho",
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

// Adicionar item ao carrinho
export const addItemToCart = async (req: AuthRequest, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }
    
    const { tipoIngressoId, quantidade } = req.body;
    const userId = req.userId;
    
    if (!userId) {
        return res.status(401).json({
            erro: "Não autorizado",
            errors: [
                {
                    msg: "Usuário não autenticado",
                    param: "authorization",
                    location: "header"
                }
            ]
        });
    }
    
    try {
        // Verificar se o tipo de ingresso existe
        const ticketType = await ticketTypeRepository.findOne({ where: { id: tipoIngressoId } });
        
        if (!ticketType) {
            return res.status(404).json({
                erro: "Tipo de ingresso não encontrado",
                errors: [
                    {
                        msg: "Tipo de ingresso com este ID não existe",
                        param: "tipoIngressoId",
                        location: "body"
                    }
                ]
            });
        }
        
        // Verificar se o tipo de ingresso está ativo
        if (!ticketType.ativo) {
            return res.status(400).json({
                erro: "Tipo de ingresso inativo",
                errors: [
                    {
                        msg: "Este tipo de ingresso não está disponível para compra",
                        param: "tipoIngressoId",
                        location: "body"
                    }
                ]
            });
        }
        
        // Verificar se está no período de vendas
        const now = new Date();
        
        if (now < ticketType.dataInicioVenda) {
            return res.status(400).json({
                erro: "Vendas não iniciadas",
                errors: [
                    {
                        msg: "As vendas para este tipo de ingresso ainda não foram iniciadas",
                        param: "tipoIngressoId",
                        location: "body"
                    }
                ]
            });
        }
        
        if (ticketType.dataFimVenda && now > ticketType.dataFimVenda) {
            return res.status(400).json({
                erro: "Vendas encerradas",
                errors: [
                    {
                        msg: "As vendas para este tipo de ingresso já foram encerradas",
                        param: "tipoIngressoId",
                        location: "body"
                    }
                ]
            });
        }
        
        // Verificar disponibilidade
        if (quantidade > ticketType.quantidadeDisponivel) {
            return res.status(400).json({
                erro: "Quantidade indisponível",
                errors: [
                    {
                        msg: `Apenas ${ticketType.quantidadeDisponivel} ingressos disponíveis`,
                        param: "quantidade",
                        location: "body"
                    }
                ]
            });
        }
        
        // Obter carrinho ativo
        const cart = await getOrCreateActiveCart(userId);
        
        // Verificar se o item já existe no carrinho
        let cartItem = cart.itens.find(item => item.tipoIngressoId === tipoIngressoId);
        
        if (cartItem) {
            // Se já existe, atualizar quantidade
            const novaQuantidade = cartItem.quantidade + quantidade;
            
            // Verificar se a nova quantidade é válida
            if (novaQuantidade > ticketType.quantidadeDisponivel) {
                return res.status(400).json({
                    erro: "Quantidade indisponível",
                    errors: [
                        {
                            msg: `Você já tem ${cartItem.quantidade} ingressos deste tipo no carrinho. Apenas ${ticketType.quantidadeDisponivel} disponíveis no total.`,
                            param: "quantidade",
                            location: "body"
                        }
                    ]
                });
            }
            
            cartItem.quantidade = novaQuantidade;
            await cartItemRepository.save(cartItem);
        } else {
            // Se não existe, criar novo item
            cartItem = cartItemRepository.create({
                carrinhoId: cart.id,
                tipoIngressoId,
                quantidade,
                precoUnitario: ticketType.preco,
                dataCriacao: new Date()
            });
            
            await cartItemRepository.save(cartItem);
        }
        
        // Buscar carrinho atualizado
        const updatedCart = await cartRepository.findOne({
            where: { id: cart.id },
            relations: ["itens", "itens.tipoIngresso"]
        });
        
        // Calcular valor total
        let valorTotal = 0;
        
        if (updatedCart && updatedCart.itens) {
            for (const item of updatedCart.itens) {
                valorTotal += Number(item.precoUnitario) * item.quantidade;
            }
        }
        
        return res.status(201).json({
            id: updatedCart?.id,
            dataCriacao: updatedCart?.dataCriacao,
            itens: updatedCart?.itens,
            valorTotal
        });
    } catch (error) {
        console.error("Erro ao adicionar item ao carrinho:", error);
        return res.status(500).json({
            erro: "Erro ao adicionar item ao carrinho",
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

// Atualizar quantidade de um item no carrinho
export const updateCartItem = async (req: AuthRequest, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }
    
    const { id } = req.params;
    const { quantidade } = req.body;
    const userId = req.userId;
    
    if (!userId) {
        return res.status(401).json({
            erro: "Não autorizado",
            errors: [
                {
                    msg: "Usuário não autenticado",
                    param: "authorization",
                    location: "header"
                }
            ]
        });
    }
    
    try {
        // Buscar carrinho ativo do usuário
        const cart = await cartRepository.findOne({
            where: { usuarioId: userId, ativo: true },
            relations: ["itens"]
        });
        
        if (!cart) {
            return res.status(404).json({
                erro: "Carrinho não encontrado",
                errors: [
                    {
                        msg: "Você não possui um carrinho ativo",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }
        
        // Buscar o item no carrinho
        const cartItem = await cartItemRepository.findOne({ 
            where: { id, carrinhoId: cart.id },
            relations: ["tipoIngresso"]
        });
        
        if (!cartItem) {
            return res.status(404).json({
                erro: "Item não encontrado",
                errors: [
                    {
                        msg: "Item não encontrado no seu carrinho",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }
        
        // Verificar disponibilidade
        if (quantidade > cartItem.tipoIngresso.quantidadeDisponivel) {
            return res.status(400).json({
                erro: "Quantidade indisponível",
                errors: [
                    {
                        msg: `Apenas ${cartItem.tipoIngresso.quantidadeDisponivel} ingressos disponíveis`,
                        param: "quantidade",
                        location: "body"
                    }
                ]
            });
        }
        
        // Atualizar quantidade
        cartItem.quantidade = quantidade;
        await cartItemRepository.save(cartItem);
        
        // Buscar carrinho atualizado
        const updatedCart = await cartRepository.findOne({
            where: { id: cart.id },
            relations: ["itens", "itens.tipoIngresso"]
        });
        
        // Calcular valor total
        let valorTotal = 0;
        
        if (updatedCart && updatedCart.itens) {
            for (const item of updatedCart.itens) {
                valorTotal += Number(item.precoUnitario) * item.quantidade;
            }
        }
        
        return res.status(200).json({
            id: updatedCart?.id,
            dataCriacao: updatedCart?.dataCriacao,
            itens: updatedCart?.itens,
            valorTotal
        });
    } catch (error) {
        console.error("Erro ao atualizar item do carrinho:", error);
        return res.status(500).json({
            erro: "Erro ao atualizar item do carrinho",
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

// Remover item do carrinho
export const removeCartItem = async (req: AuthRequest, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            erro: "Dados inválidos",
            errors: errors.array()
        });
    }
    
    const { id } = req.params;
    const userId = req.userId;
    
    if (!userId) {
        return res.status(401).json({
            erro: "Não autorizado",
            errors: [
                {
                    msg: "Usuário não autenticado",
                    param: "authorization",
                    location: "header"
                }
            ]
        });
    }
    
    try {
        // Buscar carrinho ativo do usuário
        const cart = await cartRepository.findOne({
            where: { usuarioId: userId, ativo: true },
            relations: ["itens"]
        });
        
        if (!cart) {
            return res.status(404).json({
                erro: "Carrinho não encontrado",
                errors: [
                    {
                        msg: "Você não possui um carrinho ativo",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }
        
        // Buscar o item no carrinho
        const cartItem = await cartItemRepository.findOne({ 
            where: { id, carrinhoId: cart.id } 
        });
        
        if (!cartItem) {
            return res.status(404).json({
                erro: "Item não encontrado",
                errors: [
                    {
                        msg: "Item não encontrado no seu carrinho",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }
        
        // Remover item
        await cartItemRepository.remove(cartItem);
        
        // Buscar carrinho atualizado
        const updatedCart = await cartRepository.findOne({
            where: { id: cart.id },
            relations: ["itens", "itens.tipoIngresso"]
        });
        
        // Calcular valor total
        let valorTotal = 0;
        
        if (updatedCart && updatedCart.itens) {
            for (const item of updatedCart.itens) {
                valorTotal += Number(item.precoUnitario) * item.quantidade;
            }
        }
        
        return res.status(200).json({
            id: updatedCart?.id,
            dataCriacao: updatedCart?.dataCriacao,
            itens: updatedCart?.itens,
            valorTotal
        });
    } catch (error) {
        console.error("Erro ao remover item do carrinho:", error);
        return res.status(500).json({
            erro: "Erro ao remover item do carrinho",
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

// Limpar carrinho (remover todos os itens)
export const clearCart = async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    
    if (!userId) {
        return res.status(401).json({
            erro: "Não autorizado",
            errors: [
                {
                    msg: "Usuário não autenticado",
                    param: "authorization",
                    location: "header"
                }
            ]
        });
    }
    
    try {
        // Buscar carrinho ativo do usuário
        const cart = await cartRepository.findOne({
            where: { usuarioId: userId, ativo: true },
            relations: ["itens"]
        });
        
        if (!cart) {
            return res.status(404).json({
                erro: "Carrinho não encontrado",
                errors: [
                    {
                        msg: "Você não possui um carrinho ativo",
                        param: "id",
                        location: "params"
                    }
                ]
            });
        }
        
        // Remover todos os itens
        await cartItemRepository.remove(cart.itens);
        
        return res.status(200).json({
            message: "Carrinho esvaziado com sucesso",
            id: cart.id,
            dataCriacao: cart.dataCriacao,
            itens: [],
            valorTotal: 0
        });
    } catch (error) {
        console.error("Erro ao limpar carrinho:", error);
        return res.status(500).json({
            erro: "Erro ao limpar carrinho",
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
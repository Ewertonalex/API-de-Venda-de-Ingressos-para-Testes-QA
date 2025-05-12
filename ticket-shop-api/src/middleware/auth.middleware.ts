import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Verificar se o header de autorização foi enviado
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            erro: "Token de autenticação não fornecido",
            errors: [
                {
                    msg: "É necessário estar autenticado para acessar este recurso",
                    param: "authorization",
                    location: "header"
                }
            ]
        });
    }

    // O formato do token deve ser: Bearer TOKEN
    const parts = authHeader.split(" ");
    
    if (parts.length !== 2) {
        return res.status(401).json({
            erro: "Formato de token inválido",
            errors: [
                {
                    msg: "O token deve estar no formato: Bearer TOKEN",
                    param: "authorization",
                    location: "header"
                }
            ]
        });
    }

    const [scheme, token] = parts;
    
    // Verificar se o token começa com Bearer
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({
            erro: "Formato de token inválido",
            errors: [
                {
                    msg: "O token deve estar no formato: Bearer TOKEN",
                    param: "authorization",
                    location: "header"
                }
            ]
        });
    }

    // Verificar se o token é válido
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
            id: string;
            role: string;
        };
        
        // Adicionar o ID do usuário autenticado na requisição
        req.userId = decoded.id;
        req.userRole = decoded.role;
        
        return next();
    } catch (error) {
        return res.status(401).json({
            erro: "Token inválido ou expirado",
            errors: [
                {
                    msg: "O token fornecido é inválido ou expirou",
                    param: "authorization",
                    location: "header"
                }
            ]
        });
    }
};

export const checkRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userRole) {
            return res.status(401).json({
                erro: "Não autorizado",
                errors: [
                    {
                        msg: "É necessário estar autenticado para acessar este recurso",
                        param: "authorization",
                        location: "header"
                    }
                ]
            });
        }

        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                erro: "Acesso negado",
                errors: [
                    {
                        msg: "Você não tem permissão para acessar este recurso",
                        param: "role",
                        location: "token"
                    }
                ]
            });
        }

        return next();
    };
}; 
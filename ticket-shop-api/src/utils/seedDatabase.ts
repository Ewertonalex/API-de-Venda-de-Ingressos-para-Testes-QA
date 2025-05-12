import bcrypt from "bcryptjs";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";
import { EventCategory } from "../entities/EventCategory";

// Função para inserir dados iniciais no banco de dados
export const seedDatabase = async () => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const categoryRepository = AppDataSource.getRepository(EventCategory);

        // Verificar se já existem dados
        const adminExists = await userRepository.findOne({ where: { role: "ADMIN" } });
        
        if (!adminExists) {
            // Criar usuário administrador
            const hashedPassword = await bcrypt.hash("admin123", 10);
            
            const admin = userRepository.create({
                nome: "Administrador",
                email: "admin@ticketshop.com",
                senha: hashedPassword,
                telefone: "11999999999",
                cpf: "12345678900",
                role: "ADMIN",
                dataCriacao: new Date()
            });
            
            await userRepository.save(admin);
            console.log("✅ Usuário administrador criado com sucesso!");
        }

        // Criar categorias de eventos base, se não existirem
        const categoriasBase = [
            { nome: "Shows", descricao: "Eventos musicais" },
            { nome: "Esportes", descricao: "Eventos esportivos" },
            { nome: "Teatro", descricao: "Peças e espetáculos teatrais" },
            { nome: "Cinema", descricao: "Sessões de cinema" },
            { nome: "Cursos", descricao: "Cursos e workshops" }
        ];

        for (const categoria of categoriasBase) {
            const exists = await categoryRepository.findOne({ where: { nome: categoria.nome } });
            
            if (!exists) {
                const newCategory = categoryRepository.create({
                    nome: categoria.nome,
                    descricao: categoria.descricao,
                    dataCriacao: new Date()
                });
                
                await categoryRepository.save(newCategory);
                console.log(`✅ Categoria "${categoria.nome}" criada com sucesso!`);
            }
        }

        console.log("✅ Dados iniciais inseridos com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao inserir dados iniciais:", error);
    }
}; 
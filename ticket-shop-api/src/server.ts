import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./database/data-source";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import swaggerUi from "swagger-ui-express";
import { seedDatabase } from "./utils/seedDatabase";

// Importação das rotas
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { eventCategoryRoutes } from "./routes/eventCategory.routes";
import { eventRoutes } from "./routes/event.routes";
import { ticketTypeRoutes } from "./routes/ticketType.routes";
import { orderRoutes } from "./routes/order.routes";
import { ticketRoutes } from "./routes/ticket.routes";
import { cartRoutes } from "./routes/cart.routes";

// Inicialização do Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger Setup
const swaggerFile = fs.readFileSync(path.resolve(__dirname, "../swagger.yaml"), "utf8");
const swaggerDocument = YAML.parse(swaggerFile);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas
app.use("/auth", authRoutes);
app.use("/usuarios", userRoutes);
app.use("/categorias", eventCategoryRoutes);
app.use("/eventos", eventRoutes);
app.use("/tipos-ingressos", ticketTypeRoutes);
app.use("/pedidos", orderRoutes);
app.use("/ingressos", ticketRoutes);
app.use("/carrinho", cartRoutes);

// Rota padrão
app.get("/", (req, res) => {
  res.send({
    message: "API de Venda de Ingressos para testes QA",
    version: "1.0.0",
    documentation: "/api-docs"
  });
});

// Inicialização do banco de dados e servidor
AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Conexão com o banco de dados estabelecida");
    
    // Inserir dados iniciais no banco de dados
    await seedDatabase();
    
    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
      console.log(`📚 Documentação disponível em http://localhost:${PORT}/api-docs`);
      console.log(`\nCredenciais de administrador:`);
      console.log(`Email: admin@ticketshop.com`);
      console.log(`Senha: admin123`);
    });
  })
  .catch((error) => console.log("❌ Erro ao conectar ao banco de dados:", error)); 
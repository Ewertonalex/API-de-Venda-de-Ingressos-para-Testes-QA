import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from "typeorm";
import { Order } from "./Order";
import { Cart } from "./Cart";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    nome: string;

    @Column()
    @Index({ unique: true })
    email: string;

    @Column({ select: false })
    senha: string;

    @Column({ nullable: true })
    telefone: string;

    @Column({ nullable: true })
    cpf: string;

    @Column({ default: "CLIENTE" })
    role: string; // ADMIN, ORGANIZADOR, CLIENTE

    @CreateDateColumn({ name: "data_criacao" })
    dataCriacao: Date;

    @OneToMany(() => Order, order => order.usuario)
    pedidos: Order[];
    
    @OneToMany(() => Cart, carrinho => carrinho.usuario)
    carrinhos: Cart[];
} 
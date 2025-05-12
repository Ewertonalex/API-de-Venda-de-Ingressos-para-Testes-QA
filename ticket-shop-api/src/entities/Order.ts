import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { Ticket } from "./Ticket";

@Entity("orders")
export class Order {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    codigo: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    valorTotal: number;

    @Column()
    status: string; // PENDENTE, PAGO, CANCELADO

    @Column({ name: "forma_pagamento", nullable: true })
    formaPagamento: string; // CARTAO, PIX, BOLETO

    @Column({ name: "data_pagamento", nullable: true })
    dataPagamento: Date;

    @Column({ name: "usuario_id" })
    usuarioId: string;

    @ManyToOne(() => User, usuario => usuario.pedidos)
    @JoinColumn({ name: "usuario_id" })
    usuario: User;

    @CreateDateColumn({ name: "data_criacao" })
    dataCriacao: Date;

    @OneToMany(() => Ticket, ingresso => ingresso.pedido)
    ingressos: Ticket[];
} 
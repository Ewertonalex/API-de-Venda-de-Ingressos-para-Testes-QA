import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { TicketType } from "./TicketType";
import { Order } from "./Order";

@Entity("tickets")
export class Ticket {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    codigo: string;

    @Column({ default: false })
    utilizado: boolean;

    @Column({ name: "data_utilizacao", nullable: true })
    dataUtilizacao: Date;

    @Column({ name: "tipo_ingresso_id" })
    tipoIngressoId: string;

    @ManyToOne(() => TicketType, tipoIngresso => tipoIngresso.ingressos)
    @JoinColumn({ name: "tipo_ingresso_id" })
    tipoIngresso: TicketType;

    @Column({ name: "pedido_id" })
    pedidoId: string;

    @ManyToOne(() => Order, pedido => pedido.ingressos)
    @JoinColumn({ name: "pedido_id" })
    pedido: Order;

    @CreateDateColumn({ name: "data_criacao" })
    dataCriacao: Date;
} 
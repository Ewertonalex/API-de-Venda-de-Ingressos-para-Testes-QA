import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Event } from "./Event";
import { Ticket } from "./Ticket";
import { CartItem } from "./CartItem";

@Entity("ticket_types")
export class TicketType {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    nome: string;

    @Column({ type: "text", nullable: true })
    descricao: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    preco: number;

    @Column({ name: "quantidade_disponivel" })
    quantidadeDisponivel: number;

    @Column({ name: "data_inicio_venda" })
    dataInicioVenda: Date;

    @Column({ name: "data_fim_venda", nullable: true })
    dataFimVenda: Date;

    @Column({ default: true })
    ativo: boolean;

    @Column({ name: "evento_id" })
    eventoId: string;

    @ManyToOne(() => Event, evento => evento.tiposIngressos)
    @JoinColumn({ name: "evento_id" })
    evento: Event;

    @CreateDateColumn({ name: "data_criacao" })
    dataCriacao: Date;

    @OneToMany(() => Ticket, ingresso => ingresso.tipoIngresso)
    ingressos: Ticket[];
    
    @OneToMany(() => CartItem, item => item.tipoIngresso)
    itensCarrinho: CartItem[];
} 
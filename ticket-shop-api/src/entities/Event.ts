import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { TicketType } from "./TicketType";
import { EventCategory } from "./EventCategory";

@Entity("events")
export class Event {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    nome: string;

    @Column({ type: "text" })
    descricao: string;

    @Column()
    local: string;

    @Column({ name: "data_inicio" })
    dataInicio: Date;

    @Column({ name: "data_fim", nullable: true })
    dataFim: Date;

    @Column({ name: "imagem_url", nullable: true })
    imagemUrl: string;

    @Column({ default: true })
    ativo: boolean;

    @Column({ name: "categoria_id" })
    categoriaId: string;

    @ManyToOne(() => EventCategory, categoria => categoria.eventos)
    @JoinColumn({ name: "categoria_id" })
    categoria: EventCategory;

    @CreateDateColumn({ name: "data_criacao" })
    dataCriacao: Date;

    @OneToMany(() => TicketType, tipoIngresso => tipoIngresso.evento)
    tiposIngressos: TicketType[];
} 
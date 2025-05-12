import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from "typeorm";
import { Event } from "./Event";

@Entity("event_categories")
export class EventCategory {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Index({ unique: true })
    nome: string;

    @Column({ nullable: true })
    descricao: string;

    @Column({ name: "icone_url", nullable: true })
    iconeUrl: string;

    @CreateDateColumn({ name: "data_criacao" })
    dataCriacao: Date;

    @OneToMany(() => Event, evento => evento.categoria)
    eventos: Event[];
} 
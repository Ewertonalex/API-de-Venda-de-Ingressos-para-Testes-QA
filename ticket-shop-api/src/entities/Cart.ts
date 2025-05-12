import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { CartItem } from "./CartItem";

@Entity("carts")
export class Cart {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: "usuario_id" })
    usuarioId: string;

    @ManyToOne(() => User, user => user.carrinhos)
    @JoinColumn({ name: "usuario_id" })
    usuario: User;

    @Column({ default: true })
    ativo: boolean;

    @CreateDateColumn({ name: "data_criacao" })
    dataCriacao: Date;

    @OneToMany(() => CartItem, item => item.carrinho, { cascade: true })
    itens: CartItem[];
} 
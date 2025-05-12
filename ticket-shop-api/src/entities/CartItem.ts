import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Cart } from "./Cart";
import { TicketType } from "./TicketType";

@Entity("cart_items")
export class CartItem {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: "carrinho_id" })
    carrinhoId: string;
    
    @ManyToOne(() => Cart, carrinho => carrinho.itens)
    @JoinColumn({ name: "carrinho_id" })
    carrinho: Cart;

    @Column({ name: "tipo_ingresso_id" })
    tipoIngressoId: string;
    
    @ManyToOne(() => TicketType, tipoIngresso => tipoIngresso.itensCarrinho)
    @JoinColumn({ name: "tipo_ingresso_id" })
    tipoIngresso: TicketType;

    @Column()
    quantidade: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    precoUnitario: number;

    @CreateDateColumn({ name: "data_criacao" })
    dataCriacao: Date;
} 
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { EventCategory } from "../entities/EventCategory";
import { Event } from "../entities/Event";
import { TicketType } from "../entities/TicketType";
import { Order } from "../entities/Order";
import { Ticket } from "../entities/Ticket";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [User, EventCategory, Event, TicketType, Order, Ticket, Cart, CartItem],
    migrations: [],
    subscribers: [],
}); 
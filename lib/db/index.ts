import { Tables } from "./database.types";

export * from "./database.types";
export type Profile = Tables<"profiles">;
export type Customer = Tables<"customers">;

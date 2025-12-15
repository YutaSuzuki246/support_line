import { Tables } from "./database.types";

export * from "./database.types";
export type Profile = Tables<"profiles">;
export type Customer = Tables<"customers">;
export type Question = Tables<"questions">;
export type Template = Tables<"templates">;
export type Reply = Tables<"replies">;
export type Escalation = Tables<"escalations">;
export type QuestionNote = Tables<"question_notes">;
export type QuestionMessage = Tables<"question_messages">;

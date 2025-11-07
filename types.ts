import React from 'react';
// Fix: Populating the types file with necessary definitions for the application.
export enum Department {
    CONTABIL = "Contábil",
    FISCAL = "Fiscal",
    DP = "DP",
    FINANCEIRO = "Financeiro",
    SOCIETARIO = "Societário",
}

export enum Role {
    USER = "user",
    MODEL = "model",
    SPECIALIST = "specialist",
}

export interface Message {
    role: Role;
    content: string;
    timestamp?: number;
}

export enum ResolutionStatus {
    RESOLVED = "Resolvido",
    UNRESOLVED = "Não Resolvido",
    FORWARDED = "Encaminhado",
}

export enum AssignmentStatus {
    PENDING = "Pendente",
    ACCEPTED = "Aceito",
}

export interface Assignment {
    specialistId: string;
    status: AssignmentStatus;
}

export interface ClientInfo {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
    cnpj: string;
    assignments?: { [key in Department]?: Assignment };
    password: string | null;
}

export interface Specialist {
    id: string;
    username: string; // login ID
    name: string; // full name
    department: Department;
    password: string | null;
}

export interface ChatSession {
    id: string;
    client: ClientInfo;
    specialist?: Specialist;
    department: Department;
    startTime: number;
    endTime: number;
    transcript: Message[];
    resolution: ResolutionStatus;
    summary: string;
}
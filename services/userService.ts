// Fix: Implementing the user service to manage client and specialist data.
import { ClientInfo, Specialist, Department, AssignmentStatus, Assignment } from '../types';

// Using localStorage to simulate a database.

const CLIENTS_KEY = 'atxContadoresClients';
const SPECIALISTS_KEY = 'atxContadoresSpecialists';
const ANALYTICS_KEY = 'atxContadoresAnalytics';


// --- Seed Data for Demonstration ---
const seedData = () => {
    if (!localStorage.getItem(CLIENTS_KEY) || !localStorage.getItem(SPECIALISTS_KEY)) {
        const initialClients: ClientInfo[] = [
            { 
                id: 'cli_001', 
                companyName: 'Padaria Pão Quente', 
                contactName: 'João Silva', 
                email: 'joao@paoquente.com', 
                cnpj: '11.111.111/0001-11', 
                password: '123',
                assignments: {
                    [Department.CONTABIL]: {
                        specialistId: 'spec_ana.c',
                        status: AssignmentStatus.ACCEPTED,
                    }
                } 
            },
            { id: 'cli_002', companyName: 'Oficina Mecânica Veloz', contactName: 'Maria Souza', email: 'maria@oficinaveloz.com', cnpj: '22.222.222/0001-22', password: null },
        ];
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(initialClients));
        
        const initialSpecialists: Specialist[] = [
            { id: 'spec_ana.c', username: 'ana.c', name: 'Ana Costa', department: Department.CONTABIL, password: '123' },
            { id: 'spec_bruno.f', username: 'bruno.f', name: 'Bruno Fernandes', department: Department.FISCAL, password: null },
        ];
        localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(initialSpecialists));
        // Also clear analytics on seed
        localStorage.removeItem(ANALYTICS_KEY);
    }
};

seedData(); // Initialize with some data if none exists.

// --- Developer Tools ---
export const resetApplicationData = () => {
    localStorage.removeItem(CLIENTS_KEY);
    localStorage.removeItem(SPECIALISTS_KEY);
    localStorage.removeItem(ANALYTICS_KEY);
    seedData(); // Re-seed the data
};


// --- Client Management ---

export const getClients = (): ClientInfo[] => {
    const data = localStorage.getItem(CLIENTS_KEY);
    return data ? JSON.parse(data) : [];
};

export const getClientById = (id: string): ClientInfo | undefined => {
    return getClients().find(c => c.id === id);
};

export const createClient = (clientData: Omit<ClientInfo, 'id' | 'assignments' | 'password'>): ClientInfo => {
    const clients = getClients();
    const newClient: ClientInfo = {
        ...clientData,
        id: `cli_${Date.now()}`.slice(-7),
        password: null,
    };
    clients.push(newClient);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    return newClient;
};

export const setClientPassword = (clientId: string, newPass: string): boolean => {
    const clients = getClients();
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex > -1) {
        clients[clientIndex].password = newPass;
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
        return true;
    }
    return false;
}

export const resetClientPassword = (clientId: string): boolean => {
    const clients = getClients();
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex > -1) {
        clients[clientIndex].password = null;
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
        return true;
    }
    return false;
};

// --- Specialist Management ---

export const getSpecialists = (): Specialist[] => {
    const data = localStorage.getItem(SPECIALISTS_KEY);
    return data ? JSON.parse(data) : [];
};

export const getSpecialistById = (id: string): Specialist | undefined => {
    return getSpecialists().find(s => s.id === id);
};

export const createSpecialist = (specialistData: Omit<Specialist, 'id'|'password'>): Specialist => {
    const specialists = getSpecialists();
    if (specialists.some(s => s.username === specialistData.username)) {
        throw new Error('Este ID de usuário já está em uso.');
    }
    const newSpecialist: Specialist = {
        ...specialistData,
        id: `spec_${specialistData.username}`,
        password: null,
    };
    specialists.push(newSpecialist);
    localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(specialists));
    return newSpecialist;
};

export const setSpecialistPassword = (specialistId: string, newPass: string): boolean => {
    const specialists = getSpecialists();
    const specialistIndex = specialists.findIndex(s => s.id === specialistId);
    if (specialistIndex > -1) {
        specialists[specialistIndex].password = newPass;
        localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(specialists));
        return true;
    }
    return false;
}

export const resetSpecialistPassword = (specialistId: string): boolean => {
    const specialists = getSpecialists();
    const specialistIndex = specialists.findIndex(s => s.id === specialistId);
    if (specialistIndex > -1) {
        specialists[specialistIndex].password = null;
        localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(specialists));
        return true;
    }
    return false;
};

export const deleteSpecialist = (specialistId: string): void => {
    const specialists = getSpecialists();
    const updatedSpecialists = specialists.filter(s => s.id !== specialistId);
    localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(updatedSpecialists));

    // Remove assignments from clients
    const clients = getClients();
    const updatedClients = clients.map(client => {
        if (client.assignments) {
            Object.keys(client.assignments).forEach(deptKey => {
                const department = deptKey as Department;
                if (client.assignments?.[department]?.specialistId === specialistId) {
                    delete client.assignments[department];
                }
            });
        }
        return client;
    });
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(updatedClients));
};


// --- Assignment ---

export const assignSpecialistToClient = (clientId: string, specialistId: string, department: Department): void => {
    const clients = getClients();
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex === -1) throw new Error('Cliente não encontrado.');
    
    const specialist = getSpecialistById(specialistId);
    if (!specialist) throw new Error('Especialista não encontrado.');
    if (specialist.department !== department) throw new Error('O especialista não pertence a este departamento.');

    const newAssignment: Assignment = {
        specialistId,
        status: AssignmentStatus.PENDING,
    };
    
    if (!clients[clientIndex].assignments) {
        clients[clientIndex].assignments = {};
    }
    clients[clientIndex].assignments![department] = newAssignment;

    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
};

export const acceptClientAssignment = (clientId: string, specialistId: string): boolean => {
    const clients = getClients();
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex > -1) {
        const client = clients[clientIndex];
        if (!client.assignments) return false;

        let assignmentUpdated = false;
        // Find the specific assignment for this specialist and update it
        for (const dept in client.assignments) {
            const assignment = client.assignments[dept as Department];
            if (assignment && assignment.specialistId === specialistId && assignment.status === AssignmentStatus.PENDING) {
                assignment.status = AssignmentStatus.ACCEPTED;
                assignmentUpdated = true;
                break; // Assume one pending assignment per specialist per client
            }
        }
        
        if (assignmentUpdated) {
            localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
            return true;
        }
    }
    return false;
}

// --- Authentication ---

export const loginClient = (clientId: string, pass: string): ClientInfo | 'needs_password' | null => {
    const client = getClientById(clientId);
    if (!client) return null;
    if (client.password === null) return 'needs_password';
    if (client.password === pass) return client;
    return null;
}

export const loginSpecialist = (username: string, pass: string): Specialist | 'needs_password' | null => {
    const specialist = getSpecialists().find(s => s.username === username);
    if (!specialist) return null;
    if (specialist.password === null) return 'needs_password';
    if (specialist.password === pass) return specialist;
    return null;
}

export const loginAdmin = (username: string, pass: string): boolean => {
    return username === 'admin' && pass === 'admin123';
}

export const loginDev = (username: string, pass: string): boolean => {
    return username === 'dev' && pass === 'devpass';
};

// Fix: Add the missing 'loginOwner' function to provide authentication for the owner role.
export const loginOwner = (username: string, pass: string): boolean => {
    return username === 'dono' && pass === 'dono123';
};
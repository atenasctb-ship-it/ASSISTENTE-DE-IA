// Fix: Implementing the SpecialistDashboard component.
import React, { useState, useEffect } from 'react';
import { getClients, acceptClientAssignment } from '../services/userService';
// Fix: Added 'Assignment' to the import list to be used for type casting.
import { ClientInfo, Specialist, AssignmentStatus, Department, Assignment } from '../types';

interface SpecialistDashboardProps {
    specialist: Specialist;
    onLogout: () => void;
}

interface ClientWithDept extends ClientInfo {
    assignmentDept: Department;
}

const SpecialistDashboard: React.FC<SpecialistDashboardProps> = ({ specialist, onLogout }) => {
    const [myClients, setMyClients] = useState<ClientInfo[]>([]);
    
    const fetchClients = () => {
        const allClients = getClients();
        const clientsForMe = allClients.filter(client => {
            if (!client.assignments) return false;
            return Object.values(client.assignments).some(
                assignment => assignment?.specialistId === specialist.id
            );
        });
        setMyClients(clientsForMe);
    };

    useEffect(() => {
        fetchClients();
    }, [specialist.id]);

    const handleAccept = (clientId: string) => {
        const success = acceptClientAssignment(clientId, specialist.id);
        if(success) {
            alert(`Atribuição para o cliente aceita.`);
            fetchClients(); // Refresh the list to show the new status
        } else {
            alert(`Não foi possível aceitar a atribuição.`);
        }
    };

    const pendingAssignments = myClients.reduce((acc, client) => {
        if (client.assignments) {
            Object.entries(client.assignments).forEach(([dept, assignment]) => {
                // Fix: Cast 'assignment' from 'unknown' to 'Assignment | undefined' to safely access its properties.
                const currentAssignment = assignment as Assignment | undefined;
                if (currentAssignment?.specialistId === specialist.id && currentAssignment.status === AssignmentStatus.PENDING) {
                    acc.push({ ...client, assignmentDept: dept as Department });
                }
            });
        }
        return acc;
    }, [] as ClientWithDept[]);
    
    const acceptedClients = myClients.reduce((acc, client) => {
        if (client.assignments) {
            const acceptedDepts: Department[] = [];
             Object.entries(client.assignments).forEach(([dept, assignment]) => {
                // Fix: Cast 'assignment' from 'unknown' to 'Assignment | undefined' to safely access its properties.
                const currentAssignment = assignment as Assignment | undefined;
                if (currentAssignment?.specialistId === specialist.id && currentAssignment.status === AssignmentStatus.ACCEPTED) {
                    acceptedDepts.push(dept as Department);
                }
            });
            if(acceptedDepts.length > 0) {
                 acc.push({ ...client, assignmentDepts: acceptedDepts });
            }
        }
        return acc;
    }, [] as (ClientInfo & {assignmentDepts: Department[]})[]);


    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Painel do Especialista</h1>
                        <p className="text-sm text-slate-500">ATX Contadores</p>
                        <p className="text-gray-600 mt-1">Bem-vindo(a), {specialist.name} ({specialist.department})</p>
                    </div>
                    <button onClick={onLogout} className="text-sm text-slate-600 hover:underline">Sair</button>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8 space-y-8">
                {pendingAssignments.length > 0 && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow">
                         <h3 className="text-lg font-semibold mb-2">Novas Atribuições Pendentes</h3>
                         <div className="space-y-2">
                             {pendingAssignments.map(client => (
                                <div key={`${client.id}-${client.assignmentDept}`} className="flex justify-between items-center p-2 bg-white rounded">
                                    <span className="font-medium">{client.companyName} <span className="text-sm font-normal text-gray-600">({client.assignmentDept})</span></span>
                                    <button onClick={() => handleAccept(client.id)} className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600">
                                        Aceitar Cliente
                                    </button>
                                </div>
                             ))}
                         </div>
                    </div>
                )}
                
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Meus Clientes</h3>
                    {acceptedClients.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Empresa</th>
                                        <th className="text-left p-2">Contato</th>
                                        <th className="text-left p-2">Meus Departamentos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {acceptedClients.map(client => (
                                        <tr key={client.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2 font-medium">{client.companyName}</td>
                                            <td className="p-2">{client.contactName}</td>
                                            <td className="p-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {client.assignmentDepts.map(dept => (
                                                        <span key={dept} className="bg-atx-cyan/20 text-atx-dark-blue text-xs font-semibold px-2.5 py-0.5 rounded-full">{dept}</span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>Nenhum cliente aceito em sua carteira no momento.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SpecialistDashboard;
import React, { useState } from 'react';
import { 
    getClients, 
    getSpecialists, 
    createClient, 
    createSpecialist, 
    assignSpecialistToClient,
    deleteSpecialist,
    resetClientPassword,
    resetSpecialistPassword
} from '../services/userService';
import { ClientInfo, Specialist, Department, AssignmentStatus } from '../types';

interface AdminUsersPanelProps {
    onDataChange: () => void;
}

const AdminUsersPanel: React.FC<AdminUsersPanelProps> = ({ onDataChange }) => {
    const [clients, setClients] = useState<ClientInfo[]>(getClients());
    const [specialists, setSpecialists] = useState<Specialist[]>(getSpecialists());

    const [companyName, setCompanyName] = useState('');
    const [contactName, setContactName] = useState('');
    const [email, setEmail] = useState('');
    const [cnpj, setCnpj] = useState('');
    
    const [specialistUsername, setSpecialistUsername] = useState('');
    const [specialistName, setSpecialistName] = useState('');
    const [specialistDept, setSpecialistDept] = useState<Department>(Department.CONTABIL);
    
    // State to hold { [clientId]: { [department]: specialistId } }
    const [assignments, setAssignments] = useState<{[key: string]: {[key: string]: string}}>({});

    const refreshData = () => {
        setClients(getClients());
        setSpecialists(getSpecialists());
        onDataChange();
    };

    const handleCreateClient = (e: React.FormEvent) => {
        e.preventDefault();
        const newClient = createClient({ companyName, contactName, email, cnpj });
        alert(`Cliente "${companyName}" criado com ID ${newClient.id}. Um e-mail simulado foi enviado para ${email} para a criação da senha.`);
        setCompanyName(''); setContactName(''); setEmail(''); setCnpj('');
        refreshData();
    };

    const handleCreateSpecialist = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            createSpecialist({ username: specialistUsername, name: specialistName, department: specialistDept });
            alert(`Especialista "${specialistName}" criado com o ID de usuário "${specialistUsername}".`);
            setSpecialistName('');
            setSpecialistUsername('');
            refreshData();
        } catch (error) {
            if (error instanceof Error) {
                alert(`Erro: ${error.message}`);
            } else {
                alert('Ocorreu um erro desconhecido ao criar o especialista.');
            }
        }
    };
    
    const handleAssign = (clientId: string, department: Department) => {
        const specialistId = assignments[clientId]?.[department];
        if (specialistId) {
            try {
                assignSpecialistToClient(clientId, specialistId, department);
                refreshData();
            } catch(e) {
                alert((e as Error).message);
            }
        }
    };
    
    const handleAssignmentSelection = (clientId: string, department: Department, specialistId: string) => {
        setAssignments(prev => ({
            ...prev,
            [clientId]: {
                ...prev[clientId],
                [department]: specialistId,
            }
        }));
    };

    const handleDeleteSpecialist = (specialist: Specialist) => {
        if (window.confirm(`Tem certeza que deseja excluir o especialista "${specialist.name}"? Todas as suas atribuições serão removidas.`)) {
            deleteSpecialist(specialist.id);
            refreshData();
        }
    };

    const handleResetClientPwd = (client: ClientInfo) => {
        if(window.confirm(`Tem certeza que deseja resetar a senha do cliente "${client.companyName}"? O usuário precisará criar uma nova senha no próximo login.`)) {
            resetClientPassword(client.id);
            alert('Senha resetada com sucesso.');
            refreshData();
        }
    };

    const handleResetSpecialistPwd = (specialist: Specialist) => {
        if(window.confirm(`Tem certeza que deseja resetar a senha do especialista "${specialist.name}"? O usuário precisará criar uma nova senha no próximo login.`)) {
            resetSpecialistPassword(specialist.id);
            alert('Senha resetada com sucesso.');
            refreshData();
        }
    };


    const renderDepartmentAssignment = (client: ClientInfo, department: Department) => {
        const assignment = client.assignments?.[department];

        if (assignment) {
            const specialist = specialists.find(s => s.id === assignment.specialistId);
            if (assignment.status === AssignmentStatus.PENDING) {
                return <span className="text-yellow-600 font-semibold text-sm">Pendente ({specialist?.name})</span>;
            }
            return <span className="text-green-700 text-sm">{specialist?.name}</span>;
        }

        const specialistsInDept = specialists.filter(s => s.department === department);
        if (specialistsInDept.length === 0) {
            return <span className="text-gray-500 text-sm">Nenhum especialista neste departamento.</span>
        }

        return (
            <div className="flex items-center space-x-2">
                <select
                    className="p-1 border rounded text-sm w-full"
                    value={assignments[client.id]?.[department] || ""}
                    onChange={(e) => handleAssignmentSelection(client.id, department, e.target.value)}
                >
                    <option value="">Selecione...</option>
                    {specialistsInDept.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button 
                    onClick={() => handleAssign(client.id, department)} 
                    className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600 disabled:bg-gray-300"
                    disabled={!assignments[client.id]?.[department]}
                >
                    Atribuir
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Criar Novo Cliente</h3>
                <form onSubmit={handleCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nome da Empresa" className="p-2 border rounded" required />
                    <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Nome do Contato" className="p-2 border rounded" required />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="p-2 border rounded" required />
                    <input value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="CNPJ" className="p-2 border rounded" required />
                    <button type="submit" className="md:col-span-2 bg-atx-dark-blue text-white p-2 rounded hover:opacity-90">Criar Cliente</button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Clientes e Atribuições por Departamento</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2 w-1/4">Cliente</th>
                                <th className="text-left p-2 w-1/2">Especialistas Responsáveis</th>
                                <th className="text-left p-2 w-1/4">Ações do Cliente</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(client => (
                                <tr key={client.id} className="border-b">
                                    <td className="p-2 font-medium align-top">{client.companyName} <span className="font-normal text-gray-500 text-sm">({client.id})</span></td>
                                    <td className="p-2 align-top">
                                        <div className="space-y-2">
                                            {Object.values(Department).map(dept => (
                                                <div key={dept} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                                    <span className="font-semibold text-sm text-gray-700 col-span-1">{dept}:</span>
                                                    <div className="col-span-2">
                                                        {renderDepartmentAssignment(client, dept)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                     <td className="p-2 align-top">
                                        <button onClick={() => handleResetClientPwd(client)} className="bg-orange-500 text-white px-2 py-1 text-xs rounded hover:bg-orange-600">
                                            Resetar Senha
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Gerenciar Especialistas</h3>
                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full">
                        <thead><tr className="border-b"><th className="text-left p-2">ID de Usuário</th><th className="text-left p-2">Nome Completo</th><th className="text-left p-2">Departamento</th><th className="text-left p-2">Ações</th></tr></thead>
                        <tbody>
                            {specialists.map(spec => (
                                <tr key={spec.id} className="border-b">
                                    <td className="p-2 font-mono text-sm">{spec.username}</td>
                                    <td className="p-2 font-medium">{spec.name}</td>
                                    <td className="p-2">{spec.department}</td>
                                    <td className="p-2">
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleResetSpecialistPwd(spec)} className="bg-orange-500 text-white px-2 py-1 text-xs rounded hover:bg-orange-600">
                                                Resetar Senha
                                            </button>
                                            <button onClick={() => handleDeleteSpecialist(spec)} className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600">
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h4 className="text-md font-semibold mb-2 pt-4 border-t">Criar Novo Especialista</h4>
                <form onSubmit={handleCreateSpecialist} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <input value={specialistUsername} onChange={e => setSpecialistUsername(e.target.value)} placeholder="ID de Usuário (ex: apaula)" className="p-2 border rounded" required />
                    <input value={specialistName} onChange={e => setSpecialistName(e.target.value)} placeholder="Nome Completo" className="p-2 border rounded" required />
                    <select value={specialistDept} onChange={e => setSpecialistDept(e.target.value as Department)} className="p-2 border rounded">
                        {Object.values(Department).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                    <button type="submit" className="md:col-span-3 bg-atx-dark-blue text-white p-2 rounded hover:opacity-90">Criar Especialista</button>
                </form>
            </div>
        </div>
    );
};

export default AdminUsersPanel;
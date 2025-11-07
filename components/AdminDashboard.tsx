import React, { useState, useMemo } from 'react';
import AdminUsersPanel from './AdminUsersPanel';
import { ChartBarIcon, FunnelIcon, CheckCircleIcon, XCircleIcon, UsersIcon, InformationCircleIcon } from './icons';
import { getChatSessions } from '../services/analyticsService';
import { Department, ResolutionStatus, ChatSession, Role } from '../types';

const AdminAnalyticsPanel: React.FC<{ dataVersion: number }> = ({ dataVersion }) => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all');
    const [resolutionFilter, setResolutionFilter] = useState<ResolutionStatus | 'all'>('all');

    React.useEffect(() => {
        setSessions(getChatSessions());
    }, [dataVersion]);
    
    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            const departmentMatch = departmentFilter === 'all' || session.department === departmentFilter;
            const resolutionMatch = resolutionFilter === 'all' || session.resolution === resolutionFilter;
            return departmentMatch && resolutionMatch;
        });
    }, [sessions, departmentFilter, resolutionFilter]);

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    if (sessions.length === 0) {
        return <div className="bg-white p-6 rounded-lg shadow"><p>Nenhuma sessão de chat encontrada para análise.</p></div>
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
             <h3 className="text-lg font-semibold mb-4">Sessões de Atendimento</h3>
             <div className="flex items-center space-x-4 mb-4 bg-gray-50 p-3 rounded">
                <div className="flex items-center">
                    <FunnelIcon />
                    <span className="font-semibold">Filtros:</span>
                </div>
                <div>
                    <label className="text-sm mr-2">Departamento:</label>
                    <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value as any)} className="p-1 border rounded text-sm">
                        <option value="all">Todos</option>
                        {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm mr-2">Resolução:</label>
                    <select value={resolutionFilter} onChange={e => setResolutionFilter(e.target.value as any)} className="p-1 border rounded text-sm">
                        <option value="all">Todos</option>
                        {Object.values(ResolutionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead><tr className="border-b"><th className="text-left p-2">Cliente</th><th className="text-left p-2">Departamento</th><th className="text-left p-2">Duração</th><th className="text-left p-2">Resolução</th><th className="text-left p-2">Ver</th></tr></thead>
                    <tbody>
                        {filteredSessions.map(session => (
                            <tr key={session.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 font-medium">{session.client.companyName}</td>
                                <td className="p-2">{session.department}</td>
                                <td className="p-2">{formatDuration(session.endTime - session.startTime)}</td>
                                <td className="p-2 flex items-center">
                                    {session.resolution === ResolutionStatus.RESOLVED ? <CheckCircleIcon /> : <XCircleIcon />}
                                    {session.resolution}
                                </td>
                                <td className="p-2"><button onClick={() => setSelectedSession(session)} className="text-atx-dark-blue hover:underline text-sm">Transcrição</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedSession && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedSession(null)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center">
                           <div>
                             <h3 className="text-lg font-semibold">Transcrição do Chat</h3>
                             <p className="text-sm text-gray-500">{selectedSession.client.companyName} com {selectedSession.specialist?.name || 'IA'}</p>
                           </div>
                           <button onClick={() => setSelectedSession(null)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                           {selectedSession.transcript.map((msg, index) => (
                               <div key={index} className={`mb-3 flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
                                   <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === Role.USER ? 'bg-atx-dark-blue text-white' : 'bg-slate-100 text-slate-800'}`}>
                                       <p className="text-sm">{msg.content}</p>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">{title}</h2>
        <div className="text-slate-700 space-y-3">{children}</div>
    </div>
);

const AdminOverviewPanel = () => {
    return (
        <div>
            <Section title="O que é o Assistente de IA?">
                <p>O Assistente de IA é a primeira linha de contato digital para os clientes da ATX Contadores. Seu principal objetivo é oferecer respostas rápidas a dúvidas comuns e, quando necessário, direcionar o cliente de forma eficiente para o especialista humano correto.</p>
                <p>Ele funciona 24/7, garantindo que nossos clientes sempre recebam um primeiro atendimento imediato e profissional.</p>
            </Section>

            <Section title="Como Ele se Comporta? (Sua Personalidade)">
                <p>Programamos o assistente para agir sempre de maneira:</p>
                <ul className="list-disc list-inside ml-4">
                    <li><strong>Profissional e Cordial:</strong> Ele sempre cumprimenta o cliente de forma educada e se identifica como o assistente virtual da ATX Contadores.</li>
                    <li><strong>Prestativo:</strong> Seu objetivo é ajudar. Ele faz perguntas para entender a necessidade do cliente antes de agir.</li>
                    <li><strong>Claro e Objetivo:</strong> Ele usa uma linguagem simples, evitando jargões técnicos, para garantir que a comunicação seja fácil de entender.</li>
                </ul>
            </Section>
            
            <Section title="O que Ele Pode Fazer? (Suas Capacidades)">
                 <p>O assistente foi treinado para realizar as seguintes tarefas:</p>
                 <ul className="list-disc list-inside ml-4">
                    <li>Responder a perguntas gerais sobre os serviços dos departamentos (Contábil, Fiscal, DP, Financeiro, Societário).</li>
                    <li>Identificar, com base na conversa, qual departamento é o mais adequado para resolver o problema do cliente.</li>
                    <li>Coletar um resumo inicial da solicitação do cliente para agilizar o atendimento humano.</li>
                    <li>Realizar o encaminhamento formal da solicitação para o departamento correto.</li>
                </ul>
            </Section>
            
            <Section title="Quais são as Suas Limitações? (As Regras)">
                <p>Para garantir a segurança e a precisão, o assistente opera sob regras estritas:</p>
                 <ul className="list-disc list-inside ml-4">
                    <li><strong>NÃO fornece conselhos específicos:</strong> Ele está explicitamente proibido de dar conselhos legais, fiscais ou financeiros específicos para a situação de um cliente. Ele sempre informará que a resposta é uma orientação geral.</li>
                    <li><strong>NÃO realiza tarefas complexas:</strong> Ele não preenche formulários, não altera cadastros nem executa operações. Sua função é de triagem e informação.</li>
                    <li><strong>SEMPRE encaminha em caso de dúvida:</strong> Se o assunto for complexo, específico ou fora de seu escopo, sua diretriz é encaminhar o cliente para um especialista humano.</li>
                </ul>
            </Section>
            
             <Section title="O Processo de Encaminhamento para um Especialista">
                <p>Este é o fluxo de trabalho mais importante do assistente:</p>
                <ol className="list-decimal list-inside ml-4 space-y-2">
                    <li>O cliente descreve sua necessidade.</li>
                    <li>O assistente analisa a conversa e identifica o departamento responsável (ex: Fiscal).</li>
                    <li>Ele cria um resumo do problema (ex: "dúvida sobre emissão de nota fiscal de serviço").</li>
                    <li>O assistente então "chama" o sistema para notificar o departamento Fiscal com o resumo. Na nossa implementação atual, isso envia uma mensagem via Telegram para a equipe.</li>
                    <li>Por fim, ele informa ao cliente que a solicitação foi encaminhada com sucesso e que um especialista entrará em contato em breve. A conversa é então encerrada, garantindo que o especialista tenha todo o contexto para continuar o atendimento.</li>
                </ol>
            </Section>
        </div>
    );
}


enum AdminTab {
    USERS = 'users',
    ANALYTICS = 'analytics',
    OVERVIEW = 'overview',
}

interface AdminDashboardProps {
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.USERS);
    // State to trigger re-renders in children when data changes
    const [dataVersion, setDataVersion] = useState(0);

    const handleDataChange = () => {
        setDataVersion(v => v + 1);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case AdminTab.USERS:
                return <AdminUsersPanel onDataChange={handleDataChange} />;
            case AdminTab.ANALYTICS:
                return <AdminAnalyticsPanel dataVersion={dataVersion} />;
            case AdminTab.OVERVIEW:
                return <AdminOverviewPanel />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
                        <p className="text-sm text-slate-500">ATX Contadores</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <nav className="flex space-x-2">
                            <button
                                onClick={() => setActiveTab(AdminTab.USERS)}
                                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === AdminTab.USERS ? 'bg-atx-dark-blue text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                            >
                                <UsersIcon /> <span className="ml-2">Usuários</span>
                            </button>
                            <button
                                onClick={() => setActiveTab(AdminTab.ANALYTICS)}
                                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === AdminTab.ANALYTICS ? 'bg-atx-dark-blue text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                            >
                               <ChartBarIcon /> <span className="ml-2">Análises</span>
                            </button>
                            <button
                                onClick={() => setActiveTab(AdminTab.OVERVIEW)}
                                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === AdminTab.OVERVIEW ? 'bg-atx-dark-blue text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                            >
                               <InformationCircleIcon /> <span className="ml-2">Visão Geral do Agente</span>
                            </button>
                        </nav>
                        <button onClick={onLogout} className="text-sm text-slate-600 hover:underline">Sair</button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                {renderTabContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;
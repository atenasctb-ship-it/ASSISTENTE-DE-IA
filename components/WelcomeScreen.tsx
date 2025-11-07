import React from 'react';
import { ClientInfo } from '../types';

interface WelcomeScreenProps {
    client: ClientInfo;
    onStartChat: () => void;
    onLogout: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ client, onStartChat, onLogout }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
            <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    Bem-vindo, {client.contactName}!
                </h1>
                <p className="text-slate-600 mb-6">
                    Você está no portal de atendimento da <span className="font-semibold">ATX Contadores</span>.
                </p>
                <div className="bg-slate-50 p-4 rounded-lg text-left mb-6">
                    <h2 className="font-semibold text-lg mb-2">Como nosso assistente virtual pode te ajudar?</h2>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Tirar dúvidas gerais sobre processos contábeis.</li>
                        <li>Solicitar segunda via de documentos.</li>
                        <li>Consultar o status de uma solicitação.</li>
                        <li>E direcionar você para um especialista!</li>
                    </ul>
                </div>
                <button
                    onClick={onStartChat}
                    className="w-full bg-atx-dark-blue text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-colors"
                >
                    Iniciar Atendimento
                </button>
                <button
                    onClick={onLogout}
                    className="mt-4 text-sm text-slate-500 hover:text-slate-700 hover:underline"
                >
                    Sair e voltar ao início
                </button>
                 <p className="text-xs text-slate-400 mt-4">
                    Todas as conversas são salvas para sua segurança e para melhoria contínua do nosso atendimento.
                </p>
            </div>
        </div>
    );
};

export default WelcomeScreen;
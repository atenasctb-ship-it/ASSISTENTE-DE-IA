import React, { useState } from 'react';
import { loginClient, loginSpecialist } from '../services/userService';
import { ClientInfo, Specialist } from '../types';
import { Logo } from './icons';

interface LoginScreenProps {
    onLogin: (user: ClientInfo | Specialist, userType: 'client' | 'specialist') => void;
    onNeedsPasswordSet: (user: Partial<ClientInfo & Specialist>, userType: 'client' | 'specialist') => void;
    onGoToAdmin: () => void;
    onGoToDev: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNeedsPasswordSet, onGoToAdmin, onGoToDev }) => {
    const [userType, setUserType] = useState<'client' | 'specialist'>('client');
    const [identifier, setIdentifier] = useState(''); // client ID or specialist username
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let result;
            if (userType === 'client') {
                result = loginClient(identifier, password);
            } else {
                result = loginSpecialist(identifier, password);
            }

            if (result === 'needs_password') {
                onNeedsPasswordSet({ id: identifier, username: identifier }, userType);
            } else if (result) {
                onLogin(result, userType);
            } else {
                setError('ID de usuário ou senha inválidos.');
            }
        } catch (err) {
            setError('Ocorreu um erro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-sm">
                <div className="flex flex-col items-center mb-4">
                    <Logo className="h-16 w-auto" />
                    <h2 className="text-2xl font-semibold text-atx-dark-blue mt-2">ATX Contadores</h2>
                </div>
                <div className="mb-4 flex justify-center border-b">
                    <button onClick={() => setUserType('client')} className={`px-4 py-2 text-sm font-medium ${userType === 'client' ? 'border-b-2 border-atx-dark-blue text-atx-dark-blue' : 'text-slate-500'}`}>
                        Sou Cliente
                    </button>
                    <button onClick={() => setUserType('specialist')} className={`px-4 py-2 text-sm font-medium ${userType === 'specialist' ? 'border-b-2 border-atx-dark-blue text-atx-dark-blue' : 'text-slate-500'}`}>
                        Sou Especialista
                    </button>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">
                            {userType === 'client' ? 'ID do Cliente' : 'Usuário'}
                        </label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                            placeholder={userType === 'client' ? 'Ex: cli_001' : 'Ex: ana.c'}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-atx-dark-blue text-white py-2 rounded-md hover:opacity-90 disabled:bg-opacity-50">
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <div className="text-center mt-4 pt-4 border-t flex justify-around">
                     <button onClick={onGoToAdmin} className="text-xs text-slate-500 hover:underline">Acesso Admin</button>
                     <button onClick={onGoToDev} className="text-xs text-slate-500 hover:underline">Painel Dev</button>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
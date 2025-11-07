import React, { useState } from 'react';
import { loginAdmin } from '../services/userService';
import { Logo } from './icons';

interface AdminLoginScreenProps {
    onLoginSuccess: () => void;
}


const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay and call the service
        setTimeout(() => {
            if (loginAdmin(username, password)) {
                onLoginSuccess();
            } else {
                setError('Usuário ou senha incorretos.');
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-sm">
                <div className="flex justify-center mb-4">
                    <Logo className="h-20 w-auto" />
                </div>
                 <p className="text-center text-slate-500 mb-6">Painel Administrativo</p>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Usuário</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                            placeholder="admin"
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
                            placeholder="Senha de Administrador"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-atx-dark-blue text-white py-2 rounded-md hover:opacity-90 disabled:bg-opacity-50">
                        {isLoading ? 'Verificando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginScreen;
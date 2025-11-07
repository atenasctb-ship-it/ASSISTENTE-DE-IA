import React, { useState } from 'react';
import { loginDev } from '../services/userService';

interface DevLoginScreenProps {
    onLoginSuccess: () => void;
    onExit: () => void;
}

const DevLoginScreen: React.FC<DevLoginScreenProps> = ({ onLoginSuccess, onExit }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            if (loginDev(username, password)) {
                onLoginSuccess();
            } else {
                setError('Credenciais de desenvolvedor inválidas.');
            }
            setIsLoading(false);
        }, 300);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-sm">
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-slate-800">Acesso Restrito</h1>
                  <p className="text-slate-500">Painel do Desenvolvedor</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Usuário</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                            placeholder="dev"
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
                    <button type="submit" disabled={isLoading} className="w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-900 disabled:bg-slate-400">
                        {isLoading ? '...' : 'Acessar'}
                    </button>
                </form>
                 <div className="text-center mt-4">
                     <button onClick={onExit} className="text-xs text-slate-500 hover:underline">Voltar para o login principal</button>
                </div>
            </div>
        </div>
    );
};

export default DevLoginScreen;
// Fix: Implementing the SetPasswordScreen component for initial password setup.
import React, { useState } from 'react';
import { setClientPassword, setSpecialistPassword, getClientById, getSpecialists } from '../services/userService';
import { ClientInfo, Specialist } from '../types';

interface SetPasswordScreenProps {
    user: Partial<ClientInfo & Specialist>;
    userType: 'client' | 'specialist';
    onPasswordSet: () => void;
}

const SetPasswordScreen: React.FC<SetPasswordScreenProps> = ({ user, userType, onPasswordSet }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState('');

    React.useEffect(() => {
       // Fetch full user details to get the name
       if (userType === 'client' && user.id) {
           const client = getClientById(user.id);
           setUserName(client?.contactName || '');
       } else if (userType === 'specialist' && user.username) {
            const specialist = getSpecialists().find(s => s.username === user.username);
            setUserName(specialist?.name || '');
       }
    }, [user, userType]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (password.length < 3) { // Simplified for demo
            setError('A senha deve ter pelo menos 3 caracteres.');
            return;
        }

        setIsLoading(true);
        let success = false;
        if (userType === 'client' && user.id) {
           success = setClientPassword(user.id, password);
        } else if (userType === 'specialist' && user.id) {
           success = setSpecialistPassword(user.id, password);
        }
        
        setTimeout(() => { // Simulate network delay
            if (success) {
                alert('Senha definida com sucesso! Por favor, faça o login novamente.');
                onPasswordSet();
            } else {
                setError('Não foi possível definir a senha. ID de usuário não encontrado. Por favor, contate o suporte.');
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-sm">
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Crie sua Senha</h2>
                    <p className="text-slate-500">Olá, {userName}. Este é seu primeiro acesso. Por favor, defina uma senha segura.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Nova Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Confirme a Nova Senha</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-atx-dark-blue text-white py-2 rounded-md hover:opacity-90 disabled:bg-opacity-50">
                        {isLoading ? 'Salvando...' : 'Definir Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetPasswordScreen;
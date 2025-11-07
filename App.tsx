import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";

import LoginScreen from './components/LoginScreen';
import SetPasswordScreen from './components/SetPasswordScreen';
import WelcomeScreen from './components/WelcomeScreen';
import SpecialistDashboard from './components/SpecialistDashboard';
import AdminLoginScreen from './components/AdminLoginScreen';
import AdminDashboard from './components/AdminDashboard';
import DevLoginScreen from './components/DevLoginScreen';
import DevPanel from './components/DevPanel';
import OwnerLoginScreen from './components/OwnerLoginScreen';
import OwnerPanel from './components/OwnerPanel';
import { SendIcon, LoadingSpinner, Logo } from './components/icons';

import { createChatSession } from './services/geminiService';
import { saveChatSession } from './services/analyticsService';
import { sendTelegramNotification } from './services/telegramService';
import { ClientInfo, Specialist, Message, Role, Department, ResolutionStatus, ChatSession } from './types';

// The ChatScreen component is defined within App.tsx to avoid creating new files.
const ChatScreen: React.FC<{ client: ClientInfo; onEndChat: (transcript: Message[], department: Department, summary:string, startTime: number) => void; onLogout: () => void; }> = ({ client, onEndChat, onLogout }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
        setIsLoading(true);
        try {
            const session = createChatSession();
            chatSessionRef.current = session;
            
            // Send an initial message to get the conversation started.
            session.sendMessage('Olá').then(response => {
                const initialMessage: Message = {
                    role: Role.MODEL,
                    content: response.text.trim() || `Olá! Sou o assistente virtual da ATX Contadores. Como posso te ajudar hoje?`,
                    timestamp: Date.now(),
                };
                setMessages([initialMessage]);
            }).catch(error => {
                 console.error("Error getting initial greeting:", error);
                 const fallbackMessage: Message = {
                    role: Role.MODEL,
                    content: `Olá! Sou o assistente virtual da ATX Contadores. Como posso te ajudar hoje?`,
                    timestamp: Date.now(),
                };
                setMessages([fallbackMessage]);
            }).finally(() => {
                setIsLoading(false)
            });

        } catch (error) {
            console.error("Failed to initialize chat session", error);
            const errorMessage: Message = {
                role: Role.MODEL,
                content: "Desculpe, não foi possível iniciar o assistente. Tente novamente mais tarde.",
                timestamp: Date.now(),
            };
            setMessages([errorMessage]);
            setIsLoading(false);
        }
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: Role.USER, content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const chat = chatSessionRef.current;
            if (!chat) throw new Error("Chat session not initialized");

            const response = await chat.sendMessage({ message: currentInput });
            
            // Handle function call
            if (response.functionCalls && response.functionCalls.length > 0) {
                const fc = response.functionCalls[0];
                const { department, summary } = fc.args;

                // User-facing message confirming the handoff
                const specialistMessage: Message = {
                    role: Role.MODEL,
                    content: `Entendido. Sua solicitação sobre "${summary}" foi encaminhada para o departamento ${department}. Um de nossos especialistas entrará em contato em breve. Este atendimento será encerrado. Obrigado por contatar a ATX Contadores!`
                };
                
                const currentMessages = [...messages, userMessage];
                setMessages([...currentMessages, specialistMessage]);

                // Notify department via Telegram
                const botToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
                const chatId = process.env.REACT_APP_TELEGRAM_CHAT_ID;

                if (botToken && chatId) {
                     const telegramMessage = `*Nova Solicitação de Cliente*\n\n*Cliente:* ${client.companyName}\n*Departamento:* ${department}\n*Resumo:* ${summary}`;
                     sendTelegramNotification(botToken, chatId, telegramMessage);
                } else {
                     console.warn("Telegram environment variables not set. Skipping notification.");
                }

                setIsLoading(false);
                // End chat and save session after a delay
                setTimeout(() => {
                    onEndChat([...currentMessages, specialistMessage], department as Department, summary, startTimeRef.current);
                }, 4000);
                
                return;
            }

            // Handle text response
            const modelMessage: Message = {
                role: Role.MODEL,
                content: response.text.trim(),
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                role: Role.MODEL,
                content: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <header className="bg-white shadow-md z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Logo className="h-10 w-auto" />
                        <div>
                            <h1 className="font-bold text-atx-dark-blue">ATX Contadores</h1>
                            <p className="text-sm text-slate-500">Atendimento: {client.companyName}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="text-sm text-slate-600 hover:underline">Sair</button>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
                            {msg.role !== Role.USER && <div className="w-8 h-8 rounded-full bg-atx-cyan flex items-center justify-center font-bold text-white text-sm">IA</div>}
                            <div className={`max-w-[70%] p-3 rounded-xl ${msg.role === Role.USER ? 'bg-atx-dark-blue text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full bg-atx-cyan flex items-center justify-center font-bold text-white text-sm">IA</div>
                             <div className="max-w-[70%] p-3 rounded-xl bg-white text-slate-800 rounded-bl-none">
                                <LoadingSpinner />
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>
            <footer className="bg-white p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-atx-dark-blue"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="bg-atx-dark-blue text-white p-2 rounded-full hover:opacity-90 disabled:bg-opacity-50">
                        <SendIcon />
                    </button>
                </form>
            </footer>
        </div>
    );
};


const App = () => {
    type View = 'login' | 'setPassword' | 'welcome' | 'chat' | 'specialistDashboard' | 'adminLogin' | 'adminDashboard' | 'devLogin' | 'devPanel' | 'ownerLogin' | 'ownerPanel';
    const [view, setView] = useState<View>('login');
    const [currentUser, setCurrentUser] = useState<ClientInfo | Specialist | null>(null);
    const [userType, setUserType] = useState<'client' | 'specialist' | null>(null);
    const [userForPasswordSet, setUserForPasswordSet] = useState<Partial<ClientInfo & Specialist> | null>(null);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [isDevLoggedIn, setIsDevLoggedIn] = useState(false);
    const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(false);

    const handleLogin = (user: ClientInfo | Specialist, type: 'client' | 'specialist') => {
        setCurrentUser(user);
        setUserType(type);
        setView(type === 'client' ? 'welcome' : 'specialistDashboard');
    };

    const handleNeedsPasswordSet = (user: Partial<ClientInfo & Specialist>, type: 'client' | 'specialist') => {
        setUserForPasswordSet(user);
        setUserType(type);
        setView('setPassword');
    };
    
    const handlePasswordSet = () => {
        setUserForPasswordSet(null);
        setCurrentUser(null);
        setUserType(null);
        setView('login');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setUserType(null);
        setIsAdminLoggedIn(false);
        setIsDevLoggedIn(false);
        setIsOwnerLoggedIn(false);
        setView('login');
    };

    const handleStartChat = () => setView('chat');

    const handleEndChat = (transcript: Message[], department: Department, summary: string, startTime: number) => {
        if (currentUser && userType === 'client') {
            const session: ChatSession = {
                id: `session_${Date.now()}`,
                client: currentUser as ClientInfo,
                department: department,
                startTime: startTime,
                endTime: Date.now(),
                transcript: transcript,
                resolution: ResolutionStatus.FORWARDED,
                summary: summary,
            };
            saveChatSession(session);
        }
        setView('welcome');
    };
    
    const handleAdminLoginSuccess = () => {
        setIsAdminLoggedIn(true);
        setView('adminDashboard');
    };

    const handleDevLoginSuccess = () => {
        setIsDevLoggedIn(true);
        setView('devPanel');
    };
    
    const handleOwnerLoginSuccess = () => {
        setIsOwnerLoggedIn(true);
        setView('ownerPanel');
    };

    const handleGoToAdminLogin = () => {
        setView('adminLogin');
    };

    const handleGoToDevLogin = () => {
        setView('devLogin');
    };

    const handleGoToOwnerLogin = () => {
        setView('ownerLogin');
    };
    
    // Dev Panel Logic
    if (view === 'devLogin') {
        return <DevLoginScreen onLoginSuccess={handleDevLoginSuccess} onExit={() => setView('login')} />;
    }
    if (view === 'devPanel') {
        if (!isDevLoggedIn) return <DevLoginScreen onLoginSuccess={handleDevLoginSuccess} onExit={() => setView('login')} />;
        return <DevPanel onLogout={handleLogout} />;
    }
    
    // Owner Panel Logic
    if (view === 'ownerLogin') {
        return <OwnerLoginScreen onLoginSuccess={handleOwnerLoginSuccess} onExit={() => setView('login')} />;
    }
    if (view === 'ownerPanel') {
        if (!isOwnerLoggedIn) return <OwnerLoginScreen onLoginSuccess={handleOwnerLoginSuccess} onExit={() => setView('login')} />;
        return <OwnerPanel onLogout={handleLogout} />;
    }

    // Admin Panel Logic
    if (view === 'adminLogin') {
        return <AdminLoginScreen onLoginSuccess={handleAdminLoginSuccess} />;
    }
    if (view === 'adminDashboard') {
        if (!isAdminLoggedIn) return <AdminLoginScreen onLoginSuccess={handleAdminLoginSuccess} />;
        return <AdminDashboard onLogout={handleLogout} />;
    }

    // User/Specialist Logic
    if (view === 'setPassword' && userForPasswordSet && userType) {
        return <SetPasswordScreen user={userForPasswordSet} userType={userType} onPasswordSet={handlePasswordSet} />;
    }

    if (!currentUser || !userType) {
        return <LoginScreen onLogin={handleLogin} onNeedsPasswordSet={handleNeedsPasswordSet} onGoToAdmin={handleGoToAdminLogin} onGoToDev={handleGoToDevLogin} />;
    }

    switch(userType) {
        case 'client':
            if (view === 'welcome') return <WelcomeScreen client={currentUser as ClientInfo} onStartChat={handleStartChat} onLogout={handleLogout} />;
            if (view === 'chat') return <ChatScreen client={currentUser as ClientInfo} onEndChat={handleEndChat} onLogout={handleLogout} />;
            break;
        case 'specialist':
            if(view === 'specialistDashboard') return <SpecialistDashboard specialist={currentUser as Specialist} onLogout={handleLogout} />;
            break;
    }

    return <LoginScreen onLogin={handleLogin} onNeedsPasswordSet={handleNeedsPasswordSet} onGoToAdmin={handleGoToAdminLogin} onGoToDev={handleGoToDevLogin} />;
};

export default App;
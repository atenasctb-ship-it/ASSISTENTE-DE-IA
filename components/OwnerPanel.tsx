import React from 'react';

interface OwnerPanelProps {
    onLogout: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">{title}</h2>
        <div className="text-slate-700 space-y-3">{children}</div>
    </div>
);

const OwnerPanel: React.FC<OwnerPanelProps> = ({ onLogout }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Visão Geral do Assistente de IA</h1>
                        <p className="text-sm text-slate-500">ATX Contadores</p>
                    </div>
                    <button onClick={onLogout} className="text-sm text-red-600 hover:underline">Sair</button>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
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
            </main>
        </div>
    );
};

export default OwnerPanel;
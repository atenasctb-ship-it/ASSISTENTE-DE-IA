import React from 'react';
import { resetApplicationData } from '../services/userService';

interface DevPanelProps {
    onLogout: () => void;
}

const agentDocumentationContent = `
# Documentação do Agente de IA - ATX Contadores

## 1. Visão Geral

Este documento descreve a configuração, o comportamento e as capacidades do assistente virtual de IA desenvolvido para a ATX Contadores. O agente é construído utilizando a API Gemini do Google e é projetado para ser a primeira linha de suporte ao cliente.

## 2. Instrução de Sistema (System Instruction)

O comportamento principal do agente é definido por uma instrução de sistema detalhada. Esta instrução define seu tom, personalidade e fluxo de trabalho.

**Resumo da Instrução:**

*   **Persona:** Um assistente de IA profissional, amigável e eficiente da 'ATX Contadores'.
*   **Linguagem:** Português do Brasil.
*   **Fluxo de Trabalho Principal:**
    1.  **Saudação:** Cumprimentar o usuário calorosamente e se apresentar.
    2.  **Compreensão:** Entender a dúvida do cliente, fazendo perguntas claras se necessário.
    3.  **Informação Preliminar:** Fornecer respostas gerais e úteis. **Importante:** O agente é instruído a **não** fornecer conselhos financeiros ou legais específicos e a sempre informar que a orientação é geral.
    4.  **Identificação do Departamento:** Analisar a consulta para determinar o departamento correto para o encaminhamento. Os departamentos definidos são:
        *   **Contábil:** Balanços, demonstrativos financeiros.
        *   **Fiscal:** Impostos, notas fiscais, planejamento tributário.
        *   **DP (Departamento Pessoal):** Folha de pagamento, leis trabalhistas, contratação.
        *   **Financeiro:** Contas a pagar/receber, terceirização financeira.
        *   **Societário:** Abertura de empresas, alterações contratuais, fusões.
    5.  **Encaminhamento (Function Calling):** Uma vez que o departamento é identificado, o agente **deve** usar a ferramenta \`notifyDepartment\` para formalizar o encaminhamento.
    6.  **Confirmação:** Após o encaminhamento, o agente informa ao cliente que a solicitação foi enviada e que um especialista entrará em contato, encerrando o chat.

## 3. Ferramentas e Capacidades (Function Calling)

O agente possui uma única ferramenta para interagir com o sistema externo: \`notifyDepartment\`.

### Função: \`notifyDepartment\`

*   **Descrição:** Notifica um departamento específico sobre a consulta de um cliente e fornece um resumo.
*   **Parâmetros:**
    *   \`department\` (Obrigatório): O nome do departamento a ser notificado. Deve ser um dos valores pré-definidos (\`Contábil\`, \`Fiscal\`, \`DP\`, \`Financeiro\`, \`Societário\`).
    *   \`summary\` (Obrigatório): Um resumo conciso da solicitação do cliente, gerado pelo modelo.

*   **Como Funciona:** Quando o agente determina que a conversa precisa ser encaminhada, ele chama esta função com os argumentos apropriados. A aplicação front-end intercepta essa chamada, envia a notificação (via Telegram, neste caso), informa ao usuário sobre o sucesso do encaminhamento e encerra a sessão de chat. O agente não prossegue com a conversa após esta chamada.
`;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">{title}</h2>
        <div className="prose prose-slate max-w-none">{children}</div>
    </div>
);

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <code className="bg-slate-200 text-slate-800 rounded px-1 py-0.5 text-sm font-mono">{children}</code>
);

const DevPanel: React.FC<DevPanelProps> = ({ onLogout }) => {

    const handleDownloadDocs = () => {
        const blob = new Blob([agentDocumentationContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documentacao-agente-ia-atx.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const handleResetData = () => {
        if (window.confirm('Tem certeza que deseja resetar TODOS os dados da aplicação? Isso irá apagar clientes, especialistas e análises, retornando ao estado inicial.')) {
            resetApplicationData();
            alert('Dados resetados com sucesso! A página será recarregada.');
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Painel do Desenvolvedor</h1>
                    <button onClick={onLogout} className="text-sm text-red-600 hover:underline">Sair</button>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                 <Section title="Ferramentas Interativas">
                    <p>Use estas ferramentas para auxiliar no desenvolvimento e depuração.</p>
                    <button onClick={handleResetData} className="mt-2 bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition-colors no-underline">
                        Resetar Dados da Aplicação
                    </button>
                </Section>
            
                <Section title="Visão Geral da Arquitetura">
                    <p>Este é um Aplicativo de Página Única (SPA) construído com <strong>React</strong>, <strong>TypeScript</strong> e estilizado com <strong>TailwindCSS</strong>.</p>
                    <ul>
                        <li><strong>Gerenciamento de Estado de UI:</strong> A navegação é controlada por uma "máquina de estado" simples no componente <Code>App.tsx</Code>, usando o estado <Code>view</Code>.</li>
                        <li><strong>Simulação de Banco de Dados:</strong> Todos os dados de usuários (clientes, especialistas) e sessões são persistidos no <Code>localStorage</Code> do navegador. O serviço <Code>services/userService.ts</Code> abstrai toda a manipulação desses dados.</li>
                        <li><strong>API de IA:</strong> A interação com o modelo de linguagem é feita através do SDK <Code>@google/genai</Code>, encapsulada em <Code>services/geminiService.ts</Code>.</li>
                    </ul>
                </Section>
                
                <Section title="Documentação do Agente de IA">
                    <p>A configuração do agente de IA (seu comportamento, persona e ferramentas) é fundamental para o funcionamento do chat. A documentação completa pode ser baixada para consulta.</p>
                    <button onClick={handleDownloadDocs} className="mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors no-underline">
                        Baixar Documentação (Markdown)
                    </button>
                </Section>

                <Section title="Guia de Debug e Solução de Problemas">
                    <h4>Variáveis de Ambiente</h4>
                    <p>O assistente depende de variáveis de ambiente para se conectar a serviços externos. Certifique-se de que elas estão configuradas corretamente:</p>
                    <ul>
                        <li><Code>process.env.API_KEY</Code>: Chave da API do Google AI Studio para o Gemini.</li>
                        <li><Code>process.env.REACT_APP_TELEGRAM_BOT_TOKEN</Code>: Token do bot do Telegram para notificações.</li>
                        <li><Code>process.env.REACT_APP_TELEGRAM_CHAT_ID</Code>: ID do chat do Telegram para onde as notificações são enviadas.</li>
                    </ul>
                    <h4>Resetar Dados da Aplicação</h4>
                    <p>Se os dados de clientes ou especialistas se corromperem durante o desenvolvimento, você pode usar a ferramenta <strong>"Resetar Dados da Aplicação"</strong> acima.</p>
                     <h4>Erros da API Gemini</h4>
                     <p>Se o chat não responder ou apresentar erros, verifique o console do navegador e a aba "Network" para inspecionar as requisições para a API do Gemini e suas respostas.</p>
                </Section>

                <Section title="Sugestões de Melhorias">
                    <p>Este projeto é um protótipo funcional. Para um ambiente de produção, considere as seguintes evoluções:</p>
                    <ul>
                        <li><strong>Backend Real:</strong> Substituir o <Code>localStorage</Code> por um banco de dados real (ex: Firebase, Supabase, ou um backend customizado com Node.js) para gerenciar usuários e sessões de forma segura e escalável.</li>
                        <li><strong>Roteamento:</strong> Implementar uma biblioteca de roteamento como <Code>react-router-dom</Code> para gerenciar as "páginas" da aplicação, permitindo URLs diretas e uma navegação mais robusta.</li>
                        <li><strong>Atualizações em Tempo Real:</strong> Usar WebSockets ou serviços como Firebase Realtime Database para que as atualizações (ex: novas atribuições de clientes) apareçam instantaneamente para os especialistas sem a necessidade de recarregar a página.</li>
                         <li><strong>UI/UX Aprimorada:</strong> Adicionar transições de página, feedback visual mais claro (toasts/snackbars para notificações) e talvez adotar uma biblioteca de componentes como Shadcn/UI ou Material-UI para consistência.</li>
                    </ul>
                </Section>
            </main>
        </div>
    );
};

export default DevPanel;
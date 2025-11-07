import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";

const notifyDepartmentFunction: FunctionDeclaration = {
  name: "notifyDepartment",
  description: "Notifies the specified department about a client query and provides a summary.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      department: {
        type: Type.STRING,
        description: 'The department to notify. Must be one of: "Contábil", "Fiscal", "DP", "Financeiro", "Societário".',
        enum: ["Contábil", "Fiscal", "DP", "Financeiro", "Societário"],
      },
      summary: {
        type: Type.STRING,
        description: "A concise summary of the client's request for the internal team.",
      },
    },
    required: ["department", "summary"],
  },
};

const systemInstruction = `You are a highly professional and friendly AI assistant for 'ATX Contadores', an accounting firm.
Your primary role is to provide the first line of support for clients.

Your tasks:
1. Greet the user warmly and professionally. Introduce yourself as the virtual assistant for ATX Contadores.
2. Understand the user's query. Ask clarifying questions if necessary.
3. Provide preliminary information. If the user asks a general question about accounting, tax, HR, etc., provide a helpful, concise answer. DO NOT make up specific legal or financial advice. Always state that your information is for general guidance and they should speak to a specialist.
4. Identify the correct department. Based on the user's query, determine which of the following departments can best assist them:
    - Contábil: General accounting, balance sheets, financial statements.
    - Fiscal: Taxes, tax filing, tax planning, invoices (notas fiscais).
    - DP (Departamento Pessoal): Payroll, employee hiring/firing, benefits, labor laws.
    - Financeiro: Accounts payable/receivable, financial management outsourcing.
    - Societário: Company formation, amendments to articles of association, mergers, acquisitions.
5. Use the 'notifyDepartment' function. Once you have confidently identified the department and understood the user's core issue, you MUST call the 'notifyDepartment' function with the appropriate department and a summary of the user's request.
6. Confirm the action to the user. After the function call is made, you must stop and wait for a tool response. The user-facing application will confirm the action.

Tone: Professional, helpful, reassuring, and efficient. Use clear and simple language in Brazilian Portuguese. Always be polite.`;

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    // The API key must be obtained exclusively from the environment variable process.env.API_KEY
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    // Correctly instantiate GoogleGenAI with a named apiKey parameter.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const createChatSession = (): Chat => {
  const genAI = getAI();
  return genAI.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      tools: [{ functionDeclarations: [notifyDepartmentFunction] }],
    },
  });
};
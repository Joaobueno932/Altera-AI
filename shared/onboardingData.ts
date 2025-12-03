export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  options: string[];
  allowMultiple?: boolean;
};

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "momento",
    title: "Em que momento de vida você está?",
    description: "Escolha as opções que mais representam seu agora.",
    options: ["Explorando", "Transição", "Estável", "Reinventando", "Começando do zero"],
    allowMultiple: true,
  },
  {
    id: "energia",
    title: "Como está sua energia hoje?",
    description: "Ajustaremos o ritmo do assessor ao seu estado.",
    options: ["Alta", "Focada", "Oscilando", "Cansado", "Preciso de impulso"],
    allowMultiple: false,
  },
  {
    id: "objetivo",
    title: "Qual objetivo te move agora?",
    description: "Selecione até 3 metas principais.",
    options: ["Carreira", "Estudos", "Saúde", "Relações", "Finanças", "Criatividade"],
    allowMultiple: true,
  },
  {
    id: "habilidades",
    title: "Habilidades que quer desenvolver",
    description: "Vamos sugerir micro-missões alinhadas.",
    options: ["Comunicação", "Disciplina", "Networking", "Resiliência", "Foco profundo", "Autoconhecimento"],
    allowMultiple: true,
  },
  {
    id: "gatilhos",
    title: "Gatilhos de motivação",
    description: "O que te coloca em movimento?",
    options: ["Reconhecimento", "Desafio", "Aprendizado", "Impacto", "Autonomia", "Colaboração"],
    allowMultiple: true,
  },
  {
    id: "ritmo",
    title: "Ritmo de micro-missões",
    description: "Quantas entregas por semana?",
    options: ["1-2", "3-4", "5-6", "Diárias"],
    allowMultiple: false,
  },
  {
    id: "social",
    title: "Como prefere conexões?",
    description: "Ajustaremos o matching a esse estilo.",
    options: ["Conversas profundas", "Eventos curtos", "Mentoria", "Construir junto", "Observador"],
    allowMultiple: true,
  },
  {
    id: "dominios",
    title: "Domínios que quer ativar",
    description: "Eles alimentarão o Second Brain.",
    options: ["Ideias", "Projetos", "Hábitos", "Insights rápidos", "Referências", "Pessoas"],
    allowMultiple: true,
  },
  {
    id: "humor",
    title: "Clima emocional",
    description: "Para calibrar a voz do assessor.",
    options: ["Sereno", "Animado", "Reflexivo", "Ansioso", "Empolgado"],
    allowMultiple: false,
  },
  {
    id: "tempo",
    title: "Melhor momento do dia",
    description: "Quando prefere ser acionado?",
    options: ["Manhã", "Tarde", "Noite", "Madrugada"],
    allowMultiple: false,
  },
  {
    id: "formatos",
    title: "Formatos favoritos",
    description: "Como quer receber micro-insights?",
    options: ["Texto curto", "Listas", "Áudio", "Referências", "Perguntas provocativas"],
    allowMultiple: true,
  },
  {
    id: "limites",
    title: "Limites e cuidados",
    description: "O que devemos evitar?",
    options: ["Notificações excessivas", "Tarefas longas", "Tom sério", "Tom informal", "Feedback direto"],
    allowMultiple: true,
  },
  {
    id: "entrega",
    title: "Como quer iniciar?",
    description: "Escolha o primeiro movimento do assessor.",
    options: ["Roteiro de foco da semana", "Mapeamento de interesses", "Missão de 24h", "Organizar ideias soltas"],
    allowMultiple: false,
  },
];

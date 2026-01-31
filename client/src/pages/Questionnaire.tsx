import { BrainIcon } from "@/components/BrainIcon";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const questions = [
  {
    question: "Quando você está em uma festa, você:",
    options: [
      { text: "Adoro conhecer pessoas novas", category: "extraversion", score: 5 },
      { text: "Prefiro conversar com amigos próximos", category: "extraversion", score: 3 },
      { text: "Fico em um canto observando", category: "extraversion", score: 1 }
    ]
  },
  {
    question: "E quando você precisa tomar uma decisão importante, você:",
    options: [
      { text: "Analiso todos os dados e fatos", category: "conscientiousness", score: 5 },
      { text: "Sigo minha intuição", category: "openness", score: 5 },
      { text: "Peço conselho de várias pessoas", category: "agreeableness", score: 5 }
    ]
  },
  {
    question: "Interessante! Como você lida com mudanças inesperadas?",
    options: [
      { text: "Adoro novidades e mudanças", category: "openness", score: 5 },
      { text: "Me adapto com o tempo", category: "neuroticism", score: 3 },
      { text: "Prefiro rotina e previsibilidade", category: "conscientiousness", score: 5 }
    ]
  },
  {
    question: "Quando você inicia um novo projeto, você prefere:",
    options: [
      { text: "Planejar tudo antes de começar", category: "conscientiousness", score: 5 },
      { text: "Ir fazendo e ajustando no caminho", category: "openness", score: 5 },
      { text: "Ter uma ideia geral e improvisar", category: "extraversion", score: 4 }
    ]
  },
  {
    question: "Você se considera mais:",
    options: [
      { text: "Realista e prático", category: "conscientiousness", score: 5 },
      { text: "Criativo e imaginativo", category: "openness", score: 5 },
      { text: "Um equilíbrio dos dois", category: "agreeableness", score: 3 }
    ]
  }
];

export default function Questionnaire() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<{ question: string; answer: string; category: string; score: number }>>([]);
  
  const savePersonality = trpc.personality.save.useMutation({
    onSuccess: () => {
      toast.success("Perfil criado com sucesso!");
      // Após concluir o questionário, encaminhe para login.
      // A Home exige sessão e sem cookie pode gerar loop.
      setLocation("/login");
    },
    onError: (error) => {
      toast.error("Erro ao salvar perfil: " + error.message);
      // Mesmo em erro, siga para login para que o usuário se autentique
      // e repita/recupere o processo sem travar na tela do formulário.
      setLocation("/login");
    }
  });

  const handleAnswer = (option: { text: string; category: string; score: number }) => {
    const newAnswers = [
      ...answers,
      {
        question: questions[currentQuestion]?.question || "",
        answer: option.text,
        category: option.category,
        score: option.score
      }
    ];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calcular scores do Big Five
      const scores = {
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0
      };

      const counts = {
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0
      };

      newAnswers.forEach(answer => {
        const category = answer.category as keyof typeof scores;
        scores[category] += answer.score;
        counts[category]++;
      });

      // Normalizar scores (média de 0 a 5)
      Object.keys(scores).forEach(key => {
        const category = key as keyof typeof scores;
        if (counts[category] > 0) {
          scores[category] = scores[category] / counts[category];
        }
      });

      savePersonality.mutate({
        bigFiveScores: scores,
        answers: newAnswers.map(a => ({
          question: a.question,
          answer: a.answer,
          category: a.category
        }))
      });
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4 glass-effect rounded-2xl p-4">
          <BrainIcon className="w-12 h-12" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Criando seu segundo eu</h2>
            <p className="text-sm text-muted-foreground">Teste de personalidade Big Five</p>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[oklch(0.65_0.25_270)] to-[oklch(0.60_0.22_290)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            {answers.slice(-3).map((answer, index) => (
              <div key={index} className="flex justify-start">
                <div className="max-w-[80%] glass-effect rounded-2xl p-4">
                  <p className="text-white">{answer.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-[85%]">
              <BrainIcon className="w-10 h-10 flex-shrink-0" />
              <div className="glass-effect rounded-2xl p-4">
                <p className="text-white">{question?.question}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {question?.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option)}
                variant="outline"
                className="w-full h-auto py-4 px-6 text-left justify-start border-border text-white hover:bg-muted/20 transition-all"
                disabled={savePersonality.isPending}
              >
                {option.text}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

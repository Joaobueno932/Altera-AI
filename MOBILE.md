# App mobile (Expo + React Native)

O app mobile vive em `mobile/` e consome o backend Node/Express existente como API.

## Requisitos
- Node 18+
- pnpm 10.x
- Expo CLI (opcional, pode usar `pnpm start` dentro de `mobile/`)

## Como rodar
1. Suba o backend como já acontece hoje:
   ```bash
   pnpm dev
   ```
2. Em outro terminal, instale as dependências do app mobile e inicie o bundler:
   ```bash
   cd mobile
   pnpm install
   pnpm start
   ```
3. Use o QR Code/executores do Expo para abrir no emulador ou dispositivo.

## Configurando a URL da API
- O app lê `EXPO_PUBLIC_BACKEND_BASE_URL` do `.env` (arquivo criado dentro de `mobile/`).
- Valor padrão para dev: `http://10.0.2.2:3000` (Android emulador) ou `http://localhost:3000` (web/ios simulador).
- A URL é centralizada em `mobile/src/config/env.ts` e usada pela camada de API `mobile/src/lib/api.ts`.

## Estrutura principal
- `mobile/src/navigation/AppNavigator.tsx`: rotas (Splash, Login, Onboarding, Chat, Settings).
- `mobile/src/screens/*`: telas inspiradas no client/ web.
- `mobile/src/lib/api.ts`: cliente tRPC apontando para `/api/trpc` do backend.
- `mobile/src/store/*`: Zustand para sessão/onboarding e histórico do chat.
- `mobile/src/components/*`: botões, inputs e layout base mobile-first.

## Reuso de tipos e dados
- Dados de onboarding são compartilhados via `shared/onboardingData.ts`.
- Tipos do chat (`ChatMessage`, `ProcessedChat`) e do roteador tRPC são importados do backend para manter contrato único.

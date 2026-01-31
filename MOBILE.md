# App mobile (Expo + React Native)

O app mobile vive em `mobile/` e consome o backend Node/Express existente como API.

## Requisitos
- Node 18+
- pnpm 10.x
- Expo CLI (opcional, pode usar `pnpm start` dentro de `mobile/`)

## Execução do backend (Windows/Unix)
- Dev (sempre dev):
  - Na raiz do repositório: `pnpm dev` (o servidor roda com Vite middleware/hot reload).
- Produção (build + estáticos):
  1. `pnpm build`
  2. Para iniciar:
     - Padrão: `pnpm start` — força `NODE_ENV=production` quando a variável não estiver definida e executa `dist/index.js`.
     - Unix/Mac garantido: `pnpm start:unix` — define `NODE_ENV=production` inline e executa o bundle.
     - Windows PowerShell garantido: `pnpm start:win` — define `NODE_ENV=production` via PowerShell e executa o bundle.
  
Observação: não usamos cross-env. Em produção local, prefira `pnpm start` após o build.

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

### Importante: QR Code deve apontar para IP da LAN (não 127.0.0.1)
- Problema comum no Windows: o Expo às vezes não detecta o IP da rede e cai em `127.0.0.1`, o que torna o QR Code inutilizável no celular (app Expo Go mostra que não há conteúdo).
- Correção implementada: o script `pnpm start` agora força o hostname do packager para o seu IPv4 da LAN automaticamente, definindo as variáveis `REACT_NATIVE_PACKAGER_HOSTNAME` e `EXPO_PACKAGER_HOSTNAME` antes de iniciar o Expo com `--host lan`.
- Override manual (opcional, quando há múltiplas interfaces):
  - Unix/macOS (bash/zsh): `LAN_IP=192.168.x.x pnpm start`
  - Windows PowerShell: `$env:LAN_IP="192.168.x.x"; pnpm start`
- Fallback por túnel (útil em redes restritivas): `pnpm run start:tunnel`
- Critério visual: nos logs do Expo, o endereço deve aparecer como `exp://192.168.x.x:8081` (ou similar), nunca `exp://127.0.0.1:8081`.

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

## Detalhes técnicos da correção do Expo (Windows/macOS/Linux)
- Script: `mobile/scripts/start-expo-lan.mjs`
  - Detecta automaticamente um IPv4 válido via `os.networkInterfaces()` ignorando interfaces internas, `127.*` e link-local `169.254.*`.
  - Permite override via `LAN_IP` caso você precise escolher manualmente.
  - Define `REACT_NATIVE_PACKAGER_HOSTNAME` e `EXPO_PACKAGER_HOSTNAME` com o IP detectado.
  - Inicia o Expo com `expo start --host lan --clear` herdando o ambiente atual.
  - Se não encontrar IP, mostra instruções claras para usar `LAN_IP` manualmente ou acionar `start:tunnel`.

### Scripts úteis (dentro de mobile/)
- `pnpm start` ou `pnpm run start:lan`: força LAN com hostname resolvido automaticamente.
- `pnpm run start:tunnel`: inicia via túnel (fallback), útil quando LAN não funciona.

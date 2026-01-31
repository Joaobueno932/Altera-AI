# App Mobile (Expo + React Native)

Este app vive em `mobile/` e foi configurado para iniciar em modo LAN por padrão, garantindo que o QR Code no Expo Go use o IP da rede local (exp://192.168.x.x:8081) em vez de 127.0.0.1.

## Requisitos
- Node 18+
- pnpm 10+
- Expo (CLI é instalada como dependência do projeto via expo package)

## Scripts principais
- `pnpm start` — Inicia o bundler em LAN e limpa o cache do Metro (`expo start --host lan --clear`).
- `pnpm run start:lan` — Força host LAN e limpa o cache.
- `pnpm run start:tunnel` — Fallback via túnel quando a descoberta de IP falhar.
- `pnpm run start:localhost` — Útil para testes locais (não recomendado para QR no celular).
- `pnpm run clean:expo` — Remove a pasta `.expo` e `node_modules` e inicia com `--clear` (usa `rimraf` compatível cross‑platform).

## Como rodar (Windows/Mac/Linux)
1. Instale as dependências:
   - Na raiz do repo: `pnpm install`
   - Em `mobile/` (opcional se já instalou na raiz): `pnpm install`
2. Inicie o bundler do Expo em LAN:
   ```sh
   pnpm start
   ```
3. Escaneie o QR Code com o Expo Go no celular na mesma rede Wi‑Fi. A URL deve aparecer como `exp://<IP-LAN>:8081`.

Se ainda aparecer `exp://127.0.0.1:8081`, consulte o arquivo `TROUBLESHOOTING.md` e/ou use o fallback:
```sh
pnpm run start:tunnel
```

## Compatibilidade de versões
O projeto está alinhado ao Expo SDK 51:
- `expo`: `~51.x`
- `react-native`: `0.74.5`
- `typescript`: `~5.3.3`
- `@types/react`: `~18.2.79`

Observações:
- Não usamos `@types/react-native` (as tipagens já são fornecidas no RN moderno; manter esse pacote costuma gerar conflitos).
- Para instalar/atualizar pacotes do ecossistema Expo/RN, prefira `npx expo install <pacote>`.

## Backend/API
Defina `EXPO_PUBLIC_BACKEND_BASE_URL` no arquivo `mobile/.env` se necessário. Para emuladores Android use `http://10.0.2.2:3000`. Para dispositivo físico na mesma rede, use o IP do seu backend, por exemplo `http://192.168.1.100:3000`.

## Comandos de validação (Windows)
- `pnpm install`
- `pnpm start` (verificar que o QR mostra `exp://<IP-LAN>:8081`)
- `pnpm run start:tunnel` (fallback via túnel quando LAN não for possível)

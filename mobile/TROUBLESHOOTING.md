# Troubleshooting — Expo em localhost (127.0.0.1) / QR inválido

Se o QR Code do Expo mostrar `exp://127.0.0.1:8081` (localhost) em vez de `exp://<IP-LAN>:8081`, siga estes passos.

## 1) Limpeza de estado do Expo e cache do Metro
Em `mobile/`, execute:

```sh
pnpm run clean:expo
```

O comando remove `.expo` e `node_modules` e reinicia o bundler com `--clear`. Depois disso, tente novamente:

```sh
pnpm start
```

## 2) Forçar host LAN ou usar fallback por túnel
- Forçar LAN (padrão):
  ```sh
  pnpm run start:lan
  ```
- Se o IP local não for detectado corretamente (Windows com múltiplas interfaces, VPN, etc.), use o túnel:
  ```sh
  pnpm run start:tunnel
  ```

## 3) Conferir rede
- Certifique-se de que o celular e o computador estão na mesma rede Wi‑Fi.
- Desative VPNs temporariamente.
- Em Windows, às vezes o Expo prioriza o loopback quando há interfaces virtuais; reiniciar a máquina pode ajudar.

## 4) Verificar versões
Este projeto está configurado para o Expo SDK 51, com:
- `react-native@0.74.5`
- `typescript@~5.3.3`
- `@types/react@~18.2.79`

Evite instalar `@types/react-native`. Para atualizar bibliotecas do ecossistema Expo, use:

```sh
npx expo install <pacote>
```

## 5) Backend acessível na rede
Se o app precisar do backend durante o desenvolvimento, configure `EXPO_PUBLIC_BACKEND_BASE_URL` no arquivo `mobile/.env` apontando para o IP da sua máquina, por exemplo:

```
EXPO_PUBLIC_BACKEND_BASE_URL=http://192.168.1.100:3000
```

## 6) Diagnóstico extra
- Rode `ipconfig` (Windows) ou `ifconfig`/`ip addr` (Unix) para confirmar seu IP.
- Se o Metro insistir em 127.0.0.1 mesmo com `--host lan`, remova novamente `.expo`, feche terminais do Expo, e tente `start:tunnel` como alternativa imediata.

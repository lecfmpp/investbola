# brasileirao-feed

Publica um snapshot real da tabela e da rodada atual do Campeonato Brasileiro
Série A 2026 como um arquivo JSON estático — sem precisar de servidor, sem
precisar de chave de API. Um GitHub Action roda a cada 20 minutos, busca os
dados via o pacote open-source [`campeonato-brasileiro-api`](https://github.com/ezefranca/campeonato-brasileiro-api)
e commita o resultado em `data/brasileirao.json`.

O InvestBola (via Supabase `pg_net`) só precisa fazer um `GET` simples nesse
arquivo pela URL "raw" do GitHub — o mesmo padrão já usado para sincronizar
dados do Transfermarkt.

## Como colocar no ar (uma vez só)

1. Crie um repositório **público** novo no GitHub (precisa ser público para o
   `raw.githubusercontent.com` funcionar sem autenticação).
2. Suba o conteúdo desta pasta pra esse repositório:
   ```
   cd brasileirao-feed
   git init
   git add .
   git commit -m "chore: initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```
3. No GitHub, vá em **Actions** do repositório e confirme que o workflow
   "Update Brasileirão feed" está habilitado (pode rodar manualmente pelo botão
   "Run workflow" pra testar sem esperar os 20 minutos).
4. Depois da primeira execução, o arquivo estará disponível publicamente em:
   ```
   https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPOSITORIO/main/data/brasileirao.json
   ```
5. Me manda essa URL — eu conecto o Supabase nela pra puxar os placares e
   resultados reais pro Mercado ao Vivo e pros perfis de clube.

## Limitação atual

A fonte expõe de forma estável a classificação e a rodada ativa. Não fabrica
histórico de rodadas passadas além do que a página de origem entrega — então,
por enquanto, o "próximos jogos"/"últimos resultados" por clube vai se
consolidando com dados reais ao longo do tempo (cada rodada que passa a ser
"atual" fica registrada), em vez de já vir populado com o histórico completo
do campeonato desde o início.

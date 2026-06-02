# Processo de Deploy - Dashboard BI Gigante

Este documento detalha o processo de deploy da aplicação para garantir que futuros gestores e desenvolvedores consigam atualizar a versão em produção de maneira fácil, rápida e segura.

## 🔄 Visão Geral da Esteira

O processo de deploy utiliza a integração do repositório Git com o **Portainer**. Dessa forma, não é necessário acessar o servidor via SSH para subir uma nova versão, bastando atualizar o código no GitHub e acionar a atualização no painel do Portainer.

O fluxo de atualização consiste em 3 passos simples:
1. **Commit e Push** das alterações para o repositório.
2. **GitHub Actions (Automático):** O GitHub detecta o push na branch `main`, constrói a nova imagem Docker e envia para o Docker Hub automaticamente.
3. **Acesso ao Portainer** para gerenciar a stack/container.
4. **Re-deploy** baixando a última versão da imagem.

---

## ⚙️ Configuração da Esteira Automática (GitHub Actions)

Para que o passo 2 funcione e a imagem seja atualizada no Docker Hub automaticamente, é **obrigatório** configurar os seguintes secrets no repositório do GitHub (em *Settings > Secrets and variables > Actions*):

- `DOCKERHUB_USERNAME`: Seu nome de usuário no Docker Hub.
- `DOCKERHUB_TOKEN`: Um token de acesso gerado no Docker Hub (em *Account Settings > Security > New Access Token*).

*(O arquivo que controla essa automação está em `.github/workflows/docker-publish.yml`)*

---

## 🛠️ Passo a Passo para Atualização

### Passo 1: Enviar o código atualizado (Push)

Antes de qualquer deploy, garanta que todas as alterações foram testadas localmente e enviadas para a branch principal (`main` ou `master`) do repositório:

```bash
# Adicione todas as alterações
git add .

# Crie o commit com uma mensagem descritiva
git commit -m "feat: sua mensagem descrevendo a atualizacao"

# Envie para o GitHub
git push origin main
```

### Passo 2: Atualização pelo Portainer

Como a esteira está configurada no Portainer (usando Docker Compose/Stacks), siga estes passos:

1. Acesse o painel do **Portainer** pelo navegador.
2. Selecione o ambiente (`Environment` / `Local` ou o nome do seu servidor).
3. No menu lateral esquerdo, clique em **Stacks** (se a aplicação foi criada como Stack via docker-compose) ou **Containers** (se for um container avulso).

#### Cenário A: Atualizando via "Stacks" (Recomendado)
Se o projeto está sendo gerenciado como uma Stack atrelada ao Git:
1. Clique no nome da Stack do projeto (ex: `gigante_bi`).
2. Abra a aba **Editor**.
3. Role a página até o final e encontre o botão **Update the stack**.
4. ⚠️ **MUITO IMPORTANTE:** Ative a chave **"Re-pull image and redeploy"** (Isso garante que o Docker vai baixar a última versão do código/imagem antes de reiniciar).
5. Clique no botão **Update**. O Portainer vai fazer o build/pull e reiniciar o sistema automaticamente com a nova versão.

#### Cenário B: Atualizando via "Containers"
Se a imagem for gerada via CI/CD e o Portainer apenas roda o container final:
1. Vá em **Containers**.
2. Clique no container da aplicação (ex: `gigante_bi_web`).
3. No topo da tela, clique no botão **Recreate**.
4. ⚠️ **MUITO IMPORTANTE:** Ative a chave **"Pull latest image"**.
5. Confirme em **Recreate**.

---

## ⚙️ Variáveis de Ambiente e Configurações

O nosso arquivo `docker-compose.yml` está configurado para expor a porta `3000`. Além disso, ele utiliza variáveis de ambiente. Caso precise alterar senhas do banco ou chaves secretas no futuro, as variáveis devem ser atualizadas na aba **Env** dentro da Stack no Portainer:

- `DATABASE_URL`: String de conexão com o banco PostgreSQL.
- `NEXTAUTH_SECRET`: Chave secreta de autenticação do Next.js.
- `NEXTAUTH_URL`: URL base da aplicação (ex: `https://bi.gigante.com.br`).

---

## 🚨 Troubleshooting (Resolução de Problemas)

- **O sistema não atualizou as alterações:** Verifique se marcou a opção *"Re-pull image and redeploy"* no Portainer. Se não marcar, ele vai usar o código velho em cache.
- **Erro de banco de dados após o deploy:** Caso tenha adicionado novas tabelas ou modificado o `schema.prisma`, certifique-se de que o comando `npx prisma db push` ou `npx prisma migrate deploy` foi executado no processo de build ou no banco de dados.
- **O container não sobe:** Vá na seção "Containers", clique no ícone de "Logs" (folha de papel) ao lado do container e verifique qual erro impediu a inicialização.

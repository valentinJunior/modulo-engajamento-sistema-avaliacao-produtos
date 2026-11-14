# Nome da Funcionalidade 
Sign-Up (Criação de conta)

## Contexto
Precisamos implementar o fluxo para criação de contas na plataforma, as pessoas precisarão fornecer:
- Primeiro nome
- Sobrenome
- Email
- Senha
- Confirmação de senha

## Escopo 
Front-End, Back-End, Banco de Dados

## Requisitos funcionais
1. Precisamos adicionar validação no formulário na camada de cliente 
   1. Caso o formulário esteja válido podemos enviar a requisição para a API
2. Os campos de nome e sobrenome devem ser separados
3. Precisamos criar uma nova conta no banco de dados na tabela de `accounts`
   1. `id`: nanoid (gerado com `nanoid` na camada de API)
   2. `first_name`: text
   3. `last_name`: text
   4. `created_at`: timestamp
   5. `active`: boolean (padrão `true`)
   6. `email`: text (único, sem diferenciar maiúsculas/minúsculas; salvo em minúsculas)
   7. `password`: text (hash gerado com `bcrypt`, custo 12)
   8. `salt`: text (salt gerado com `bcrypt.genSalt`; armazenado como gerado, sem hash)
   9. `updated_at`: timestamp
4. A requisição deve ser uma procedure tRPC (mutation) `auth.signUp`, exposta como `POST` para `/api/v1/auth.signUp`, recebendo os dados como JSON no `body`
5. Caso tudo dê certo, retornar `201`, ou erros de acordo com a validação:
   1. `400`: Má formatação de dados
   2. `409`: Email já cadastrado
6. A senha deve ter entre 8 caracteres e 72 bytes (limite do `bcrypt`)

## Requisitos não funcionais
- Segurança: Precisamos salvar as senhas de forma segura no banco de dados:
  - Hash de senha com `bcrypt`
  - Precisamos receber os dados do cliente de forma segura usando HTTPS (para prevenir network sniff); em produção o HTTPS é garantido pela Vercel
- UI/UX: Boa experiência de uso através de uma interface bonita, elegante, moderna
- Performance: O processo de criação de conta precisa ser rápido

## Você deve
- Criar a base do projeto com um endpoint inicial para criação de conta
- Criar a base do projeto com uma página inicial para a interface de criação de conta
- Configurar as bibliotecas base

## Você não deve
- Implementar qualquer outra funcionalidade que não esteja relacionada com Sign-up (criação de conta).
- Não vamos realizar nenhum envio de email no momento, apenas processar a requisição, salvar no banco de dados e retornar um sucesso

## Tecnologias (Stack)
React.js, Next.js, React-Hook-Form, Zod, Shadcn, Tailwind, Supabase (local via Docker ou externo em supabase.com — definido por `SUPABASE_URL` + `SUPABASE_SECRET_KEY`/`SUPABASE_SERVICE_ROLE_KEY` no `.env.local`; migrations em `supabase/migrations`, aplicadas com `db:reset` no local e `db:push` no externo), tRPC, bcrypt, Bunjs.

## Critérios de aceitação
- Temos uma página para criar a nova conta em `/auth/sign-up`
- A página contém um formulário com validação
- A plataforma consegue se comunicar com a API para enviar os dados e receber uma resposta
- Estamos informando possíveis erros
  - Mostrar um alert em vermelho no formulário
  - Email já cadastrado (`409`) exibe o erro no campo de email
- Estamos informando o sucesso de criação da conta
  - Navegar para `/auth/sign-up/success`

## Resultados
Pessoas conseguem criar uma nova conta na plataforma

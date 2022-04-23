<img src="https://github.com/henriqueritter/Bootcamp-Ignite-Node/blob/main/cover-node.js.png" alt="Ignite Trilha Node.js"></img>

## Desafio de Testes Unitários e Integrados com JEST

<img src="https://github.com/henriqueritter/ignite-desafio-tests-challenge/blob/main/coverage_useCases.png" alt="Print Coverage Reports"></img>

Para este desafio foram criados testes unitários e de integração na FinAPI.

https://www.notion.so/Desafio-02-Testes-de-integra-o-70a8af48044d444cb1d2c1fa00056958


## Rotas da aplicação

### POST `/api/v1/users`

A rota recebe `name`, `email` e `password` dentro do corpo da requisição, salva o usuário criado no banco e retorna uma resposta vazia com status `201`.

### POST `/api/v1/sessions`

A rota recebe `email` e `password` no corpo da requisição e retorna os dados do usuário autenticado junto à um token JWT.

<aside>
💡 Essa aplicação não possui refresh token, ou seja, o token criado dura apenas 1 dia e deve ser recriado após o período mencionado.

</aside>

### GET `/api/v1/profile`

A rota recebe um token JWT pelo header da requisição e retorna as informações do usuário autenticado.

### GET `/api/v1/statements/balance`

A rota recebe um token JWT pelo header da requisição e retorna uma lista com todas as operações de depósito e saque do usuário autenticado e também o saldo total numa propriedade `balance`.

### POST `/api/v1/statements/deposit`

A rota recebe um token JWT pelo header e `amount` e `description` no corpo da requisição, registra a operação de depósito do valor e retorna as informações do depósito criado com status `201`.

### POST `/api/v1/statements/withdraw`

A rota recebe um token JWT pelo header e `amount` e `description` no corpo da requisição, registra a operação de saque do valor (caso o usuário possua saldo válido) e retorna as informações do saque criado com status `201`.

### GET `/api/v1/statements/:statement_id`

A rota recebe um token JWT pelo header e o id de uma operação registrada (saque ou depósito) na URL da rota e retorna as informações da operação encontrada.

-----------------------------------------------------------------
# Desafio: Transferências com a FinAPI

Desafio do Módulo V da trilha Ignite Node.js

## 💻 Sobre o desafio

Nesse desafio você irá implementar uma nova funcionalidade na FinAPI, a aplicação que foi testada durante o desafio **[Testes unitários](https://www.notion.so/Desafio-01-Testes-unit-rios-0321db2af07e4b48a85a1e4e360fcd11)**.

A nova funcionalidade deverá permitir a transferência de valores entre contas. Para isso, você pode pensar na melhor forma de construir essa solução mas alguns requisitos deverão ser cumpridos:

- Não deve ser possível transferir valores superiores ao disponível no saldo de uma conta;
- O balance (obtido através da rota `/api/v1/statements/balance`) deverá considerar também todos os valores transferidos ou recebidos através de transferências ao exibir o saldo de um usuário;
- As informações para realizar uma transferência serão:

    ```json
    {
    	"amount": 100,
    	"description": "Descrição da transferência"
    }
    ```

    Você pode passar o `id` do usuário destinatário via parâmetro na rota (exemplo: `/api/v1/statements/transfers/:user_id`) e o id do usuário remetente poderá ser obtido através do token JWT enviado no header da requisição;

- Ao mostrar o balance de um usuário, operações do tipo `transfer` deverão possuir os seguintes campos:

    ```json
    {
      "id": "4d04b6ec-2280-4dc2-9432-8a00f64e7930",
    	"sender_id": "cfd06865-11b9-412a-aa78-f47cc3e52905",
      "amount": 100,
      "description": "Transferência de valor",
      "type": "transfer",
      "created_at": "2021-03-26T21:33:11.370Z",
      "updated_at": "2021-03-26T21:33:11.370Z"
    }
    ```

    Observe o campo `sender_id`. Esse deverá ser o `id` do usuário que enviou a transferência.
    O campo `type` também deverá exibir o tipo da operação, que nesse caso é `transfer`.


---

<aside>
💡 Esse desafio não possui testes. Você poderá realizar as alterações no mesmo repositório usado para o desafio de testes unitários e submeter novamente na plataforma.

</aside>

# 📅 Entrega

Esse desafio deve ser entregue a partir da plataforma da Rocketseat. Envie o link do repositório que você fez suas alterações. Após concluir o desafio, além de ter mandado o código para o GitHub, fazer um post no Linkedin é uma boa forma de demonstrar seus conhecimentos e esforços para evoluir na sua carreira para oportunidades futuras.

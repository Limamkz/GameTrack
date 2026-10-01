GAMETRACK API

1. COMO EXECUTAR

1. Instale o Node.js.
2. Abra o terminal dentro da pasta do projeto.
3. Execute:

   npx json-server --watch db.json

4. A API ficará disponível em:

   http://localhost:3000/jogos

5. Abra o index.html no navegador.

IMPORTANTE:
O JSON Server precisa estar ligado para o site funcionar.

2. ROTAS TESTADAS NO INSOMNIA

GET
http://localhost:3000/jogos

GET por ID
http://localhost:3000/jogos/1

POST
http://localhost:3000/jogos

Exemplo de Body JSON:

{
  "titulo": "Hollow Knight",
  "genero": "Metroidvania",
  "plataforma": "PC",
  "nota": 10,
  "status": "Finalizado"
}

PUT
http://localhost:3000/jogos/1

Exemplo de Body JSON:

{
  "titulo": "EA FC 26",
  "genero": "Esporte",
  "plataforma": "PlayStation",
  "nota": 10,
  "status": "Finalizado"
}

DELETE
http://localhost:3000/jogos/6

3. FILTROS DA API

Filtro por status:
http://localhost:3000/jogos?status=Finalizado

Filtro por plataforma:
http://localhost:3000/jogos?plataforma=PC

Outros exemplos:
http://localhost:3000/jogos?status=Jogando
http://localhost:3000/jogos?genero=RPG

4. PERGUNTAS DA ETAPA 5

1. Em qual momento você deve limpar os campos do formulário?
Depois que o POST ou PUT for concluído com sucesso, para não apagar os dados caso a operação dê erro.

2. O que acontece se o servidor estiver desligado?
O fetch não consegue acessar a API e gera um erro de conexão. O sistema captura esse erro e mostra uma mensagem para o usuário.

3. Por que é melhor ter uma função separada apenas para carregar os jogos?
Porque a mesma função pode ser reutilizada depois de cadastrar, editar ou excluir, mantendo a interface sincronizada com os dados da API.

4. Qual a diferença entre o objeto criado no formulário e a resposta devolvida pela API?
O objeto do formulário contém os dados enviados pelo usuário. A resposta da API contém o registro processado pelo servidor e pode incluir o ID gerado ou outros dados retornados.

5. DESAFIO DA NOTA FORA DO PADRÃO

O JSON Server, por padrão, não impede automaticamente uma nota fora de 0 a 10. A validação precisa ser feita pelo front-end ou por regras implementadas no back-end.

Neste projeto, o JavaScript bloqueia notas menores que 0 e maiores que 10 antes de enviar o POST ou PUT.
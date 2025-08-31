# Especificações do Projeto

<span style="color:red">Pré-requisitos: <a href="01-Documentação de Contexto.md"> Documentação de Contexto</a></span>

Definição do problema e ideia de solução a partir da perspectiva do usuário. 

## Usuários
<table>
<tbody>
<tr align=center>
<td width="200px"><b>Tipo de Usuário</b></td>
<td width="300px"><b>Descrição</b></td>
<td width="300px"><b>Responsabilidade</b></td>
</tr>
<tr>
<td>Especialista Segurança do Trabalho</td>
<td>Pessoa tecnicamente qualificada para exercer função de avaliações de segurança do trabalho</td>
<td>Responsável por fazer levantamento de dados e definir aptidão da empresa e/ou pessoa analisada. Visando maior segurança para o contratante.</td>
</tr>
<tr>
<td>Administrador do Sistema</td>
<td>Pessoa que mantem a estrutura de dados de forma organizada e coerente</td>
<td>Responsãvel pela inserção de dados no sistema, novos cadastros, atualizações e manutenções</td>
</tr>
</tbody>
</table>

## Arquitetura e Tecnologias

Este projeto é uma aplicação **Fullstack** composta por:

- **Backend**: .NET WebAPI  
- **Banco de Dados**: PostgreSQL  
- **Frontend**: React + TypeScript (buildado e servido pelo Nginx)  
- **Nginx**: Servidor Web + Proxy reverso para a API

## Project Model Canvas

Deve ser desenvolvido a partir do microfundamento: Empreendedorismo e inovação.
Colocar a imagem do modelo construído apresentando a proposta de solução.

## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto. Para determinar a prioridade de requisitos, aplicar uma técnica de priorização de requisitos e detalhar como a técnica foi aplicada.

Para mais informações, consulte os microfundamentos Fundamentos de Engenharia de Software e Engenharia de Requisitos de Software. 

### Requisitos Funcionais

<table>
<tbody>
<tr align=center>
<td width="100px"><b>ID</b></td>
<td width="500px"><b>Descrição do Requisito</b></td>
<td width="200px"><b>Prioridade</b></td>
</tr>
<tr>
<td>RF-01</td>
<td>Permitir o usuário cadastrar as empresas que possuem contrato</td>
<td>Alta</td>
</tr>
<tr>
<td>RF-02</td>
<td>Permitir o usuário cadastrar as pessoas que serão avaliadas para emissão de laudo</td>
<td>Alta</td>
</tr>
<tr>
<td>RF-03</td>
<td>Permitir vincular pessoa à empresa contratada</td>
<td>Média</td>
</tr>
<tr>
<td>RF-04</td>
<td>Permitir o usuário emitir os laudos técnicos para consulta posterior</td>
<td>Alta</td>
</tr>
</tbody>
</table>

### Requisitos não Funcionais

|ID     | Descrição do Requisito  |Prioridade |
|-------|-------------------------|----|
|RNF-001| O sistema deve ser responsivo para rodar em um dispositivos móvel | MÉDIA | 
|RNF-002| Deve processar requisições do usuário em no máximo 3s |  BAIXA | 

Com base nas Histórias de Usuário, enumere os requisitos da sua solução. Classifique esses requisitos em dois grupos:

## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

|ID| Restrição                                             |
|--|-------------------------------------------------------|
|01| O projeto deverá ser entregue até o final do semestre |
|02| Não pode ser desenvolvido um módulo de backend        |

Enumere as restrições à sua solução. Lembre-se de que as restrições geralmente limitam a solução candidata.

> **Links Úteis**:
> - [O que são Requisitos Funcionais e Requisitos Não Funcionais?](https://codificar.com.br/requisitos-funcionais-nao-funcionais/)
> - [O que são requisitos funcionais e requisitos não funcionais?](https://analisederequisitos.com.br/requisitos-funcionais-e-requisitos-nao-funcionais-o-que-sao/)

## Diagrama de Caso de Uso

O diagrama de casos de uso é o próximo passo após a elicitação de requisitos, que utiliza um modelo gráfico e uma tabela com as descrições sucintas dos casos de uso e dos atores. Ele contempla a fronteira do sistema e o detalhamento dos requisitos funcionais com a indicação dos atores, casos de uso e seus relacionamentos. 

Para mais informações, consulte o microfundamento Engenharia de Requisitos de Software 

As referências abaixo irão auxiliá-lo na geração do artefato “Diagrama de Casos de Uso”.

> **Links Úteis**:
> - [Criando Casos de Uso](https://www.ibm.com/docs/pt-br/elm/6.0?topic=requirements-creating-use-cases)
> - [Como Criar Diagrama de Caso de Uso: Tutorial Passo a Passo](https://gitmind.com/pt/fazer-diagrama-de-caso-uso.html/)
> - [Lucidchart](https://www.lucidchart.com/)
> - [Astah](https://astah.net/)
> - [Diagrams](https://app.diagrams.net/)

## Modelo da Base de Dados

# Para banco de dados relacional:
- Apresentar o MER (Modelo Entidade-Relacionamento)
- Apresentar o Projeto Físico da Base de Dados (estrutura das tabelas, tipos de dados, chaves primárias e estrangeiras)
# Para banco de dados NoSQL:
Apresentar o Modelo da Base de Dados (estrutura dos documentos, coleções, ou grafos, conforme o tipo de NoSQL utilizado)


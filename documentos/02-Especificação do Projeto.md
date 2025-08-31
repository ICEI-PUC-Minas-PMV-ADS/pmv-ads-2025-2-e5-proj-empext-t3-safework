# Especificações do Projeto

A SC Prevenção enfrenta dificuldades na gestão de saúde ocupacional dos funcionários das empresas contratantes, devido à validação manual de atestados, exames periódicos e registros de aptidão. A falta de alertas sobre vencimentos e a ausência de integração com sistemas governamentais tornam o processo lento, sujeito a erros e com risco de não conformidade legal.

Para resolver esses desafios, o projeto propõe o desenvolvimento de um sistema sociotécnico integrado, capaz de centralizar o cadastro dos funcionários, automatizar a validação documental junto a órgãos governamentais e gerar alertas mensais sobre a necessidade de renovação de exames. Essa solução otimiza os processos internos da SC Prevenção, garante maior conformidade legal e facilita a gestão preventiva da saúde dos trabalhadores das empresas contratantes, ao mesmo tempo em que proporciona aos alunos a aplicação prática de conhecimentos em um contexto real.

## Usuários

| Tipo de Usuário   | Descrição | Responsabilidades |
|------------------|-----------|------------------|
| **Root** | Gerencia a aplicação e os usuários como um usuário técnico. | Gerenciar usuários, configurar o sistema, acessar funcionalidades prilivegiadas. |
| **Administrador** | Gerencia os usuários, empresas cadastradas e relatórios. | Gerenciar usuários, gerenciar empresas, acessar todos os relatórios. |
| **Funcionário** | Usa a aplicação para suas tarefas principais. | Criar e editar registros, visualizar relatórios. |


## Arquitetura e Tecnologias

O projeto será desenvolvido seguindo uma arquitetura em contêineres, utilizando o Docker Compose para orquestrar os serviços necessários. A solução será composta por dois contêineres principais:

1. Backend (.NET)

  - Responsável pela lógica de negócios, processamento de dados, integração com sistemas governamentais e gerenciamento do fluxo de validação de documentos e alertas.

  - Implementado em .NET, garantindo robustez, escalabilidade e compatibilidade com APIs externas.

2. Frontend (Vite + TypeScript) com Nginx

  - Responsável pela interface de usuário, disponibilizando dashboards, alertas e funcionalidades de gerenciamento de funcionários de forma intuitiva.

  - O frontend será servido pelo Nginx, proporcionando alto desempenho e estabilidade na entrega das páginas.

  - Desenvolvido com Vite e TypeScript, garantindo rapidez no desenvolvimento e tipagem estática para maior confiabilidade do código.

A arquitetura em contêineres permite implantação simplificada, escalabilidade e isolamento dos serviços, enquanto o PostgreSQL em servidor externo garante segurança, persistência e facilidade de manutenção dos dados. O uso do Docker Compose assegura que backend e frontend sejam iniciados e configurados de forma automatizada, promovendo consistência entre os ambientes de desenvolvimento, teste e produção.

## Project Model Canvas

Deve ser desenvolvido a partir do microfundamento: Empreendedorismo e inovação.
Colocar a imagem do modelo construído apresentando a proposta de solução.

> **Links Úteis**:
> Disponíveis em material de apoio do projeto

## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto. Para determinar a prioridade de requisitos, aplicar uma técnica de priorização de requisitos e detalhar como a técnica foi aplicada.

### Requisitos Funcionais

|ID     | Descrição do Requisito  |Prioridade |
|-------|-------------------------|----|
|RN-001| O sistema deve permitir o cadastro de funcionários das empresas associadas, incluindo informações pessoais, cargo, empresa contratante e histórico de exames. | ALTA | 
|RN-002| O sistema deve permitir o cadastro e gerenciamento das empresas associadas. |  ALTA | 
|RN-003| O sistema deve realizar validação automática de documentos junto a sistemas governamentais. |  ALTA | 
|RN-004| O sistema deve gerar alertas mensais sobre vencimento de exames periódicos e necessidade de renovação. |  ALTA | 
|RN-005| O sistema deve permitir consultas por funcionário, empresa ou status de exame e gerar relatórios de conformidade. |  MÉDIA | 
|RN-006| O sistema deve controlar diferentes perfis de usuários (administrador, gestor, colaborador) com permissões específicas. |  ALTA |

### Requisitos não Funcionais

|ID     | Descrição do Requisito  |Prioridade |
|-------|-------------------------|----|
|RNF-001| O sistema deve ser responsivo e compatível com dispositivos móveis e desktops. | MÉDIA | 
|RNF-002| O sistema deve processar requisições do usuário em no máximo 3 segundos. |  MÉDIA | 
|RNF-003| O sistema deve garantir segurança e confidencialidade dos dados, incluindo autenticação e criptografia. |  ALTA | 
|RNF-004| O sistema deve possuir interface intuitiva, fácil de usar por usuários com diferentes níveis de conhecimento em tecnologia. |  ALTA | 
|RNF-005|O sistema deve ser modular e bem documentado para facilitar manutenção e atualizações. |  MÉDIA | 
|RNF-006| O sistema deve ser compatível com diferentes navegadores e dispositivos corporativos. |  MÉDIA |


Com base nas Histórias de Usuário, enumere os requisitos da sua solução. Classifique esses requisitos em dois grupos:

## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

|ID| Restrição                                             |
|--|-------------------------------------------------------|
|01| O projeto deverá ser entregue no final do semestre letivo, não podendo extrapolar a data de 07/12/24 |
|02| A equipe não pode subcontratar o desenvolvimento do trabalho        |

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


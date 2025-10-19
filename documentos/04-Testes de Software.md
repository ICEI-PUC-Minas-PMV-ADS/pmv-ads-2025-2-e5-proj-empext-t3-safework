# Planos de Testes de Software

### Tipo de Teste
- **Sucesso**: Tem o objetivo de verificar se as funcionalidades funcionam corretamente.
- **Insucesso**: Tem o objetivo de verificar se o sistema trata erros de maneira correta.

#### Caso de Teste de Sucesso

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-001 - S<br>Login com credenciais válidas</th> 
  </tr> 
  <tr> 
    <td width="150"><strong>Descrição</strong></td> 
    <td>Verifica se um usuário consegue autenticar com credenciais válidas.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td width="430">Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Sucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>RF-15: Login; RNF-05: Segurança (autenticação)</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Acessar a tela de login.<br>
      2. Informar usuário/cpf válido.<br>
      3. Informar senha válida.<br>
      4. Clicar em "Entrar".</td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>- <strong>Usuário:</strong> usuario.admin@safework.com (ativo)<br>- <strong>Senha:</strong> Senha@Forte123</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Usuário é redirecionado para o dashboard inicial.</td> 
  </tr> 
</table>

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-002 - S<br>Logout com sessão ativa</th> 
  </tr> 
  <tr> 
    <td><strong>Descrição</strong></td> 
    <td>Verifica se o usuário consegue encerrar a sessão em segurança.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Sucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>RF-16: Logout; RNF-05: Segurança de sessão</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Estar autenticado.<br>
      2. Clicar em "Sair".
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>Conta autenticada previamente.</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Sessão finalizada e usuário retorna à tela de login.</td> 
  </tr> 
</table>

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-003 - S<br>Cadastro de Empresa contratante</th> 
  </tr> 
  <tr> 
    <td><strong>Descrição</strong></td> 
    <td>Garante que seja possível cadastrar uma empresa com dados válidos.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Sucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>RF-01: CRUD de empresas</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Acessar "Empresas".<br>
      2. Clicar em "Nova Empresa".<br>
      3. Preencher Razão Social, CNPJ, Início/Fim do contrato.<br>
      4. Salvar.
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>Razão Social: Alfa Ltda; CNPJ: 12.345.678/0001-90; Contrato: 01/01/2025–31/12/2025</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Empresa aparece listada com status "Ativa".</td> 
  </tr> 
</table>

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-004 - S<br>Anexar documento contratual à Empresa</th> 
  </tr> 
  <tr> 
    <td><strong>Descrição</strong></td> 
    <td>Confirma anexação de PDF contratual à empresa cadastrada.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Sucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>RF-02: Anexar documentos contratuais</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Abrir detalhes da empresa.<br>
      2. Clicar em "Anexar documento".<br>
      3. Selecionar arquivo PDF &lt;10MB.<br>
      4. Confirmar upload.
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>Arquivo: contrato_alfa.pdf (2,5MB, PDF)</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Documento listado com nome, tamanho e data do upload.</td> 
  </tr> 
</table>

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-005 - S<br>Filtrar contratos por período</th> 
  </tr> 
  <tr> 
    <td><strong>Descrição</strong></td> 
    <td>Valida filtro por data de início e fim de contrato na listagem de empresas.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Sucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>RF-03: Listagem e filtro de contratos</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Acessar "Empresas".<br>
      2. Informar período 01/01/2025–31/03/2025.<br>
      3. Clicar "Filtrar".
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>Intervalo de datas válido</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>A lista contém apenas contratos cujo período interseca o filtro.</td> 
  </tr> 
</table>

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-006 - S<br>Admin cadastrar colaborador do sistema</th> 
  </tr> 
  <tr> 
    <td><strong>Descrição</strong></td> 
    <td>Admin cria usuário do sistema com perfil e permissões padrão.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Sucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>RF-04: Admin gerenciar colaboradores/permissões</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Logar como Administrador.<br>
      2. Ir em "Usuários".<br>
      3. "Novo Usuário" &gt; preencher dados &gt; perfil "Colaborador".<br>
      4. Salvar.
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>Nome: Maria; Email: maria@safework.com; Perfil: Colaborador</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Usuário criado e visível na listagem com perfil correto.</td> 
  </tr> 
</table>

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-007 - S<br>Cadastro e listagem de Colaboradores (empresa contratante)</th> 
  </tr> 
  <tr> 
    <td><strong>Descrição</strong></td> 
    <td>Cadastrar colaborador (funcionário da empresa contratante) e validar sua exibição na lista.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Sucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>RF-05: Cadastro e listagem de colaboradores; RF-07: Filtros por empresa/cargo/status ASO</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Abrir "Colaboradores".<br>
      2. "Novo Colaborador" &gt; associar à empresa Alfa Ltda.<br>
      3. Preencher CPF, nome, cargo.<br>
      4. Salvar e consultar listagem.
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>CPF válido; Cargo: Operador; Empresa: Alfa Ltda</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Colaborador visível com dados corretos e empresa associada.</td> 
  </tr> 
</table>

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-008 - S<br>CRUD de ASO para colaborador</th> 
  </tr> 
  <tr> 
    <td><strong>Descrição</strong></td> 
    <td>Criar, listar, atualizar e deletar ASO de um colaborador vinculado a uma empresa.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Sucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>RF-08 a RF-12: CRUD + anexos de ASO; RF-09 listagem</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Acessar perfil do colaborador.<br>
      2. Criar ASO com datas válidas e anexo PDF.<br>
      3. Listar ASOs e abrir detalhes.<br>
      4. Atualizar validade e salvar.<br>
      5. Deletar ASO e confirmar remoção.
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>ASO: Emissão 01/02/2025; Validade 01/02/2026; Anexo PDF 1MB</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Operações CRUD concluídas sem erros e refletidas na listagem.</td> 
  </tr> 
</table>

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-009 - S<br>Validação automática de ASO no sistema do Gov</th> 
  </tr> 
  <tr> 
    <td><strong>Descrição</strong></td> 
    <td>Confirma a integração e validação automática da ASO junto ao sistema governamental e registro de comprovante.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Sucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>RF-13: Validação automática; RF-14: Comprovante (screenshot)</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Selecionar ASO válida.<br>
      2. Clicar "Validar no Gov".<br>
      3. Aguardar retorno da API.<br>
      4. Abrir comprovante.
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>ASO ativa, conexão com ambiente de homologação do Gov</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Status da ASO = "Validada" e comprovante acessível (imagem anexada ao registro).</td> 
  </tr> 
</table>

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-010 - S<br>Geração de alertas mensais de ASO vencendo</th> 
  </tr> 
  <tr> 
    <td><strong>Descrição</strong></td> 
    <td>Verifica a emissão de alertas preventivos mensais para ASOs a vencer no período.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Sucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>Objetivo específico (alertas mensais); RF-07 (filtro por status ASO)</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Executar job mensal/manual de alertas.<br>
      2. Abrir "Alertas".<br>
      3. Confirmar recebimento por Admin/Colaborador.
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>Colaborador com ASO vencendo em ≤30 dias; canal de notificação ativo (e-mail/sistema)</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Alertas gerados e visíveis; logs de execução registrados.</td> 
  </tr> 
</table>



#### Exemplo de Caso de Teste de Insucesso

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-001 - I01<br>Login com senha inválida</th> 
  </tr> 
  <tr> 
    <td width="150"><strong>Descrição</strong></td> 
    <td>Verifica tratamento de credenciais inválidas no login.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td width="430">Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Insucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>RF-15 (Login); RNF-05 (Segurança)</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Inserir usuário válido.<br>
      2. Inserir senha inválida.<br>
      3. Clicar "Entrar".
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>Senha: "123"</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Exibir mensagem "Credenciais inválidas" sem revelar motivo específico; nenhuma sessão criada.</td> 
  </tr> 
</table> 

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-002 - I02<br>Tentativas repetidas de login (bloqueio)</th> 
  </tr> 
  <tr> 
    <td><strong>Descrição</strong></td> 
    <td>Confere se o sistema aplica bloqueio temporário após várias tentativas falhas.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Insucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>RNF-05: Segurança; RF-15</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Realizar 5 tentativas de login com senha incorreta.<br>
      2. Tentar novamente com senha correta durante bloqueio.
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>Mesmo usuário; senhas erradas repetidas</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Conta/sessão bloqueada temporariamente; mensagem informativa sem expor dados sensíveis.</td> 
  </tr> 
</table> 

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-003 - I03<br>Cadastro de Empresa com CNPJ inválido</th> 
  </tr> 
  <tr> 
    <td><strong>Descrição</strong></td> 
    <td>Valida tratamento de formato/validação de CNPJ incorreto no cadastro de empresa.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Insucesso</td> </tr> <tr> <td><strong>Requisitos associados</strong></td> 
      <td>RF-01: CRUD de empresas; RNF-02: Usabilidade (validação de formulário)</td> 
    </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Abrir "Nova Empresa".<br>
      2. Preencher CNPJ "11.111.111/1111-11".<br>
      3. Salvar.
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>CNPJ com dígitos verificadores inválidos</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Bloquear gravação e exibir mensagem de CNPJ inválido.</td> 
  </tr> 
</table> 

<table> 
  <tr> 
    <th colspan="2" width="1000">CT-004 - I04<br>Anexo de contrato com tipo/tamanho inválido</th> 
  </tr> 
  <tr> 
    <td><strong>Descrição</strong></td> 
    <td>Garante tratamento de arquivo não permitido (extensão/tamanho) no upload contratual.</td> 
  </tr> 
  <tr> 
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td> 
  </tr> 
  <tr> 
    <td><strong>Tipo do Teste</strong></td> 
    <td>Insucesso</td> 
  </tr> 
  <tr> 
    <td><strong>Requisitos associados</strong></td> 
    <td>RF-02; RNF-05 (segurança de arquivos); RNF-02</td> 
  </tr> 
  <tr> 
    <td><strong>Passos</strong></td> 
    <td>
      1. Abrir "Anexar documento".<br>
      2. Selecionar arquivo .exe de 15MB.<br>
      3. Enviar.
    </td> 
  </tr> 
  <tr> 
    <td><strong>Dados de teste</strong></td> 
    <td>Arquivo: contrato.exe (15MB)</td> 
  </tr> 
  <tr> 
    <td><strong>Critérios de êxito</strong></td> 
    <td>Upload bloqueado; mensagem clara de tipo/tamanho inválido; nada salvo.</td> 
  </tr> 
</table>

<table> 
  <tr>
    <th colspan="2" width="1000">CT-005 - I01<br>Cadastro de Colaborador com CPF inválido</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica o bloqueio de cadastro quando o CPF não é válido ou já existe.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Equipe de Testes SafeWork</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td>Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-05, RF-06; RNF-02 (validação)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir "Novo Colaborador".<br>
      2. Informar CPF 000.000.000-00.<br>
      3. Salvar.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>CPF inválido/formatação incorreta</td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>Cadastro negado com mensagem de CPF inválido; nenhum registro criado.</td>
  </tr>
</table>
<table>
  <tr>
    <th colspan="2" width="1000">CT-006 - I02<br>Filtro de Colaboradores com parâmetros inconsistentes</th>
  </tr>
  <tr>
    <td><strong>Descrição</strong></td>
    <td>Garante mensagem adequada quando não há resultado ou quando parâmetros são mutuamente excludentes.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td>Equipe de Testes SafeWork</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td>Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-07 (filtros); RNF-02 (usabilidade)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir filtros de colaboradores.<br>
      2. Selecionar "ASO Vencido" e intervalo de datas impossível.<br>
      3. Aplicar filtro.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>Status e período sem interseção</td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>Exibir "Nenhum resultado" sem erro técnico; permitir limpar filtros.</td>
  </tr>
</table>
<table>
  <tr>
    <th colspan="2" width="1000">CT-007 - I03<br>Cadastro de ASO com datas inválidas</th>
  </tr>
  <tr>
    <td><strong>Descrição</strong></td>
    <td>Impede cadastro de ASO cujo fim &lt; início ou validade no passado sem justificativa.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td>Equipe de Testes SafeWork</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td>Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-08: Cadastrar ASO; RNF-02 (validação)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir "Novo ASO".<br>
      2. Informar Emissão 01/06/2025 e Validade 01/05/2025.<br>
      3. Salvar.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>Datas inconsistentes</td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>Bloquear gravação; mensagem clara de inconsistência de datas.</td>
  </tr>
</table>
<table>
  <tr>
    <th colspan="2" width="1000">CT-008 - I04<br>Anexo de ASO com vírus (simulado)</th>
  </tr>
  <tr>
    <td><strong>Descrição</strong></td>
    <td>Valida proteção ao upload de arquivos maliciosos (varredura/assinatura simulada).</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td>Equipe de Testes SafeWork</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td>Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-12 (anexo de ASO); RNF-05 (segurança)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Selecionar arquivo com assinatura EICAR simulada.<br>
      2. Tentar enviar.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>Arquivo eicar.txt (assinatura de teste AV)</td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>Upload bloqueado; log de segurança registrado; alerta ao usuário sem detalhes técnicos sensíveis.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-009 - I01<br>Falha na integração com sistema do Gov (timeout)</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Garante tratamento de indisponibilidade/timeout da API governamental ao validar ASO.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Equipe de Testes SafeWork</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td>Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-13 (validação automática); RF-14 (comprovante); RNF-03 (tempo de resposta)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Selecionar ASO e acionar "Validar no Gov".<br>
      2. Simular timeout na chamada externa.<br>
      3. Observar retorno ao usuário.</td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>Delay &gt; 30s na API externa</td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>Mensagem "Serviço indisponível, tente novamente"; operação marcada como "Pendente"; nenhuma informação inconsistente gravada.</td>
  </tr>
</table>
<table>
  <tr>
    <th colspan="2" width="1000">CT-010 - I02<br>Comprovante de validação indisponível/corrupção de screenshot</th>
  </tr>
  <tr>
    <td><strong>Descrição</strong></td>
    <td>Verifica reação do sistema quando o arquivo de comprovante não pode ser gerado ou está corrompido.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td>Equipe de Testes SafeWork</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td>Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-14 (comprovante); RNF-05 (integridade/confidencialidade)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Executar validação exitosa simulada.<br>
      2. Simular falha na geração/armazenamento do screenshot.<br>
      3. Acessar comprovante.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>Falha de I/O no storage de imagens</td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>Mensagem orientando nova tentativa de geração; registro do erro em log; manter status da ASO consistente.</td>
  </tr>
</table>
<table>
  <tr>
    <th colspan="2" width="1000">CT-011 - I03<br>Alerta mensal não gerado (scheduler parado)</th>
  </tr>
  <tr>
    <td><strong>Descrição</strong></td>
    <td>Confere comportamento quando o job de alertas não executa no período esperado.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td>Equipe de Testes SafeWork</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td>Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>Objetivo (alertas mensais); RNF-03 (confiabilidade/performance)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Desabilitar o scheduler/worker.<br>
      2. Simular passagem do período.<br>
      3. Verificar painel de alertas e logs.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>ASOs vencendo em 30 dias; worker parado</td>
  </tr>
  <tr> 
    <td><strong>Critérios de êxito</strong></td>
    <td>Sinalização no dashboard (health check) indicando job indisponível; sem falha silenciosa.
    </td>
  </tr>
</table>
<table>
  <tr>
    <th colspan="2" width="1000">CT-012 - I04<br>Acesso não autorizado a dados sensíveis (LGPD)</th>
  </tr>
  <tr> 
    <td><strong>Descrição</strong></td>
    <td>Garante que perfis sem permissão não visualizem dados médicos/ASO de colaboradores fora de seu escopo.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td> 
    <td>Equipe de Testes SafeWork</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td>Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RNF-01 (LGPD); RF-04 (permissões); RNF-05 (segurança)</td>
  </tr> 
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Logar como Colaborador de Empresa A.<br>
      2. Tentar abrir ASO de colaborador da Empresa B.<br>
      3. Tentar exportar relatório completo.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>Dois tenants/empresas configurados; usuário com escopo restrito</td>
  </tr> 
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>Acesso negado; mensagem de permissão insuficiente; evento auditado.</td>
  </tr>
</table>
 
# Evidências de Testes de Software

Apresente imagens e/ou vídeos que comprovam que um determinado teste foi executado, e o resultado esperado foi obtido. Normalmente são screenshots de telas, ou vídeos do software em funcionamento.

## Parte 1 - Testes de desenvolvimento
Cada funcionalidade desenvolvida deve ser testada pelo próprio desenvolvedor, utilizando casos de teste, tanto de sucesso quanto de insucesso, elaborados por ele. Todos os testes devem ser evidenciados.

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 -S<br>Login com credenciais válidas</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve redirecionar o usuário para a página inicial do sistema após o login bem-sucedido.</td>
  </tr>
    <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Pedro Nogueira</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">15/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está permitindo o login corretamente.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><video src="https://github.com/user-attachments/assets/a1a900a3-9e9e-4780-99da-8e76e5fa08a7"/></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-002 -S<br>Logout com sessão ativa</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve encerrar a sessão do usuário e redirecionar para a página de login</td>
  </tr>
    <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Pedro Nogueira</td>
     <td width="100"><strong>Data do Teste</strong></td>
    <td width="150">15/10/2025</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está efetuando o logout seguro com sucesso.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
     <td colspan="6" align="center"><video src="https://github.com/ICEI-PUC-Minas-PMV-ADS/pmv-ads-2025-2-e5-proj-empext-t3-safework/edit/main/documentos/img/testeLogoutPedro.mkv"/></td>
  </tr>
</table>

## Parte 2 - Testes por pares
A fim de aumentar a qualidade da aplicação desenvolvida, cada funcionalidade deve ser testada por um colega e os testes devem ser evidenciados. O colega "Tester" deve utilizar o caso de teste criado pelo desenvolvedor responsável pela funcionalidade (desenvolveu a funcionalidade e criou o caso de testes descrito no plano de testes) e caso perceba a necessidade de outros casos de teste, deve acrescentá-los na sessão "Plano de Testes".


### Exemplo
<table>
  <tr>
    <th colspan="6" width="1000">CT-001<br>Login com credenciais válidas</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve redirecionar o usuário para a página inicial do aplicativo após o login bem-sucedido.</td>
  </tr>
    <tr>
      <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">José da Silva </td>
      <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Maria Oliveira </td>
     <td width="100"><strong>Data do teste</strong></td>
    <td width="150">08/05/2024</td>
  </tr>
    <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O sistema está permitindo o login corretamente.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><video src="https://github.com/ICEI-PUC-Minas-PMV-ADS/pmv-ads-2024-1-e5-proj-time-sheet/assets/82043220/2e3c1722-7adc-4bd4-8b4c-3abe9ddc1b48"/></td>
  </tr>
</table>


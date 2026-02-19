# 🔍 FAQ e Troubleshooting - Sistema de Farmácia

## ❓ Perguntas Frequentes (FAQ)

### 1. Como criar o primeiro usuário?

**R:** 
1. Abra o sistema
2. Clique na aba "Cadastrar"
3. Preencha: Nome, Email, Senha
4. **IMPORTANTE:** Selecione "Administrador" no tipo de usuário
5. Clique em "Cadastrar"
6. Volte para aba "Entrar" e faça login

**💡 Dica:** Sempre comece com um usuário Administrador para ter acesso total.

---

### 2. O que é o sistema FIFO e como funciona?

**R:** FIFO significa "First In, First Out" (Primeiro a Entrar, Primeiro a Sair).

**Como funciona:**
- Quando você adiciona lotes com datas de validade diferentes
- O sistema ordena automaticamente do mais antigo para o mais novo
- Nas vendas, os medicamentos são retirados primeiro dos lotes mais próximos do vencimento
- **É totalmente automático!** Você não precisa fazer nada

**Exemplo:**
```
Lote 1: Vence em 31/12/2024 - 100 unidades
Lote 2: Vence em 30/06/2025 - 200 unidades

Venda de 150 unidades:
✅ Retira 100 do Lote 1 (mais antigo)
✅ Retira 50 do Lote 2
✅ Lote 1 fica com 0 (removido automaticamente)
✅ Lote 2 fica com 150
```

---

### 3. Quais são as permissões de cada tipo de usuário?

**R:** 

**Funcionário:**
- ✅ Ver Dashboard
- ✅ Usar Frente de Caixa
- ❌ Não acessa outras áreas

**Farmacêutico:**
- ✅ Tudo do Funcionário +
- ✅ Gerenciar Medicamentos
- ✅ Adicionar Lotes
- ✅ Gerenciar Receitas
- ❌ Não pode excluir
- ❌ Não acessa Relatórios

**Gerente:**
- ✅ Tudo do Farmacêutico +
- ✅ Excluir medicamentos
- ✅ Cadastrar Médicos e UBS
- ✅ Acessar todos os Relatórios
- ✅ Excluir médicos e UBS

**Administrador:**
- ✅ Acesso TOTAL ao sistema
- ✅ Todas as permissões

---

### 4. Como fazer upload de receita médica?

**R:**
1. Na Frente de Caixa, adicione itens ao carrinho
2. Clique em "Finalizar Venda"
3. Na seção "Receita Médica (Opcional)"
4. Clique na área de upload
5. Selecione arquivo (JPG, PNG ou PDF)
6. Máximo: 5MB
7. Confirme a venda

**Ou:** Crie receita manualmente na aba "Receitas".

---

### 5. Como adicionar lotes aos medicamentos?

**R:**
1. Acesse "Medicamentos"
2. Localize o medicamento desejado
3. Clique no botão "📦 Lote"
4. Preencha:
   - Nome do lote (ex: LOTE-2024-001)
   - Data de validade
   - Quantidade
5. Clique em "Adicionar Lote"

**💡 Dica:** Adicione vários lotes com datas diferentes para ver o FIFO em ação!

---

### 6. Por que não vejo a opção "Relatórios"?

**R:** Apenas usuários **Gerente** e **Administrador** têm acesso aos relatórios.

**Solução:** Faça login com usuário Gerente ou Admin, ou peça para um administrador alterar seu nível de acesso.

---

### 7. Como funciona o alerta de estoque baixo?

**R:** 
- O sistema considera "estoque baixo" quando há **menos de 10 unidades**
- Medicamentos com estoque baixo aparecem com:
  - ⚠️ Ícone de alerta
  - Cor vermelha no número
  - Destaque no Dashboard
  - Lista nos Relatórios (Gerente/Admin)

---

### 8. Posso editar uma venda já realizada?

**R:** Não. Por questões de integridade de dados, vendas não podem ser editadas após serem finalizadas. 

**Motivo:** O sistema já aplicou FIFO e atualizou o estoque.

---

### 9. Como vincular médico a uma UBS?

**R:**
1. Primeiro, cadastre a UBS em "UBS"
2. Depois, ao cadastrar ou editar o médico:
3. No campo "UBS", selecione a UBS desejada
4. Salve

---

### 10. O que acontece quando um lote acaba?

**R:** 
- Lotes com quantidade zero são **automaticamente removidos** da lista
- Isso mantém a interface limpa e organizada
- O registro da venda permanece com informação de qual lote foi usado

---

## 🐛 Troubleshooting (Resolução de Problemas)

### Problema: Não consigo fazer login

**Possíveis causas e soluções:**

1. **Email ou senha incorretos**
   - ✅ Verifique se digitou corretamente
   - ✅ Email é case-sensitive
   - ✅ Tente fazer "Cadastrar" novamente

2. **Usuário não foi cadastrado**
   - ✅ Certifique-se que completou o cadastro
   - ✅ Verifique se apareceu mensagem de sucesso
   - ✅ Tente cadastrar novamente

3. **Conexão com Supabase**
   - ✅ Verifique sua conexão com internet
   - ✅ Aguarde alguns segundos e tente novamente

---

### Problema: Erro ao realizar venda

**Possíveis causas e soluções:**

1. **Estoque insuficiente**
   ```
   Erro: "Estoque insuficiente para [medicamento]"
   ```
   - ✅ Verifique estoque disponível do medicamento
   - ✅ Reduza a quantidade no carrinho
   - ✅ Adicione mais lotes ao medicamento

2. **Medicamento sem lotes**
   ```
   Erro: "Faltam X unidades"
   ```
   - ✅ Acesse "Medicamentos"
   - ✅ Adicione lotes ao medicamento
   - ✅ Tente a venda novamente

3. **Medicamento indisponível**
   - ✅ Verifique se o medicamento está marcado como "Disponível"
   - ✅ Edite o medicamento e marque como disponível

---

### Problema: Upload de receita falha

**Possíveis causas e soluções:**

1. **Arquivo muito grande**
   ```
   Erro: "Arquivo muito grande. Máximo: 5MB"
   ```
   - ✅ Reduza o tamanho do arquivo
   - ✅ Comprima a imagem
   - ✅ Use ferramenta online de compressão

2. **Formato inválido**
   ```
   Erro: "Formato inválido. Use JPG, PNG ou PDF"
   ```
   - ✅ Converta para JPG, PNG ou PDF
   - ✅ Verifique a extensão do arquivo

3. **Erro de conexão**
   - ✅ Verifique sua internet
   - ✅ Tente novamente em alguns segundos
   - ✅ Recarregue a página

---

### Problema: Não vejo alguns medicamentos na frente de caixa

**Possíveis causas e soluções:**

1. **Medicamento sem estoque**
   - Frente de caixa **só mostra medicamentos com estoque > 0**
   - ✅ Adicione lotes ao medicamento

2. **Medicamento indisponível**
   - ✅ Verifique se está marcado como "Disponível"
   - ✅ Edite e marque como disponível

3. **Busca filtrada**
   - ✅ Limpe o campo de busca
   - ✅ Digite o nome completo corretamente

---

### Problema: FIFO não está funcionando corretamente

**Verificação:**

1. **Confira as datas de validade**
   - ✅ Vá em "Medicamentos"
   - ✅ Veja os lotes do medicamento
   - ✅ Verifique se estão ordenados por data (mais próxima primeiro)

2. **Teste com exemplo simples**
   ```
   1. Crie medicamento
   2. Adicione Lote A: vence 01/01/2025 - 50un
   3. Adicione Lote B: vence 01/06/2025 - 100un
   4. Faça venda de 60un
   5. Confira: Lote A deve ter 0un, Lote B deve ter 90un
   ```

3. **Se ainda não funcionar**
   - ✅ Verifique se está usando o backend correto
   - ✅ Veja console do navegador (F12) por erros
   - ✅ Recarregue a página

---

### Problema: Relatórios estão vazios

**Possíveis causas e soluções:**

1. **Sem dados para mostrar**
   - ✅ Faça algumas vendas primeiro
   - ✅ Cadastre receitas com médicos
   - ✅ Vincule UBS às receitas

2. **Permissão insuficiente**
   - ✅ Precisa ser Gerente ou Admin
   - ✅ Faça login com usuário correto

3. **Erro ao carregar**
   - ✅ Recarregue a página
   - ✅ Verifique console (F12) por erros

---

### Problema: Carrinho não atualiza na frente de caixa

**Soluções:**

1. **Recarregue a página**
   - ✅ Pressione F5 ou Ctrl+R

2. **Limpe o cache**
   - ✅ Ctrl+Shift+Del
   - ✅ Limpe cache do navegador
   - ✅ Recarregue

3. **Tente outro navegador**
   - ✅ Chrome, Firefox, Edge, Safari

---

### Problema: Gráficos não aparecem nos relatórios

**Soluções:**

1. **Aguarde carregar**
   - ✅ Gráficos podem demorar alguns segundos
   - ✅ Veja se há indicador de loading

2. **Dados insuficientes**
   - ✅ Precisa ter ao menos 1 venda/receita
   - ✅ Faça algumas transações primeiro

3. **Erro de renderização**
   - ✅ Diminua o zoom do navegador (Ctrl+0)
   - ✅ Maximize a janela
   - ✅ Recarregue a página

---

## 🔧 Dicas Avançadas

### Performance

**Se o sistema estiver lento:**

1. **Limpe dados antigos**
   - Exclua medicamentos sem uso
   - Archive vendas antigas (futuro)

2. **Otimize buscas**
   - Use filtros específicos
   - Seja preciso na busca

3. **Navegador**
   - Feche abas desnecessárias
   - Limpe cache regularmente
   - Use navegador atualizado

---

### Backup de Dados

**Como proteger seus dados:**

1. **Supabase cuida do backup**
   - Dados são automaticamente salvos
   - Redundância em múltiplos servidores

2. **Exporte relatórios regularmente**
   - Copie dados importantes
   - Salve localmente se necessário

3. **Documente processos**
   - Mantenha lista de medicamentos
   - Registre fornecedores
   - Backup de receitas importantes

---

### Melhores Práticas

**Para melhor uso do sistema:**

1. **Organização de Lotes**
   - Use nomenclatura consistente (LOTE-ANO-NUM)
   - Sempre preencha data de validade correta
   - Adicione lotes assim que receber mercadoria

2. **Cadastros Completos**
   - Preencha todos os campos possíveis
   - Mantenha dados atualizados
   - Use categorias corretas

3. **Vendas**
   - Sempre preencha dados do paciente
   - Faça upload de receitas quando aplicável
   - Verifique estoque antes de prometer

4. **Relatórios**
   - Acesse semanalmente (Gerente/Admin)
   - Analise tendências
   - Planeje compras baseado nos dados

---

## 🆘 Ainda Com Problemas?

### Checklist Final

Antes de reportar problema, verifique:

- [ ] Recarreguei a página (F5)
- [ ] Limpei o cache do navegador
- [ ] Testei em outro navegador
- [ ] Verifiquei minha conexão de internet
- [ ] Li a documentação relevante
- [ ] Tentei fazer logout e login novamente
- [ ] Verifiquei as permissões do meu usuário

---

### Console de Erros (Para Desenvolvedores)

**Como ver erros técnicos:**

1. Pressione **F12** no navegador
2. Vá na aba **Console**
3. Procure por mensagens em vermelho
4. Copie a mensagem de erro
5. Leia o stack trace

**Erros comuns:**

```javascript
// Erro de autenticação
"Unauthorized - Invalid token"
→ Solução: Faça login novamente

// Erro de rede
"Failed to fetch"
→ Solução: Verifique internet

// Erro de permissão
"Insufficient permissions"
→ Solução: Use usuário com permissão adequada
```

---

## 📞 Suporte Adicional

### Documentação Disponível

1. **[README.md](/README.md)**
   - Visão geral do sistema

2. **[GUIA_RAPIDO.md](/GUIA_RAPIDO.md)**
   - Início rápido em 5 minutos

3. **[SISTEMA_COMPLETO.md](/SISTEMA_COMPLETO.md)**
   - Documentação técnica completa

4. **[RESUMO_TECNICO.md](/RESUMO_TECNICO.md)**
   - Detalhes técnicos e estatísticas

5. **[ESTRUTURA_VISUAL.md](/ESTRUTURA_VISUAL.md)**
   - Design e fluxos de interface

---

## 💡 Dicas de Uso por Perfil

### Para Funcionários
- Foque na frente de caixa
- Sempre verifique estoque antes de vender
- Faça upload de receitas quando possível
- Preencha dados do paciente

### Para Farmacêuticos
- Mantenha medicamentos atualizados
- Adicione lotes regularmente
- Organize por categoria
- Gerencie receitas ativamente

### Para Gerentes
- Acesse relatórios semanalmente
- Monitore estoque baixo
- Analise performance da equipe
- Planeje compras baseado em dados

### Para Administradores
- Configure o sistema inicial
- Crie usuários com permissões adequadas
- Monitore integridade dos dados
- Faça manutenção regular

---

## ✅ Checklist de Troubleshooting

### Problemas de Login
- [ ] Email está correto?
- [ ] Senha está correta?
- [ ] Usuário foi cadastrado?
- [ ] Internet está funcionando?

### Problemas de Venda
- [ ] Medicamento tem estoque?
- [ ] Medicamento tem lotes?
- [ ] Medicamento está disponível?
- [ ] Quantidade é válida?

### Problemas de Upload
- [ ] Arquivo é JPG, PNG ou PDF?
- [ ] Arquivo tem menos de 5MB?
- [ ] Internet está estável?
- [ ] Navegador permite upload?

### Problemas de Visualização
- [ ] Navegador está atualizado?
- [ ] JavaScript está habilitado?
- [ ] Zoom está em 100%?
- [ ] Tela é grande o suficiente?

---

**Esperamos que este FAQ resolva suas dúvidas! 🎉**

*Se encontrou algo não documentado aqui, considere contribuir com a documentação!*

# 🚀 Guia Rápido de Início - Sistema de Farmácia

## ⚡ Começando em 5 Minutos

### Passo 1: Criar Primeiro Usuário Admin

1. Abra o sistema no navegador
2. Clique na aba **"Cadastrar"**
3. Preencha:
   ```
   Nome: Seu Nome
   Email: admin@farmacia.com
   Senha: suasenha123
   Tipo de Usuário: Administrador
   ```
4. Clique em **"Cadastrar"**
5. Volte para aba **"Entrar"** e faça login

### Passo 2: Cadastrar uma UBS (Opcional)

1. Menu lateral → **"UBS"**
2. Botão **"Nova UBS"**
3. Exemplo:
   ```
   Nome: UBS Centro
   Endereço: Rua Principal, 100 - Centro - São Paulo/SP
   ```
4. **"Cadastrar"**

### Passo 3: Cadastrar um Médico (Opcional)

1. Menu lateral → **"Médicos"**
2. Botão **"Novo Médico"**
3. Exemplo:
   ```
   Nome: Dr. João Silva
   CRM: 12345/SP
   UBS: UBS Centro (ou deixe em branco)
   ```
4. **"Cadastrar"**

### Passo 4: Cadastrar Medicamento

1. Menu lateral → **"Medicamentos"**
2. Botão **"Novo Medicamento"**
3. Exemplo:
   ```
   Nome: Dipirona Sódica 500mg
   Fabricante: EMS
   Categoria: Analgésico
   Unidade: Comprimido
   Composição: Dipirona Sódica 500mg
   ✓ Disponível para venda
   ```
4. **"Cadastrar"**

### Passo 5: Adicionar Lotes

1. Na lista de medicamentos, localize "Dipirona Sódica"
2. Clique em botão **"Lote"**
3. Adicione primeiro lote:
   ```
   Nome: LOTE-2024-001
   Validade: 31/12/2024
   Quantidade: 100
   ```
4. Adicione segundo lote (para testar FIFO):
   ```
   Nome: LOTE-2024-002
   Validade: 30/06/2025
   Quantidade: 200
   ```
5. **Importante:** Note que os lotes são ordenados automaticamente por data de validade! 📅

### Passo 6: Fazer sua Primeira Venda

1. Menu lateral → **"Frente de Caixa"**
2. Selecione: **"Dipirona Sódica 500mg"**
3. Quantidade: **50** (vai sair do primeiro lote!)
4. Clique **"Adicionar"**
5. Clique **"Finalizar Venda"**
6. Preencha (opcional):
   ```
   Nome: Maria Santos
   CPF: 123.456.789-00
   Telefone: (11) 99999-9999
   ```
7. **"Confirmar Venda"**
8. ✅ **Venda concluída!** O sistema aplicou FIFO automaticamente!

### Passo 7: Verificar FIFO em Ação

1. Volte para **"Medicamentos"**
2. Veja o medicamento "Dipirona Sódica"
3. Observe os lotes:
   ```
   LOTE-2024-001: 50 unidades (era 100, vendeu 50!)
   LOTE-2024-002: 200 unidades (intacto, vence depois)
   ```
4. 🎉 **FIFO funcionando perfeitamente!**

---

## 📊 Testando Relatórios

1. Menu lateral → **"Relatórios"**
2. Veja a aba **"Medicamentos"**:
   - Dipirona aparecerá como mais vendida
   - Gráfico mostrará 50 unidades
   - Estoque total atualizado

---

## 🎯 Dicas Importantes

### ⚠️ Primeiro Acesso
- **SEMPRE** crie um usuário **Administrador** primeiro
- Ele terá acesso total para configurar o sistema

### 📦 Gestão de Lotes
- Adicione lotes com **datas diferentes** para ver o FIFO funcionar
- Lotes com data mais próxima sempre saem primeiro
- Lotes vazios são removidos automaticamente

### 💰 Vendas
- Sistema valida estoque antes de confirmar
- FIFO é aplicado **automaticamente** no backend
- Upload de receita é **opcional** mas recomendado

### 📱 Mobile
- Sistema é **100% responsivo**
- Use o menu hambúrguer no mobile
- Todas as funcionalidades disponíveis

---

## 🏅 Níveis de Usuário - O que Cada Um Pode Fazer

| Funcionalidade | Funcionário | Farmacêutico | Gerente | Admin |
|---|---|---|---|---|
| Ver Dashboard | ✅ | ✅ | ✅ | ✅ |
| Frente de Caixa | ✅ | ✅ | ✅ | ✅ |
| Ver Medicamentos | ❌ | ✅ | ✅ | ✅ |
| Criar/Editar Medicamentos | ❌ | ✅ | ✅ | ✅ |
| Excluir Medicamentos | ❌ | ❌ | ✅ | ✅ |
| Gerenciar Lotes | ❌ | ✅ | ✅ | ✅ |
| Ver/Criar Receitas | ❌ | ✅ | ✅ | ✅ |
| Gerenciar Médicos | ❌ | ❌ | ✅ | ✅ |
| Gerenciar UBS | ❌ | ❌ | ✅ | ✅ |
| Ver Relatórios | ❌ | ❌ | ✅ | ✅ |

---

## 🔍 Testando Todas as Funcionalidades

### Teste 1: Sistema FIFO
1. Crie medicamento com 2 lotes (datas diferentes)
2. Faça venda maior que o primeiro lote
3. Veja que consome primeiro lote + parte do segundo

### Teste 2: Estoque Baixo
1. Crie medicamento com apenas 5 unidades
2. Veja alerta vermelho de "Estoque Baixo"
3. Cheque no Dashboard e Relatórios

### Teste 3: Upload de Receita
1. Prepare um arquivo PDF ou imagem
2. Na frente de caixa, faça venda
3. Faça upload da receita (máx. 5MB)
4. Vá em "Receitas" e veja o arquivo

### Teste 4: Relatórios
1. Faça várias vendas
2. Acesse Relatórios
3. Veja gráficos e rankings
4. Analise estatísticas

---

## 🐛 Resolução de Problemas

### Não consigo fazer login
- ✅ Verifique email e senha
- ✅ Certifique-se que cadastrou o usuário
- ✅ Confirme que selecionou o tipo de usuário

### Não vejo opção de Relatórios
- ✅ Apenas Gerente e Admin têm acesso
- ✅ Cadastre usuário com nível adequado

### Erro ao fazer venda
- ✅ Verifique se tem estoque suficiente
- ✅ Confirme que medicamento está "Disponível"
- ✅ Verifique se o medicamento tem lotes

### Upload de receita falha
- ✅ Arquivo deve ser JPG, PNG ou PDF
- ✅ Tamanho máximo: 5MB
- ✅ Tente arquivo menor

---

## 🎓 Próximos Passos

Após configurar o básico:

1. **Cadastre Mais Medicamentos**
   - Monte seu catálogo completo
   - Adicione lotes para cada um
   - Organize por categoria

2. **Configure Sua Equipe**
   - Cadastre funcionários
   - Cadastre farmacêuticos
   - Defina permissões adequadas

3. **Registre Médicos e UBS**
   - Monte cadastro de médicos parceiros
   - Registre UBS da região
   - Vincule para receitas

4. **Use os Relatórios**
   - Analise vendas semanalmente
   - Identifique medicamentos populares
   - Planeje compras baseado em dados

5. **Treine sua Equipe**
   - Mostre como usar frente de caixa
   - Ensine a fazer upload de receitas
   - Explique o sistema FIFO

---

## 💡 Dica Pro

**Para testar rapidamente o sistema completo:**

Execute este roteiro de 10 minutos:
1. ✅ Criar admin (1 min)
2. ✅ Criar 1 UBS (30 seg)
3. ✅ Criar 2 médicos (1 min)
4. ✅ Criar 5 medicamentos (3 min)
5. ✅ Adicionar 2 lotes cada (2 min)
6. ✅ Fazer 3 vendas (2 min)
7. ✅ Ver relatórios (30 seg)

**Pronto! Sistema 100% testado! 🎉**

---

## 📞 Recursos Adicionais

- 📖 **Documentação Completa:** `/SISTEMA_COMPLETO.md`
- 🔧 **Código Fonte:** Explore `/src` e `/supabase`
- 🎨 **Componentes:** Veja `/src/app/components`
- 🗄️ **Backend:** Analise `/supabase/functions/server`

---

**Bom uso do sistema! 🚀**

*Lembre-se: O sistema está 100% funcional e pronto para uso em produção!*

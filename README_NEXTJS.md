# Sistema de Gerenciamento de Farmácia - Next.js

Sistema completo e profissional de gerenciamento de farmácia com Next.js, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Radix UI** - Componentes acessíveis
- **Recharts** - Gráficos interativos
- **Sonner** - Notificações toast
- **Supabase** - Backend (modo demonstração)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# ou com pnpm
pnpm install
```

## 🔧 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# ou com pnpm
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🏗️ Build para Produção

```bash
# Criar build de produção
npm run build

# Iniciar servidor de produção
npm start
```

## 🎯 Funcionalidades

### ✅ Autenticação e Controle de Acesso
- 4 níveis de usuário: **Funcionário**, **Farmacêutico**, **Gerente** e **Administrador**
- Permissões específicas por função
- Modo demonstração com localStorage

### 💊 Gestão de Medicamentos
- Cadastro completo de medicamentos
- Controle de lotes com validade
- Sistema **FIFO automático** (primeiro a vencer, primeiro a sair)
- Alertas de estoque baixo
- Busca e filtros avançados

### 🛒 Frente de Caixa
- Interface intuitiva para vendas
- Carrinho de compras
- Upload de receitas médicas
- Controle FIFO na saída de produtos
- Dados do paciente

### 📄 Receitas Médicas
- Upload de arquivos (JPG, PNG, PDF)
- Vinculação com médicos e UBS
- Controle de status (pendente/entregue/cancelada)
- Geração automática após vendas

### 👨‍⚕️ Cadastros
- **Médicos**: Nome, CRM, UBS vinculada
- **UBS**: Unidades Básicas de Saúde
- Persistência local completa

### 📊 Relatórios Gerenciais
- Medicamentos mais vendidos
- Médicos que mais prescreveram
- Atendimentos por funcionário
- UBS com mais pedidos
- Gráficos interativos
- Estatísticas de estoque

## 🔐 Credenciais de Demonstração

```
Email: admin@farmacia.com
Senha: admin123
```

## 📂 Estrutura do Projeto

```
/src
  /app
    /components
      /ui          # Componentes de interface
      /views       # Páginas/views do sistema
      Dashboard.tsx
      Login.tsx
    layout.tsx     # Layout raiz do Next.js
    page.tsx       # Página principal
  /lib
    supabase.ts    # Configuração e mocks
    utils.ts
  /styles
    fonts.css
    index.css
    tailwind.css
    theme.css
```

## 🎨 Componentes UI

O sistema utiliza uma biblioteca completa de componentes baseados em Radix UI:

- Buttons, Inputs, Selects
- Cards, Dialogs, AlertDialogs
- Tables, Badges, Tabs
- Charts (Recharts)
- E muito mais...

## 💾 Persistência de Dados

O sistema funciona em **modo demonstração** com persistência local via `localStorage`:

- ✅ Medicamentos e lotes salvos
- ✅ UBS cadastradas salvas
- ✅ Médicos cadastrados salvos
- ✅ Vendas e receitas salvas
- ✅ Sessão de usuário mantida

## 🔄 Sistema FIFO

O controle de estoque utiliza o método **FIFO (First In, First Out)**:

1. Ao adicionar lotes, o sistema registra a data de validade
2. Nas vendas, o sistema automaticamente retira dos lotes mais antigos
3. Garante rotação adequada e evita desperdícios

## 🚨 Alertas e Notificações

- Toast notifications com Sonner
- Alertas de estoque baixo
- Confirmações de exclusão com AlertDialog
- Feedback visual em todas as ações

## 📱 Responsividade

O sistema é 100% responsivo:

- Mobile-first design
- Sidebar colapsável em dispositivos móveis
- Tabelas com scroll horizontal
- Cards adaptáveis
- Formulários otimizados para touch

## 🔧 Configuração do Next.js

O projeto utiliza:

- **App Router** (pasta `/src/app`)
- **Client Components** (`'use client'` nos componentes interativos)
- **TypeScript** estrito
- **Tailwind CSS 4** com configuração customizada

## 🎯 Próximos Passos

Para conectar com Supabase real:

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as variáveis de ambiente:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-key
   ```
3. Ajuste o código em `/src/lib/supabase.ts`

## 📝 Licença

Este é um projeto de demonstração para fins educacionais.

---

**Desenvolvido com ❤️ usando Next.js e TypeScript**

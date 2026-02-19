# 💊 Sistema de Farmácia - Next.js (SEM BACKEND)

Sistema completo de gerenciamento de farmácia **100% frontend** - sem backend, sem Supabase, tudo roda no navegador com localStorage!

## 🚀 Como Usar

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar desenvolvimento
npm run dev

# 3. Acessar
http://localhost:3000

# Login padrão:
Email: admin@farmacia.com
Senha: admin123
```

## ✨ Características

### 🔒 **SEM BACKEND**
- ✅ Tudo roda no navegador
- ✅ Dados salvos em localStorage
- ✅ Sem necessidade de servidor
- ✅ Sem Supabase, sem PostgreSQL
- ✅ Deploy estático em qualquer lugar

### 💾 **Persistência Local**
- Medicamentos e lotes
- Médicos e UBS
- Receitas médicas  
- Vendas com FIFO
- Usuários e sessões
- Relatórios

### 🎯 **Funcionalidades**
- 4 níveis de usuário (funcionário, farmacêutico, gerente, admin)
- Sistema FIFO automático para lotes
- Frente de caixa com carrinho
- Upload de receitas (URLs temporárias)
- Relatórios com gráficos
- AlertDialogs bonitos
- 100% responsivo

## 📦 Build para Produção

```bash
npm run build
npm start
```

Ou deploy estático (Vercel, Netlify, etc):
```bash
npm run build
# Deploy a pasta .next
```

## 🎨 Stack

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes
- **Recharts** - Gráficos
- **Sonner** - Toasts
- **localStorage** - Persistência

## 📝 Notas

- Todos os dados são salvos localmente
- Limpar localStorage = perder dados
- Ideal para protótipos e demos
- Sem necessidade de configuração

**Sistema 100% funcional sem backend! 🎉**
# farmacia

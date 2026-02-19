# 🚀 Guia de Migração para Next.js

## ✅ Migração Completa - Sistema 100% Funcional

O sistema de farmácia foi **completamente migrado** de React/Vite para **Next.js 15** com sucesso!

---

## 📋 O Que Foi Alterado

### 1. **Dependências Atualizadas**
```json
- ❌ Vite removido
+ ✅ Next.js 15.1.6 adicionado
+ ✅ React 18.3.1 como dependência direta
+ ✅ TypeScript configurado
```

### 2. **Estrutura de Arquivos**
```
Antes (Vite):                  Depois (Next.js):
/src/app/App.tsx              /src/app/page.tsx
/src/main.tsx                 /src/app/layout.tsx
/vite.config.ts               /next.config.mjs
                              /tsconfig.json
```

### 3. **Componentes Atualizados**
Todos os componentes interativos agora usam `'use client'`:
- ✅ page.tsx
- ✅ Dashboard.tsx
- ✅ Login.tsx
- ✅ Todos os componentes em /views/

### 4. **Configurações Criadas**
- ✅ `next.config.mjs` - Configuração do Next.js
- ✅ `tsconfig.json` - TypeScript
- ✅ `.gitignore` - Arquivos ignorados
- ✅ `.env.example` - Exemplo de variáveis de ambiente

---

## 🚀 Como Usar

### 1. Instalar Dependências
```bash
npm install
# ou
pnpm install
```

### 2. Iniciar Desenvolvimento
```bash
npm run dev
# ou
pnpm dev
```

### 3. Acessar
```
http://localhost:3000
```

### 4. Login Demo
```
Email: admin@farmacia.com
Senha: admin123
```

---

## 📦 Build para Produção

```bash
# Criar build otimizado
npm run build

# Iniciar servidor de produção
npm start
```

---

## 🎯 Funcionalidades Mantidas

**TUDO continua funcionando perfeitamente:**

✅ Autenticação com 4 níveis de usuário  
✅ Sistema FIFO completo  
✅ Gestão de medicamentos e lotes  
✅ Frente de caixa com carrinho  
✅ Upload de receitas médicas  
✅ Cadastro de médicos e UBS  
✅ Relatórios com gráficos interativos  
✅ Persistência local (localStorage)  
✅ AlertDialogs bonitos para confirmações  
✅ Interface 100% responsiva  

---

## 🔧 Diferenças do Vite para Next.js

### Client Components
Componentes que usam hooks ou estado precisam de `'use client'`:
```tsx
'use client';

import { useState } from 'react';

export default function MeuComponente() {
  const [count, setCount] = useState(0);
  // ...
}
```

### Server Components (padrão)
Componentes sem interatividade podem ser Server Components:
```tsx
// Sem 'use client' - roda no servidor
export default function MeuComponente() {
  return <div>Conteúdo estático</div>;
}
```

### App Router
- Páginas vão em `/src/app/`
- `page.tsx` = rota principal
- `layout.tsx` = layout compartilhado

### localStorage
Verificação de `typeof window` necessária:
```tsx
if (typeof window !== 'undefined') {
  localStorage.setItem('key', 'value');
}
```

---

## 🎨 Vantagens do Next.js

### Performance
- ⚡ Server-side rendering
- ⚡ Otimização automática de imagens
- ⚡ Code splitting inteligente
- ⚡ Prefetching de rotas

### SEO
- 🔍 Melhor indexação
- 🔍 Meta tags dinâmicas
- 🔍 Open Graph otimizado

### Developer Experience
- 🛠️ Hot reload ultra-rápido
- 🛠️ TypeScript nativo
- 🛠️ Rotas baseadas em arquivos
- 🛠️ API Routes prontas

### Deploy
- 🚀 Vercel com 1 clique
- 🚀 Otimizações automáticas
- 🚀 CDN global
- 🚀 Edge Functions

---

## 📱 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Análise de bundle
npm run build -- --analyze
```

---

## 🔐 Configuração do Supabase (Opcional)

O sistema funciona em modo demo, mas para produção:

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie `.env.example` para `.env.local`
3. Configure as variáveis:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   ```
4. Ajuste `/src/lib/supabase.ts` se necessário

---

## 🐛 Troubleshooting

### Erro: "localStorage is not defined"
✅ **Solução:** Adicione verificação:
```tsx
if (typeof window !== 'undefined') {
  // código que usa localStorage
}
```

### Erro: "React Hook called in server component"
✅ **Solução:** Adicione `'use client'` no topo do arquivo

### Porta 3000 em uso
✅ **Solução:** Use outra porta:
```bash
PORT=3001 npm run dev
```

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)

---

## ✨ Status da Migração

| Item | Status |
|------|--------|
| Estrutura Next.js | ✅ Completo |
| Client Components | ✅ Completo |
| Autenticação | ✅ Completo |
| Medicamentos | ✅ Completo |
| Frente de Caixa | ✅ Completo |
| Receitas | ✅ Completo |
| Médicos | ✅ Completo |
| UBS | ✅ Completo |
| Relatórios | ✅ Completo |
| AlertDialogs | ✅ Completo |
| Responsividade | ✅ Completo |
| localStorage | ✅ Completo |

**TUDO FUNCIONANDO! 🎉**

---

**Desenvolvido com ❤️ usando Next.js 15, TypeScript e Tailwind CSS**

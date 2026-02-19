import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase clients
const getServiceClient = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const getAnonClient = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Initialize storage bucket
const bucketName = 'make-2ba59527-prescriptions';
(async () => {
  const supabase = getServiceClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: false });
    console.log('Created private bucket:', bucketName);
  }
})();

// Auth middleware
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }
  
  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
  
  c.set('userId', user.id);
  c.set('userEmail', user.email);
  c.set('userMetadata', user.user_metadata);
  await next();
};

// Health check endpoint
app.get("/make-server-2ba59527/health", (c) => {
  return c.json({ status: "ok" });
});

// ============= AUTH ROUTES =============

// Sign up
app.post("/make-server-2ba59527/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, userType } = body;

    if (!email || !password || !name || !userType) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType }, // farmaceutico, admin, gerente, funcionario
      email_confirm: true // Automatically confirm since email server hasn't been configured
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Get current session
app.get("/make-server-2ba59527/session", async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ session: null }, 200);
  }

  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return c.json({ session: null }, 200);
  }

  return c.json({ 
    session: { 
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        userType: user.user_metadata?.userType
      }
    } 
  });
});

// ============= MEDICAMENTOS ROUTES =============

// Listar medicamentos
app.get("/make-server-2ba59527/medicamentos", requireAuth, async (c) => {
  try {
    const medicamentos = await kv.getByPrefix('medicamento:');
    return c.json({ medicamentos });
  } catch (error) {
    console.error('Error listing medicamentos:', error);
    return c.json({ error: 'Failed to list medicamentos' }, 500);
  }
});

// Buscar medicamento por ID
app.get("/make-server-2ba59527/medicamentos/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const medicamento = await kv.get(`medicamento:${id}`);
    
    if (!medicamento) {
      return c.json({ error: 'Medicamento not found' }, 404);
    }

    return c.json({ medicamento });
  } catch (error) {
    console.error('Error fetching medicamento:', error);
    return c.json({ error: 'Failed to fetch medicamento' }, 500);
  }
});

// Criar medicamento
app.post("/make-server-2ba59527/medicamentos", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['farmaceutico', 'admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Insufficient permissions' }, 403);
    }

    const body = await c.req.json();
    const { nome, categoria, unidadeMedida, fabricante, composicao, disponivel } = body;

    if (!nome || !categoria || !unidadeMedida || !fabricante) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const id = crypto.randomUUID();
    const medicamento = {
      id,
      nome,
      categoria,
      unidadeMedida,
      fabricante,
      composicao: composicao || '',
      disponivel: disponivel !== false,
      lotes: [],
      createdAt: new Date().toISOString(),
    };

    await kv.set(`medicamento:${id}`, medicamento);
    return c.json({ medicamento });
  } catch (error) {
    console.error('Error creating medicamento:', error);
    return c.json({ error: 'Failed to create medicamento' }, 500);
  }
});

// Atualizar medicamento
app.put("/make-server-2ba59527/medicamentos/:id", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['farmaceutico', 'admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Insufficient permissions' }, 403);
    }

    const id = c.req.param('id');
    const body = await c.req.json();
    const medicamento = await kv.get(`medicamento:${id}`);

    if (!medicamento) {
      return c.json({ error: 'Medicamento not found' }, 404);
    }

    const updated = { ...medicamento, ...body, id, updatedAt: new Date().toISOString() };
    await kv.set(`medicamento:${id}`, updated);
    return c.json({ medicamento: updated });
  } catch (error) {
    console.error('Error updating medicamento:', error);
    return c.json({ error: 'Failed to update medicamento' }, 500);
  }
});

// Deletar medicamento
app.delete("/make-server-2ba59527/medicamentos/:id", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Only admin and gerente can delete' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`medicamento:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting medicamento:', error);
    return c.json({ error: 'Failed to delete medicamento' }, 500);
  }
});

// ============= LOTES ROUTES =============

// Adicionar lote ao medicamento
app.post("/make-server-2ba59527/medicamentos/:id/lotes", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['farmaceutico', 'admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Insufficient permissions' }, 403);
    }

    const id = c.req.param('id');
    const body = await c.req.json();
    const { nomeLote, validade, quantidade } = body;

    if (!nomeLote || !validade || !quantidade) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const medicamento = await kv.get(`medicamento:${id}`);
    if (!medicamento) {
      return c.json({ error: 'Medicamento not found' }, 404);
    }

    const lote = {
      id: crypto.randomUUID(),
      nomeLote,
      validade,
      quantidade: parseInt(quantidade),
      createdAt: new Date().toISOString(),
    };

    medicamento.lotes = [...(medicamento.lotes || []), lote];
    // Ordenar lotes por data de validade (FIFO - primeiro a vencer sai primeiro)
    medicamento.lotes.sort((a, b) => new Date(a.validade).getTime() - new Date(b.validade).getTime());

    await kv.set(`medicamento:${id}`, medicamento);
    return c.json({ medicamento });
  } catch (error) {
    console.error('Error adding lote:', error);
    return c.json({ error: 'Failed to add lote' }, 500);
  }
});

// ============= MEDICOS ROUTES =============

// Listar médicos
app.get("/make-server-2ba59527/medicos", requireAuth, async (c) => {
  try {
    const medicos = await kv.getByPrefix('medico:');
    return c.json({ medicos });
  } catch (error) {
    console.error('Error listing medicos:', error);
    return c.json({ error: 'Failed to list medicos' }, 500);
  }
});

// Criar médico
app.post("/make-server-2ba59527/medicos", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Insufficient permissions' }, 403);
    }

    const body = await c.req.json();
    const { nome, crm, ubsId } = body;

    if (!nome || !crm) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const id = crypto.randomUUID();
    const medico = {
      id,
      nome,
      crm,
      ubsId: ubsId || null,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`medico:${id}`, medico);
    return c.json({ medico });
  } catch (error) {
    console.error('Error creating medico:', error);
    return c.json({ error: 'Failed to create medico' }, 500);
  }
});

// Atualizar médico
app.put("/make-server-2ba59527/medicos/:id", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Insufficient permissions' }, 403);
    }

    const id = c.req.param('id');
    const body = await c.req.json();
    const medico = await kv.get(`medico:${id}`);

    if (!medico) {
      return c.json({ error: 'Medico not found' }, 404);
    }

    const updated = { ...medico, ...body, id, updatedAt: new Date().toISOString() };
    await kv.set(`medico:${id}`, updated);
    return c.json({ medico: updated });
  } catch (error) {
    console.error('Error updating medico:', error);
    return c.json({ error: 'Failed to update medico' }, 500);
  }
});

// Deletar médico
app.delete("/make-server-2ba59527/medicos/:id", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Only admin and gerente can delete' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`medico:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting medico:', error);
    return c.json({ error: 'Failed to delete medico' }, 500);
  }
});

// ============= UBS ROUTES =============

// Listar UBS
app.get("/make-server-2ba59527/ubs", requireAuth, async (c) => {
  try {
    const ubsList = await kv.getByPrefix('ubs:');
    return c.json({ ubs: ubsList });
  } catch (error) {
    console.error('Error listing ubs:', error);
    return c.json({ error: 'Failed to list ubs' }, 500);
  }
});

// Criar UBS
app.post("/make-server-2ba59527/ubs", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Insufficient permissions' }, 403);
    }

    const body = await c.req.json();
    const { nome, endereco } = body;

    if (!nome || !endereco) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const id = crypto.randomUUID();
    const ubs = {
      id,
      nome,
      endereco,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`ubs:${id}`, ubs);
    return c.json({ ubs });
  } catch (error) {
    console.error('Error creating ubs:', error);
    return c.json({ error: 'Failed to create ubs' }, 500);
  }
});

// Atualizar UBS
app.put("/make-server-2ba59527/ubs/:id", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Insufficient permissions' }, 403);
    }

    const id = c.req.param('id');
    const body = await c.req.json();
    const ubs = await kv.get(`ubs:${id}`);

    if (!ubs) {
      return c.json({ error: 'UBS not found' }, 404);
    }

    const updated = { ...ubs, ...body, id, updatedAt: new Date().toISOString() };
    await kv.set(`ubs:${id}`, updated);
    return c.json({ ubs: updated });
  } catch (error) {
    console.error('Error updating ubs:', error);
    return c.json({ error: 'Failed to update ubs' }, 500);
  }
});

// Deletar UBS
app.delete("/make-server-2ba59527/ubs/:id", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Only admin and gerente can delete' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`ubs:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting ubs:', error);
    return c.json({ error: 'Failed to delete ubs' }, 500);
  }
});

// ============= VENDAS/FRENTE DE CAIXA =============

// Criar venda (FIFO - primeiro lote a vencer é usado primeiro)
app.post("/make-server-2ba59527/vendas", requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { itens, receitaFile, dadosGerais } = body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return c.json({ error: 'Missing items' }, 400);
    }

    const userId = c.get('userId');
    const userName = c.get('userMetadata')?.name;
    
    // Processar cada item e atualizar estoque (FIFO)
    const itensProcessados = [];
    for (const item of itens) {
      const { medicamentoId, quantidade } = item;
      const medicamento = await kv.get(`medicamento:${medicamentoId}`);
      
      if (!medicamento) {
        return c.json({ error: `Medicamento ${medicamentoId} not found` }, 404);
      }

      let quantidadeRestante = quantidade;
      const lotesUsados = [];

      // Processar lotes em ordem FIFO (já estão ordenados por validade)
      for (const lote of medicamento.lotes) {
        if (quantidadeRestante <= 0) break;
        
        if (lote.quantidade > 0) {
          const quantidadeUsada = Math.min(lote.quantidade, quantidadeRestante);
          lote.quantidade -= quantidadeUsada;
          quantidadeRestante -= quantidadeUsada;
          
          lotesUsados.push({
            loteId: lote.id,
            nomeLote: lote.nomeLote,
            quantidadeUsada
          });
        }
      }

      if (quantidadeRestante > 0) {
        return c.json({ 
          error: `Estoque insuficiente para ${medicamento.nome}. Faltam ${quantidadeRestante} unidades.` 
        }, 400);
      }

      // Remover lotes com quantidade zero
      medicamento.lotes = medicamento.lotes.filter(l => l.quantidade > 0);
      await kv.set(`medicamento:${medicamentoId}`, medicamento);

      itensProcessados.push({
        medicamentoId,
        medicamentoNome: medicamento.nome,
        quantidade,
        lotesUsados
      });
    }

    // Criar venda
    const vendaId = crypto.randomUUID();
    const venda = {
      id: vendaId,
      itens: itensProcessados,
      dadosGerais: dadosGerais || {},
      funcionarioId: userId,
      funcionarioNome: userName,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`venda:${vendaId}`, venda);

    // Criar receita se houver arquivo
    if (receitaFile) {
      const receitaId = crypto.randomUUID();
      const receita = {
        id: receitaId,
        vendaId,
        fileName: receitaFile.name || 'receita.pdf',
        fileUrl: receitaFile.url || '',
        status: 'entregue',
        createdAt: new Date().toISOString(),
      };
      await kv.set(`receita:${receitaId}`, receita);
    }

    return c.json({ venda });
  } catch (error) {
    console.error('Error creating venda:', error);
    return c.json({ error: 'Failed to create venda' }, 500);
  }
});

// Listar vendas
app.get("/make-server-2ba59527/vendas", requireAuth, async (c) => {
  try {
    const vendas = await kv.getByPrefix('venda:');
    return c.json({ vendas });
  } catch (error) {
    console.error('Error listing vendas:', error);
    return c.json({ error: 'Failed to list vendas' }, 500);
  }
});

// ============= RECEITAS ROUTES =============

// Upload de receita
app.post("/make-server-2ba59527/receitas/upload", requireAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const supabase = getServiceClient();
    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Gerar URL assinado (válido por 1 ano)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000);

    return c.json({ 
      fileName, 
      fileUrl: signedUrlData?.signedUrl,
      path: data.path
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// Listar receitas
app.get("/make-server-2ba59527/receitas", requireAuth, async (c) => {
  try {
    const receitas = await kv.getByPrefix('receita:');
    return c.json({ receitas });
  } catch (error) {
    console.error('Error listing receitas:', error);
    return c.json({ error: 'Failed to list receitas' }, 500);
  }
});

// Criar receita manualmente
app.post("/make-server-2ba59527/receitas", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['farmaceutico', 'admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Insufficient permissions' }, 403);
    }

    const body = await c.req.json();
    const { medicoId, ubsId, pacienteNome, medicamentos, observacoes, fileUrl, fileName } = body;

    const id = crypto.randomUUID();
    const receita = {
      id,
      medicoId: medicoId || null,
      ubsId: ubsId || null,
      pacienteNome: pacienteNome || '',
      medicamentos: medicamentos || [],
      observacoes: observacoes || '',
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      status: 'pendente',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`receita:${id}`, receita);
    return c.json({ receita });
  } catch (error) {
    console.error('Error creating receita:', error);
    return c.json({ error: 'Failed to create receita' }, 500);
  }
});

// Atualizar receita
app.put("/make-server-2ba59527/receitas/:id", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['farmaceutico', 'admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Insufficient permissions' }, 403);
    }

    const id = c.req.param('id');
    const body = await c.req.json();
    const receita = await kv.get(`receita:${id}`);

    if (!receita) {
      return c.json({ error: 'Receita not found' }, 404);
    }

    const updated = { ...receita, ...body, id, updatedAt: new Date().toISOString() };
    await kv.set(`receita:${id}`, updated);
    return c.json({ receita: updated });
  } catch (error) {
    console.error('Error updating receita:', error);
    return c.json({ error: 'Failed to update receita' }, 500);
  }
});

// ============= RELATÓRIOS (APENAS GERENTE) =============

// Medicamentos mais vendidos
app.get("/make-server-2ba59527/relatorios/medicamentos-mais-vendidos", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Only admin and gerente can access reports' }, 403);
    }

    const vendas = await kv.getByPrefix('venda:');
    const medicamentosCount: Record<string, any> = {};

    for (const venda of vendas) {
      for (const item of venda.itens || []) {
        const { medicamentoId, medicamentoNome, quantidade } = item;
        if (!medicamentosCount[medicamentoId]) {
          medicamentosCount[medicamentoId] = {
            medicamentoId,
            medicamentoNome,
            quantidadeTotal: 0,
            numeroVendas: 0
          };
        }
        medicamentosCount[medicamentoId].quantidadeTotal += quantidade;
        medicamentosCount[medicamentoId].numeroVendas += 1;
      }
    }

    const resultado = Object.values(medicamentosCount)
      .sort((a, b) => b.quantidadeTotal - a.quantidadeTotal);

    return c.json({ medicamentos: resultado });
  } catch (error) {
    console.error('Error generating report:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

// Médicos que mais receitaram
app.get("/make-server-2ba59527/relatorios/medicos-mais-prescreveram", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Only admin and gerente can access reports' }, 403);
    }

    const receitas = await kv.getByPrefix('receita:');
    const medicosCount: Record<string, any> = {};

    for (const receita of receitas) {
      if (receita.medicoId) {
        if (!medicosCount[receita.medicoId]) {
          const medico = await kv.get(`medico:${receita.medicoId}`);
          medicosCount[receita.medicoId] = {
            medicoId: receita.medicoId,
            medicoNome: medico?.nome || 'Desconhecido',
            medicoCrm: medico?.crm || '',
            numeroReceitas: 0
          };
        }
        medicosCount[receita.medicoId].numeroReceitas += 1;
      }
    }

    const resultado = Object.values(medicosCount)
      .sort((a, b) => b.numeroReceitas - a.numeroReceitas);

    return c.json({ medicos: resultado });
  } catch (error) {
    console.error('Error generating report:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

// Atendimentos por funcionário
app.get("/make-server-2ba59527/relatorios/atendimentos-por-funcionario", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Only admin and gerente can access reports' }, 403);
    }

    const vendas = await kv.getByPrefix('venda:');
    const funcionariosCount: Record<string, any> = {};

    for (const venda of vendas) {
      const { funcionarioId, funcionarioNome } = venda;
      if (!funcionariosCount[funcionarioId]) {
        funcionariosCount[funcionarioId] = {
          funcionarioId,
          funcionarioNome: funcionarioNome || 'Desconhecido',
          numeroAtendimentos: 0
        };
      }
      funcionariosCount[funcionarioId].numeroAtendimentos += 1;
    }

    const resultado = Object.values(funcionariosCount)
      .sort((a, b) => b.numeroAtendimentos - a.numeroAtendimentos);

    return c.json({ funcionarios: resultado });
  } catch (error) {
    console.error('Error generating report:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

// UBS com mais pedidos
app.get("/make-server-2ba59527/relatorios/ubs-mais-pedidos", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Only admin and gerente can access reports' }, 403);
    }

    const receitas = await kv.getByPrefix('receita:');
    const ubsCount: Record<string, any> = {};

    for (const receita of receitas) {
      if (receita.ubsId) {
        if (!ubsCount[receita.ubsId]) {
          const ubs = await kv.get(`ubs:${receita.ubsId}`);
          ubsCount[receita.ubsId] = {
            ubsId: receita.ubsId,
            ubsNome: ubs?.nome || 'Desconhecido',
            ubsEndereco: ubs?.endereco || '',
            numeroPedidos: 0
          };
        }
        ubsCount[receita.ubsId].numeroPedidos += 1;
      }
    }

    const resultado = Object.values(ubsCount)
      .sort((a, b) => b.numeroPedidos - a.numeroPedidos);

    return c.json({ ubs: resultado });
  } catch (error) {
    console.error('Error generating report:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

// Estatísticas de estoque
app.get("/make-server-2ba59527/relatorios/estatisticas-estoque", requireAuth, async (c) => {
  try {
    const userType = c.get('userMetadata')?.userType;
    if (!['admin', 'gerente'].includes(userType)) {
      return c.json({ error: 'Unauthorized - Only admin and gerente can access reports' }, 403);
    }

    const medicamentos = await kv.getByPrefix('medicamento:');
    
    let quantidadeTotal = 0;
    let quantidadeMedicamentos = medicamentos.length;
    const medicamentosEstoqueBaixo = [];

    for (const med of medicamentos) {
      const estoqueTotal = (med.lotes || []).reduce((sum, lote) => sum + lote.quantidade, 0);
      quantidadeTotal += estoqueTotal;

      if (estoqueTotal < 10) { // Considerar estoque baixo se menor que 10
        medicamentosEstoqueBaixo.push({
          id: med.id,
          nome: med.nome,
          estoque: estoqueTotal
        });
      }
    }

    return c.json({
      quantidadeMedicamentos,
      quantidadeTotal,
      quantidadeEstoqueBaixo: medicamentosEstoqueBaixo.length,
      medicamentosEstoqueBaixo
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

Deno.serve(app.fetch);

// Sistema de armazenamento local - SEM BACKEND
// Tudo funciona apenas com localStorage

// Helper para gerar IDs únicos
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper para trabalhar com localStorage de forma segura
const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Simula uma API request mas tudo é local
export async function apiRequest(endpoint: string, options?: any): Promise<any> {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 100));

  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body) : null;

  // Rotas de medicamentos
  if (endpoint === '/medicamentos') {
    if (method === 'GET') {
      return { medicamentos: storage.get('medicamentos') || [] };
    }
    if (method === 'POST') {
      const medicamentos = storage.get('medicamentos') || [];
      const novoMedicamento = {
        ...body,
        id: generateId(),
        lotes: [],
      };
      medicamentos.push(novoMedicamento);
      storage.set('medicamentos', medicamentos);
      return { medicamento: novoMedicamento };
    }
  }

  if (endpoint.startsWith('/medicamentos/')) {
    const id = endpoint.split('/')[2];
    
    if (endpoint.includes('/lotes')) {
      // Adicionar lote
      if (method === 'POST') {
        const medicamentos = storage.get('medicamentos') || [];
        const medicamento = medicamentos.find((m: any) => m.id === id);
        if (medicamento) {
          const novoLote = {
            ...body,
            id: generateId(),
          };
          medicamento.lotes = medicamento.lotes || [];
          medicamento.lotes.push(novoLote);
          // Ordenar lotes por validade (FIFO)
          medicamento.lotes.sort((a: any, b: any) => 
            new Date(a.validade).getTime() - new Date(b.validade).getTime()
          );
          storage.set('medicamentos', medicamentos);
          return { lote: novoLote };
        }
      }
    } else {
      // Operações no medicamento
      const medicamentos = storage.get('medicamentos') || [];
      const index = medicamentos.findIndex((m: any) => m.id === id);
      
      if (method === 'PUT' && index !== -1) {
        medicamentos[index] = { ...medicamentos[index], ...body };
        storage.set('medicamentos', medicamentos);
        return { medicamento: medicamentos[index] };
      }
      
      if (method === 'DELETE' && index !== -1) {
        medicamentos.splice(index, 1);
        storage.set('medicamentos', medicamentos);
        return { success: true };
      }
    }
  }

  // Rotas de médicos
  if (endpoint === '/medicos') {
    if (method === 'GET') {
      return { medicos: storage.get('medicos') || [] };
    }
    if (method === 'POST') {
      const medicos = storage.get('medicos') || [];
      const novoMedico = {
        ...body,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      medicos.push(novoMedico);
      storage.set('medicos', medicos);
      return { medico: novoMedico };
    }
  }

  if (endpoint.startsWith('/medicos/')) {
    const id = endpoint.split('/')[2];
    const medicos = storage.get('medicos') || [];
    const index = medicos.findIndex((m: any) => m.id === id);
    
    if (method === 'PUT' && index !== -1) {
      medicos[index] = { ...medicos[index], ...body, createdAt: medicos[index].createdAt };
      storage.set('medicos', medicos);
      return { medico: medicos[index] };
    }
    
    if (method === 'DELETE' && index !== -1) {
      medicos.splice(index, 1);
      storage.set('medicos', medicos);
      return { success: true };
    }
  }

  // Rotas de UBS
  if (endpoint === '/ubs') {
    if (method === 'GET') {
      return { ubs: storage.get('ubs') || [] };
    }
    if (method === 'POST') {
      const ubsList = storage.get('ubs') || [];
      const novaUbs = {
        ...body,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      ubsList.push(novaUbs);
      storage.set('ubs', ubsList);
      return { ubs: novaUbs };
    }
  }

  if (endpoint.startsWith('/ubs/')) {
    const id = endpoint.split('/')[2];
    const ubsList = storage.get('ubs') || [];
    const index = ubsList.findIndex((u: any) => u.id === id);
    
    if (method === 'PUT' && index !== -1) {
      ubsList[index] = { ...ubsList[index], ...body, createdAt: ubsList[index].createdAt };
      storage.set('ubs', ubsList);
      return { ubs: ubsList[index] };
    }
    
    if (method === 'DELETE' && index !== -1) {
      ubsList.splice(index, 1);
      storage.set('ubs', ubsList);
      return { success: true };
    }
  }

  // Rotas de receitas
  if (endpoint === '/receitas') {
    if (method === 'GET') {
      return { receitas: storage.get('receitas') || [] };
    }
    if (method === 'POST') {
      const receitas = storage.get('receitas') || [];
      const novaReceita = {
        ...body,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      receitas.push(novaReceita);
      storage.set('receitas', receitas);
      return { receita: novaReceita };
    }
  }

  if (endpoint.startsWith('/receitas/')) {
    const id = endpoint.split('/')[2];
    const receitas = storage.get('receitas') || [];
    const index = receitas.findIndex((r: any) => r.id === id);
    
    if (method === 'PUT' && index !== -1) {
      receitas[index] = { ...receitas[index], ...body, createdAt: receitas[index].createdAt };
      storage.set('receitas', receitas);
      return { receita: receitas[index] };
    }
  }

  // Rotas de vendas
  if (endpoint === '/vendas') {
    if (method === 'GET') {
      return { vendas: storage.get('vendas') || [] };
    }
    if (method === 'POST') {
      const vendas = storage.get('vendas') || [];
      const medicamentos = storage.get('medicamentos') || [];
      
      // Processar venda com FIFO
      const itens = body.itens || [];
      for (const item of itens) {
        const medicamento = medicamentos.find((m: any) => m.id === item.medicamentoId);
        if (medicamento && medicamento.lotes) {
          let quantidadeRestante = item.quantidade;
          
          // Remover dos lotes mais antigos primeiro (FIFO)
          for (const lote of medicamento.lotes) {
            if (quantidadeRestante <= 0) break;
            
            if (lote.quantidade >= quantidadeRestante) {
              lote.quantidade -= quantidadeRestante;
              quantidadeRestante = 0;
            } else {
              quantidadeRestante -= lote.quantidade;
              lote.quantidade = 0;
            }
          }
          
          // Remover lotes vazios
          medicamento.lotes = medicamento.lotes.filter((l: any) => l.quantidade > 0);
        }
      }
      
      storage.set('medicamentos', medicamentos);
      
      const novaVenda = {
        ...body,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      vendas.push(novaVenda);
      storage.set('vendas', vendas);
      
      // Se tem receita, criar automaticamente
      if (body.receitaFile) {
        const receitas = storage.get('receitas') || [];
        const novaReceita = {
          id: generateId(),
          pacienteNome: body.dadosGerais?.pacienteNome || '',
          medicamentos: itens.map((i: any) => {
            const med = medicamentos.find((m: any) => m.id === i.medicamentoId);
            return `${med?.nome || 'Medicamento'} - ${i.quantidade} ${med?.unidadeMedida || 'un'}`;
          }),
          observacoes: '',
          fileUrl: body.receitaFile.fileUrl || '',
          fileName: body.receitaFile.fileName || '',
          status: 'entregue',
          createdAt: new Date().toISOString(),
          vendaId: novaVenda.id,
        };
        receitas.push(novaReceita);
        storage.set('receitas', receitas);
      }
      
      return { venda: novaVenda };
    }
  }

  // Rotas de relatórios
  if (endpoint.includes('/relatorios/')) {
    const vendas = storage.get('vendas') || [];
    const medicamentos = storage.get('medicamentos') || [];
    const medicos = storage.get('medicos') || [];
    const receitas = storage.get('receitas') || [];
    const ubsList = storage.get('ubs') || [];

    if (endpoint.includes('medicamentos-mais-vendidos')) {
      const vendasPorMedicamento: any = {};
      vendas.forEach((venda: any) => {
        (venda.itens || []).forEach((item: any) => {
          if (!vendasPorMedicamento[item.medicamentoId]) {
            const med = medicamentos.find((m: any) => m.id === item.medicamentoId);
            vendasPorMedicamento[item.medicamentoId] = {
              medicamentoId: item.medicamentoId,
              medicamentoNome: med?.nome || 'Desconhecido',
              quantidadeTotal: 0,
              numeroVendas: 0,
            };
          }
          vendasPorMedicamento[item.medicamentoId].quantidadeTotal += item.quantidade;
          vendasPorMedicamento[item.medicamentoId].numeroVendas += 1;
        });
      });
      
      const resultado = Object.values(vendasPorMedicamento)
        .sort((a: any, b: any) => b.quantidadeTotal - a.quantidadeTotal);
      
      return { medicamentos: resultado };
    }

    if (endpoint.includes('medicos-mais-prescreveram')) {
      const receitasPorMedico: any = {};
      receitas.forEach((receita: any) => {
        if (receita.medicoId) {
          if (!receitasPorMedico[receita.medicoId]) {
            const medico = medicos.find((m: any) => m.id === receita.medicoId);
            receitasPorMedico[receita.medicoId] = {
              medicoId: receita.medicoId,
              medicoNome: medico?.nome || 'Desconhecido',
              medicoCrm: medico?.crm || '',
              numeroReceitas: 0,
            };
          }
          receitasPorMedico[receita.medicoId].numeroReceitas += 1;
        }
      });
      
      const resultado = Object.values(receitasPorMedico)
        .sort((a: any, b: any) => b.numeroReceitas - a.numeroReceitas);
      
      return { medicos: resultado };
    }

    if (endpoint.includes('atendimentos-por-funcionario')) {
      return { funcionarios: [] }; // Mock - não temos sistema de funcionários ainda
    }

    if (endpoint.includes('ubs-mais-pedidos')) {
      const pedidosPorUbs: any = {};
      receitas.forEach((receita: any) => {
        if (receita.ubsId) {
          if (!pedidosPorUbs[receita.ubsId]) {
            const ubs = ubsList.find((u: any) => u.id === receita.ubsId);
            pedidosPorUbs[receita.ubsId] = {
              ubsId: receita.ubsId,
              ubsNome: ubs?.nome || 'Desconhecida',
              ubsEndereco: ubs?.endereco || '',
              numeroPedidos: 0,
            };
          }
          pedidosPorUbs[receita.ubsId].numeroPedidos += 1;
        }
      });
      
      const resultado = Object.values(pedidosPorUbs)
        .sort((a: any, b: any) => b.numeroPedidos - a.numeroPedidos);
      
      return { ubs: resultado };
    }

    if (endpoint.includes('estatisticas-estoque')) {
      let quantidadeTotal = 0;
      let quantidadeEstoqueBaixo = 0;
      const medicamentosEstoqueBaixo: any[] = [];
      
      medicamentos.forEach((med: any) => {
        const estoque = (med.lotes || []).reduce((sum: number, lote: any) => 
          sum + lote.quantidade, 0
        );
        quantidadeTotal += estoque;
        
        if (estoque < 10) {
          quantidadeEstoqueBaixo += 1;
          medicamentosEstoqueBaixo.push({
            id: med.id,
            nome: med.nome,
            estoque,
          });
        }
      });
      
      return {
        quantidadeMedicamentos: medicamentos.length,
        quantidadeTotal,
        quantidadeEstoqueBaixo,
        medicamentosEstoqueBaixo,
      };
    }
  }

  // Session (mock)
  if (endpoint === '/session') {
    return { session: null };
  }

  throw new Error('Endpoint não implementado');
}

// Simula upload de arquivo (retorna URL fake)
export async function uploadFile(file: File): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    fileUrl: URL.createObjectURL(file),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  };
}

// Não há mais Supabase client
export const supabase = null;

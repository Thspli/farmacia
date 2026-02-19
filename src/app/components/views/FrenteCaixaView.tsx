'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/supabase';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ShoppingCart, Plus, Trash2, Upload, FileText, Check } from 'lucide-react';

interface User {
  name: string;
}

interface Medicamento {
  id: string;
  nome: string;
  unidadeMedida: string;
  lotes: Lote[];
}

interface Lote {
  id: string;
  nomeLote: string;
  validade: string;
  quantidade: number;
}

interface ItemCarrinho {
  medicamentoId: string;
  medicamentoNome: string;
  unidadeMedida: string;
  quantidade: number;
  estoqueDisponivel: number;
}

interface FrenteCaixaViewProps {
  user: User;
}

export default function FrenteCaixaView({ user }: FrenteCaixaViewProps) {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [loading, setLoading] = useState(true);
  const [finalizandoVenda, setFinalizandoVenda] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedMedicamentoId, setSelectedMedicamentoId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dados para finalização
  const [dadosGerais, setDadosGerais] = useState({
    pacienteNome: '',
    cpf: '',
    telefone: '',
  });
  const [receitaFile, setReceitaFile] = useState<File | null>(null);

  useEffect(() => {
    loadMedicamentos();
  }, []);

  const loadMedicamentos = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/medicamentos');
      // Filtrar apenas medicamentos disponíveis com estoque
      const disponíveis = (response.medicamentos || []).filter((med: Medicamento) => {
        const estoqueTotal = (med.lotes || []).reduce((sum, lote) => sum + lote.quantidade, 0);
        return estoqueTotal > 0;
      });
      setMedicamentos(disponíveis);
    } catch (error) {
      console.error('Error loading medicamentos:', error);
      toast.error('Erro ao carregar medicamentos');
    } finally {
      setLoading(false);
    }
  };

  const getEstoqueDisponivel = (medicamentoId: string): number => {
    const med = medicamentos.find(m => m.id === medicamentoId);
    if (!med) return 0;
    return (med.lotes || []).reduce((sum, lote) => sum + lote.quantidade, 0);
  };

  const handleAddToCart = () => {
    if (!selectedMedicamentoId || !quantidade || parseInt(quantidade) <= 0) {
      toast.error('Selecione um medicamento e quantidade válida');
      return;
    }

    const medicamento = medicamentos.find(m => m.id === selectedMedicamentoId);
    if (!medicamento) return;

    const qtd = parseInt(quantidade);
    const estoqueDisponivel = getEstoqueDisponivel(selectedMedicamentoId);

    // Verificar se já existe no carrinho
    const itemExistente = carrinho.find(item => item.medicamentoId === selectedMedicamentoId);
    const qtdNoCarrinho = itemExistente ? itemExistente.quantidade : 0;

    if (qtdNoCarrinho + qtd > estoqueDisponivel) {
      toast.error(`Estoque insuficiente! Disponível: ${estoqueDisponivel - qtdNoCarrinho}`);
      return;
    }

    if (itemExistente) {
      setCarrinho(carrinho.map(item =>
        item.medicamentoId === selectedMedicamentoId
          ? { ...item, quantidade: item.quantidade + qtd }
          : item
      ));
    } else {
      setCarrinho([...carrinho, {
        medicamentoId: selectedMedicamentoId,
        medicamentoNome: medicamento.nome,
        unidadeMedida: medicamento.unidadeMedida,
        quantidade: qtd,
        estoqueDisponivel
      }]);
    }

    setSelectedMedicamentoId('');
    setQuantidade('1');
    toast.success('Item adicionado ao carrinho');
  };

  const handleRemoveFromCart = (medicamentoId: string) => {
    setCarrinho(carrinho.filter(item => item.medicamentoId !== medicamentoId));
    toast.success('Item removido do carrinho');
  };

  const handleUpdateQuantity = (medicamentoId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      handleRemoveFromCart(medicamentoId);
      return;
    }

    const estoqueDisponivel = getEstoqueDisponivel(medicamentoId);
    if (novaQuantidade > estoqueDisponivel) {
      toast.error(`Estoque insuficiente! Disponível: ${estoqueDisponivel}`);
      return;
    }

    setCarrinho(carrinho.map(item =>
      item.medicamentoId === medicamentoId
        ? { ...item, quantidade: novaQuantidade }
        : item
    ));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Formato inválido. Use JPG, PNG ou PDF');
        return;
      }
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo: 5MB');
        return;
      }
      setReceitaFile(file);
      toast.success('Arquivo selecionado');
    }
  };

  const handleFinalizarVenda = async () => {
    if (carrinho.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    try {
      setFinalizandoVenda(true);
      
      let receitaData = null;

      // Se tem arquivo, criar URL temporária
      if (receitaFile) {
        receitaData = {
          fileUrl: URL.createObjectURL(receitaFile),
          fileName: receitaFile.name,
          fileSize: receitaFile.size,
          fileType: receitaFile.type,
        };
      }

      // Criar venda
      const vendaData = {
        itens: carrinho.map(item => ({
          medicamentoId: item.medicamentoId,
          quantidade: item.quantidade
        })),
        dadosGerais,
        receitaFile: receitaData
      };

      await apiRequest('/vendas', {
        method: 'POST',
        body: JSON.stringify(vendaData),
      });

      toast.success('Venda finalizada com sucesso! (Sistema FIFO aplicado)');
      
      // Limpar carrinho e formulário
      setCarrinho([]);
      setDadosGerais({ pacienteNome: '', cpf: '', telefone: '' });
      setReceitaFile(null);
      setCheckoutOpen(false);
      
      // Recarregar medicamentos para atualizar estoque
      loadMedicamentos();
    } catch (error: any) {
      console.error('Error finalizing sale:', error);
      toast.error(error.message || 'Erro ao finalizar venda');
    } finally {
      setFinalizandoVenda(false);
    }
  };

  const filteredMedicamentos = medicamentos.filter(med =>
    med.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Frente de Caixa</h2>
          <p className="text-gray-600">Sistema de vendas com controle FIFO automático</p>
        </div>
        {carrinho.length > 0 && (
          <Button onClick={() => setCheckoutOpen(true)} size="lg" className="gap-2">
            <ShoppingCart className="h-5 w-5" />
            Finalizar Venda ({totalItens} {totalItens === 1 ? 'item' : 'itens'})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Produtos */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar ao Carrinho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Buscar Medicamento</Label>
                <Input
                  placeholder="Digite o nome do medicamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicamento">Medicamento</Label>
                  <Select value={selectedMedicamentoId} onValueChange={setSelectedMedicamentoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMedicamentos.map(med => {
                        const estoque = getEstoqueDisponivel(med.id);
                        return (
                          <SelectItem key={med.id} value={med.id}>
                            {med.nome} - Estoque: {estoque} {med.unidadeMedida}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <div className="flex gap-2">
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                    />
                    <Button onClick={handleAddToCart}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-1">
                  ℹ️ Sistema FIFO Ativado
                </p>
                <p className="text-xs text-blue-700">
                  Os medicamentos serão automaticamente retirados dos lotes com data de vencimento
                  mais próxima, garantindo a rotação adequada do estoque.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carrinho */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Carrinho</CardTitle>
                <Badge>{carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {carrinho.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Carrinho vazio</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {carrinho.map((item) => (
                    <div key={item.medicamentoId} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.medicamentoNome}</p>
                          <p className="text-xs text-gray-500">
                            Estoque: {item.estoqueDisponivel} {item.unidadeMedida}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromCart(item.medicamentoId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.medicamentoId, item.quantidade - 1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max={item.estoqueDisponivel}
                          value={item.quantidade}
                          onChange={(e) => handleUpdateQuantity(item.medicamentoId, parseInt(e.target.value) || 0)}
                          className="w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.medicamentoId, item.quantidade + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total de Itens:</span>
                      <span className="text-xl font-bold text-blue-600">{totalItens}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Checkout */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>
              Confirme os detalhes da venda e finalize o processo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Resumo do Carrinho */}
            <div>
              <h3 className="font-semibold mb-3">Itens da Venda</h3>
              <div className="space-y-2">
                {carrinho.map((item) => (
                  <div key={item.medicamentoId} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <div>
                      <p className="font-medium">{item.medicamentoNome}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantidade} {item.unidadeMedida}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dados do Paciente */}
            <div>
              <h3 className="font-semibold mb-3">Dados do Paciente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="pacienteNome">Nome do Paciente</Label>
                  <Input
                    id="pacienteNome"
                    value={dadosGerais.pacienteNome}
                    onChange={(e) => setDadosGerais({ ...dadosGerais, pacienteNome: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={dadosGerais.cpf}
                    onChange={(e) => setDadosGerais({ ...dadosGerais, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={dadosGerais.telefone}
                    onChange={(e) => setDadosGerais({ ...dadosGerais, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Upload da Receita */}
            <div>
              <h3 className="font-semibold mb-3">Receita Médica (Opcional)</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="receita-upload"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="receita-upload" className="cursor-pointer">
                  {receitaFile ? (
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-green-600">{receitaFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(receitaFile.size / 1024).toFixed(2)} KB
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        Trocar Arquivo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-sm font-medium text-gray-700">
                        Clique para fazer upload da receita
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG ou PDF (máx. 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setCheckoutOpen(false)}
                disabled={finalizandoVenda}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleFinalizarVenda}
                disabled={finalizandoVenda}
              >
                {finalizandoVenda ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirmar Venda
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

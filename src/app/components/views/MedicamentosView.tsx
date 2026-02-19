'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/supabase';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, Package, Search, Filter } from 'lucide-react';

interface User {
  userType: string;
}

interface Medicamento {
  id: string;
  nome: string;
  categoria: string;
  unidadeMedida: string;
  fabricante: string;
  composicao: string;
  disponivel: boolean;
  lotes: Lote[];
}

interface Lote {
  id: string;
  nomeLote: string;
  validade: string;
  quantidade: number;
}

interface MedicamentosViewProps {
  user: User;
}

const categorias = [
  'Analgésico',
  'Antibiótico',
  'Anti-inflamatório',
  'Antitérmico',
  'Calmante',
  'Anestésico',
  'Antialérgico',
  'Cardiovascular',
  'Diabetes',
  'Dermatológico',
  'Gastrointestinal',
  'Respiratório',
  'Vitaminas',
  'Outros',
];

const unidadesMedida = ['Comprimido', 'Cápsula', 'mL', 'mg', 'g', 'Ampola', 'Sachê', 'Frasco'];

export default function MedicamentosView({ user }: MedicamentosViewProps) {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [filteredMedicamentos, setFilteredMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loteDialogOpen, setLoteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicamentoToDelete, setMedicamentoToDelete] = useState<string | null>(null);
  const [editingMedicamento, setEditingMedicamento] = useState<Medicamento | null>(null);
  const [selectedMedicamento, setSelectedMedicamento] = useState<Medicamento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    unidadeMedida: '',
    fabricante: '',
    composicao: '',
    disponivel: true,
  });

  const [loteData, setLoteData] = useState({
    nomeLote: '',
    validade: '',
    quantidade: '',
  });

  useEffect(() => {
    loadMedicamentos();
  }, []);

  useEffect(() => {
    filterMedicamentos();
  }, [medicamentos, searchTerm, categoryFilter]);

  const loadMedicamentos = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/medicamentos');
      setMedicamentos(response.medicamentos || []);
    } catch (error) {
      console.error('Error loading medicamentos:', error);
      toast.error('Erro ao carregar medicamentos');
    } finally {
      setLoading(false);
    }
  };

  const filterMedicamentos = () => {
    let filtered = medicamentos;

    if (searchTerm) {
      filtered = filtered.filter(med =>
        med.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.fabricante.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(med => med.categoria === categoryFilter);
    }

    setFilteredMedicamentos(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMedicamento) {
        await apiRequest(`/medicamentos/${editingMedicamento.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        toast.success('Medicamento atualizado com sucesso!');
      } else {
        await apiRequest('/medicamentos', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toast.success('Medicamento cadastrado com sucesso!');
      }
      setDialogOpen(false);
      resetForm();
      loadMedicamentos();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar medicamento');
    }
  };

  const handleDelete = async (id: string) => {
    setMedicamentoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!medicamentoToDelete) return;

    try {
      await apiRequest(`/medicamentos/${medicamentoToDelete}`, { method: 'DELETE' });
      toast.success('Medicamento excluído com sucesso!');
      loadMedicamentos();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir medicamento');
    } finally {
      setDeleteDialogOpen(false);
      setMedicamentoToDelete(null);
    }
  };

  const handleAddLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicamento) return;

    try {
      await apiRequest(`/medicamentos/${selectedMedicamento.id}/lotes`, {
        method: 'POST',
        body: JSON.stringify({
          ...loteData,
          quantidade: parseInt(loteData.quantidade),
        }),
      });
      toast.success('Lote adicionado com sucesso!');
      setLoteDialogOpen(false);
      setLoteData({ nomeLote: '', validade: '', quantidade: '' });
      loadMedicamentos();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar lote');
    }
  };

  const openEditDialog = (medicamento: Medicamento) => {
    setEditingMedicamento(medicamento);
    setFormData({
      nome: medicamento.nome,
      categoria: medicamento.categoria,
      unidadeMedida: medicamento.unidadeMedida,
      fabricante: medicamento.fabricante,
      composicao: medicamento.composicao,
      disponivel: medicamento.disponivel,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openLoteDialog = (medicamento: Medicamento) => {
    setSelectedMedicamento(medicamento);
    setLoteDialogOpen(true);
  };

  const resetForm = () => {
    setEditingMedicamento(null);
    setFormData({
      nome: '',
      categoria: '',
      unidadeMedida: '',
      fabricante: '',
      composicao: '',
      disponivel: true,
    });
  };

  const getEstoqueTotal = (lotes: Lote[]) => {
    return lotes.reduce((sum, lote) => sum + lote.quantidade, 0);
  };

  const canDelete = ['admin', 'gerente'].includes(user.userType);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando medicamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Medicamentos</h2>
          <p className="text-gray-600">Gerencie o catálogo de medicamentos e lotes</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Medicamento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou fabricante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">Todas as categorias</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Medicamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedicamentos.map((medicamento) => {
          const estoqueTotal = getEstoqueTotal(medicamento.lotes || []);
          const estoqueBaixo = estoqueTotal < 10;
          
          return (
            <Card key={medicamento.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{medicamento.nome}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{medicamento.fabricante}</p>
                  </div>
                  <Badge variant={medicamento.disponivel ? 'success' : 'destructive'}>
                    {medicamento.disponivel ? 'Disponível' : 'Indisponível'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoria:</span>
                    <Badge variant="outline">{medicamento.categoria}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unidade:</span>
                    <span className="font-medium">{medicamento.unidadeMedida}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estoque:</span>
                    <span className={`font-bold ${estoqueBaixo ? 'text-red-600' : 'text-green-600'}`}>
                      {estoqueTotal} {medicamento.unidadeMedida}
                    </span>
                  </div>
                  {medicamento.composicao && (
                    <div className="pt-2 border-t">
                      <p className="text-gray-600 text-xs">Composição:</p>
                      <p className="text-xs mt-1">{medicamento.composicao}</p>
                    </div>
                  )}
                </div>

                {/* Lotes */}
                {medicamento.lotes && medicamento.lotes.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Lotes ({medicamento.lotes.length}):
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {medicamento.lotes.map((lote) => (
                        <div
                          key={lote.id}
                          className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded"
                        >
                          <div>
                            <p className="font-medium">{lote.nomeLote}</p>
                            <p className="text-gray-500">
                              Val: {new Date(lote.validade).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge variant="secondary">{lote.quantidade}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openLoteDialog(medicamento)}
                  >
                    <Package className="h-3 w-3 mr-1" />
                    Lote
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(medicamento)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {canDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(medicamento.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMedicamentos.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              Nenhum medicamento encontrado. Clique em "Novo Medicamento" para adicionar.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog para Criar/Editar Medicamento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMedicamento ? 'Editar Medicamento' : 'Novo Medicamento'}
            </DialogTitle>
            <DialogDescription>
              {editingMedicamento ? 'Atualize as informações do medicamento' : 'Cadastre um novo medicamento no sistema'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Medicamento *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fabricante">Fabricante *</Label>
                <Input
                  id="fabricante"
                  value={formData.fabricante}
                  onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidadeMedida">Unidade de Medida *</Label>
                <Select
                  value={formData.unidadeMedida}
                  onValueChange={(value) => setFormData({ ...formData, unidadeMedida: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesMedida.map(unidade => (
                      <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="composicao">Composição</Label>
              <Textarea
                id="composicao"
                value={formData.composicao}
                onChange={(e) => setFormData({ ...formData, composicao: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="disponivel"
                checked={formData.disponivel}
                onChange={(e) => setFormData({ ...formData, disponivel: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="disponivel">Medicamento disponível para venda</Label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingMedicamento ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Adicionar Lote */}
      <Dialog open={loteDialogOpen} onOpenChange={setLoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Lote</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {selectedMedicamento?.nome}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeLote">Nome do Lote *</Label>
              <Input
                id="nomeLote"
                value={loteData.nomeLote}
                onChange={(e) => setLoteData({ ...loteData, nomeLote: e.target.value })}
                placeholder="Ex: LOTE-2024-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validade">Data de Validade *</Label>
              <Input
                id="validade"
                type="date"
                value={loteData.validade}
                onChange={(e) => setLoteData({ ...loteData, validade: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={loteData.quantidade}
                onChange={(e) => setLoteData({ ...loteData, quantidade: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setLoteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Lote</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Confirmar Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Medicamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este medicamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
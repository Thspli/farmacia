'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/supabase';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Edit, Trash2, UserCog } from 'lucide-react';

interface Medico {
  id: string;
  nome: string;
  crm: string;
  ubsId?: string;
  createdAt: string;
}

interface UBS {
  id: string;
  nome: string;
}

export default function MedicosView() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [ubsList, setUbsList] = useState<UBS[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicoToDelete, setMedicoToDelete] = useState<string | null>(null);
  const [editingMedico, setEditingMedico] = useState<Medico | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    crm: '',
    ubsId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medicosRes, ubsRes] = await Promise.all([
        apiRequest('/medicos').catch(() => ({ medicos: [] })),
        apiRequest('/ubs').catch(() => ({ ubs: [] })),
      ]);

      setMedicos(medicosRes.medicos || []);
      setUbsList(ubsRes.ubs || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMedico) {
        await apiRequest(`/medicos/${editingMedico.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        toast.success('Médico atualizado com sucesso!');
      } else {
        await apiRequest('/medicos', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toast.success('Médico cadastrado com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar médico');
    }
  };

  const handleDelete = async (id: string) => {
    setMedicoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!medicoToDelete) return;

    try {
      await apiRequest(`/medicos/${medicoToDelete}`, { method: 'DELETE' });
      toast.success('Médico excluído com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir médico');
    } finally {
      setDeleteDialogOpen(false);
      setMedicoToDelete(null);
    }
  };

  const openEditDialog = (medico: Medico) => {
    setEditingMedico(medico);
    setFormData({
      nome: medico.nome,
      crm: medico.crm,
      ubsId: medico.ubsId || '',
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingMedico(null);
    setFormData({
      nome: '',
      crm: '',
      ubsId: '',
    });
  };

  const getUbsNome = (ubsId?: string) => {
    if (!ubsId) return '-';
    const ubs = ubsList.find(u => u.id === ubsId);
    return ubs?.nome || '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando médicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Médicos</h2>
          <p className="text-gray-600">Gerencie o cadastro de médicos</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Médico
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Médicos</CardTitle>
        </CardHeader>
        <CardContent>
          {medicos.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum médico cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CRM</TableHead>
                    <TableHead>UBS</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicos.map((medico) => (
                    <TableRow key={medico.id}>
                      <TableCell className="font-medium">{medico.nome}</TableCell>
                      <TableCell>{medico.crm}</TableCell>
                      <TableCell>{getUbsNome(medico.ubsId)}</TableCell>
                      <TableCell>
                        {new Date(medico.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(medico)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(medico.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMedico ? 'Editar Médico' : 'Novo Médico'}
            </DialogTitle>
            <DialogDescription>
              {editingMedico ? 'Atualize as informações do médico' : 'Cadastre um novo médico'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm">CRM *</Label>
              <Input
                id="crm"
                value={formData.crm}
                onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                placeholder="Ex: 12345/SP"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ubsId">UBS (Opcional)</Label>
              <Select value={formData.ubsId} onValueChange={(value) => setFormData({ ...formData, ubsId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma UBS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">Nenhuma</SelectItem>
                  {ubsList.map(ubs => (
                    <SelectItem key={ubs.id} value={ubs.id}>
                      {ubs.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingMedico ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Médico</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este médico? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
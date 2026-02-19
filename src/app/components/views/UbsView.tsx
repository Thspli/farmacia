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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

interface UBS {
  id: string;
  nome: string;
  endereco: string;
  createdAt: string;
}

export default function UbsView() {
  const [ubsList, setUbsList] = useState<UBS[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ubsToDelete, setUbsToDelete] = useState<string | null>(null);
  const [editingUbs, setEditingUbs] = useState<UBS | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
  });

  useEffect(() => {
    loadUbsList();
  }, []);

  const loadUbsList = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/ubs');
      setUbsList(response.ubs || []);
    } catch (error) {
      console.error('Error loading UBS:', error);
      toast.error('Erro ao carregar UBS');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUbs) {
        await apiRequest(`/ubs/${editingUbs.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        toast.success('UBS atualizada com sucesso!');
      } else {
        await apiRequest('/ubs', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toast.success('UBS cadastrada com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      loadUbsList();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar UBS');
    }
  };

  const handleDelete = async (id: string) => {
    setUbsToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!ubsToDelete) return;

    try {
      await apiRequest(`/ubs/${ubsToDelete}`, { method: 'DELETE' });
      toast.success('UBS excluída com sucesso!');
      loadUbsList();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir UBS');
    } finally {
      setDeleteDialogOpen(false);
      setUbsToDelete(null);
    }
  };

  const openEditDialog = (ubs: UBS) => {
    setEditingUbs(ubs);
    setFormData({
      nome: ubs.nome,
      endereco: ubs.endereco,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingUbs(null);
    setFormData({
      nome: '',
      endereco: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando UBS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Unidades de Saúde (UBS)</h2>
          <p className="text-gray-600">Gerencie as unidades de saúde cadastradas</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nova UBS
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de UBS</CardTitle>
        </CardHeader>
        <CardContent>
          {ubsList.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Nenhuma UBS cadastrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ubsList.map((ubs) => (
                    <TableRow key={ubs.id}>
                      <TableCell className="font-medium">{ubs.nome}</TableCell>
                      <TableCell>{ubs.endereco}</TableCell>
                      <TableCell>
                        {new Date(ubs.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(ubs)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ubs.id)}
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
              {editingUbs ? 'Editar UBS' : 'Nova UBS'}
            </DialogTitle>
            <DialogDescription>
              {editingUbs ? 'Atualize os detalhes da UBS' : 'Crie uma nova UBS'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da UBS *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: UBS Centro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo *</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Rua, número, bairro, cidade - UF"
                required
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingUbs ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir UBS</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta UBS? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, FileText, Upload, ExternalLink, Edit } from 'lucide-react';

interface User {
  userType: string;
}

interface Receita {
  id: string;
  medicoId?: string;
  ubsId?: string;
  pacienteNome: string;
  medicamentos: string[];
  observacoes: string;
  fileUrl: string;
  fileName: string;
  status: string;
  createdAt: string;
  vendaId?: string;
}

interface Medico {
  id: string;
  nome: string;
  crm: string;
}

interface UBS {
  id: string;
  nome: string;
}

interface ReceitasViewProps {
  user: User;
}

export default function ReceitasView({ user }: ReceitasViewProps) {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [ubsList, setUbsList] = useState<UBS[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [formData, setFormData] = useState({
    medicoId: '',
    ubsId: '',
    pacienteNome: '',
    medicamentos: '',
    observacoes: '',
    status: 'pendente',
  });
  const [receitaFile, setReceitaFile] = useState<File | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [receitasRes, medicosRes, ubsRes] = await Promise.all([
        apiRequest('/receitas').catch(() => ({ receitas: [] })),
        apiRequest('/medicos').catch(() => ({ medicos: [] })),
        apiRequest('/ubs').catch(() => ({ ubs: [] })),
      ]);

      setReceitas(receitasRes.receitas || []);
      setMedicos(medicosRes.medicos || []);
      setUbsList(ubsRes.ubs || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Formato inválido. Use JPG, PNG ou PDF');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo: 5MB');
        return;
      }
      setReceitaFile(file);
      toast.success('Arquivo selecionado');
    }
  };

  const handleUploadFile = async () => {
    if (!receitaFile) return;

    try {
      setUploadingFile(true);
      // Simula upload - cria URL temporária
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = {
        fileUrl: URL.createObjectURL(receitaFile),
        fileName: receitaFile.name,
        fileSize: receitaFile.size,
        fileType: receitaFile.type,
      };
      setUploadedFileData(data);
      toast.success('Arquivo enviado com sucesso!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Erro ao enviar arquivo');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const medicamentosArray = formData.medicamentos
        .split('\n')
        .filter(m => m.trim())
        .map(m => m.trim());

      const data = {
        ...formData,
        medicamentos: medicamentosArray,
        fileUrl: uploadedFileData?.fileUrl || '',
        fileName: uploadedFileData?.fileName || receitaFile?.name || '',
      };

      if (editingReceita) {
        await apiRequest(`/receitas/${editingReceita.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        toast.success('Receita atualizada com sucesso!');
      } else {
        await apiRequest('/receitas', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        toast.success('Receita cadastrada com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar receita');
    }
  };

  const openEditDialog = (receita: Receita) => {
    setEditingReceita(receita);
    setFormData({
      medicoId: receita.medicoId || '',
      ubsId: receita.ubsId || '',
      pacienteNome: receita.pacienteNome,
      medicamentos: receita.medicamentos.join('\n'),
      observacoes: receita.observacoes,
      status: receita.status,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingReceita(null);
    setFormData({
      medicoId: '',
      ubsId: '',
      pacienteNome: '',
      medicamentos: '',
      observacoes: '',
      status: 'pendente',
    });
    setReceitaFile(null);
    setUploadedFileData(null);
  };

  const getMedicoNome = (medicoId?: string) => {
    if (!medicoId) return '-';
    const medico = medicos.find(m => m.id === medicoId);
    return medico ? `${medico.nome} (CRM: ${medico.crm})` : '-';
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
          <p className="mt-4 text-gray-600">Carregando receitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Receitas</h2>
          <p className="text-gray-600">Gerencie receitas médicas e prescrições</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          {receitas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Nenhuma receita cadastrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>UBS</TableHead>
                    <TableHead>Medicamentos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receitas.map((receita) => (
                    <TableRow key={receita.id}>
                      <TableCell className="font-medium">
                        {receita.pacienteNome || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getMedicoNome(receita.medicoId)}
                      </TableCell>
                      <TableCell>{getUbsNome(receita.ubsId)}</TableCell>
                      <TableCell>
                        {receita.medicamentos.length > 0 ? (
                          <div className="text-xs">
                            {receita.medicamentos.slice(0, 2).join(', ')}
                            {receita.medicamentos.length > 2 && ' ...'}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            receita.status === 'entregue'
                              ? 'success'
                              : receita.status === 'pendente'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {receita.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(receita.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {receita.fileUrl ? (
                          <a
                            href={receita.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                          >
                            Ver <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(receita)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReceita ? 'Editar Receita' : 'Nova Receita'}
            </DialogTitle>
            <DialogDescription>
              {editingReceita ? 'Atualize os detalhes da receita' : 'Crie uma nova receita'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pacienteNome">Nome do Paciente</Label>
                <Input
                  id="pacienteNome"
                  value={formData.pacienteNome}
                  onChange={(e) => setFormData({ ...formData, pacienteNome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicoId">Médico</Label>
                <Select value={formData.medicoId} onValueChange={(value) => setFormData({ ...formData, medicoId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Nenhum</SelectItem>
                    {medicos.map(medico => (
                      <SelectItem key={medico.id} value={medico.id}>
                        {medico.nome} - CRM: {medico.crm}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ubsId">UBS</Label>
                <Select value={formData.ubsId} onValueChange={(value) => setFormData({ ...formData, ubsId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione (opcional)" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicamentos">Medicamentos (um por linha)</Label>
              <Textarea
                id="medicamentos"
                value={formData.medicamentos}
                onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                rows={4}
                placeholder="Ex:&#10;Dipirona 500mg - 1 caixa&#10;Amoxicilina 500mg - 2 caixas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Arquivo da Receita</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  id="receita-file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="receita-file" className="cursor-pointer block">
                  {receitaFile || uploadedFileData ? (
                    <div className="text-center space-y-2">
                      <FileText className="h-10 w-10 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-green-600">
                        {receitaFile?.name || uploadedFileData?.fileName}
                      </p>
                      {uploadedFileData ? (
                        <Badge variant="success">Arquivo enviado</Badge>
                      ) : (
                        <Button type="button" size="sm" onClick={handleUploadFile} disabled={uploadingFile}>
                          {uploadingFile ? 'Enviando...' : 'Enviar Arquivo'}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">Clique para selecionar arquivo</p>
                      <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingReceita ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
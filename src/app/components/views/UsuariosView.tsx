'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Edit, Trash2, Users, ShieldCheck, UserCog, User, Eye, EyeOff } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  userType: 'farmaceutico' | 'admin' | 'gerente' | 'funcionario';
  createdAt: string;
  password?: string;
}

interface UsuariosViewProps {
  currentUser: { id: string; email: string };
}

const MOCK_USERS_KEY = 'farmacia_mock_users';

function getMockUsers(): UserData[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(MOCK_USERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Object.entries(parsed).map(([email, data]: [string, any]) => ({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        userType: data.user.userType,
        createdAt: data.user.createdAt || new Date().toISOString(),
        password: data.password,
      }));
    }
  } catch (e) {
    console.error('Error loading mock users:', e);
  }
  return [];
}

function saveUser(userData: UserData, password: string) {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(MOCK_USERS_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[userData.email] = {
      password,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        userType: userData.userType,
        createdAt: userData.createdAt,
      },
    };
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(parsed));
  } catch (e) {
    console.error('Error saving user:', e);
  }
}

function deleteUser(email: string) {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(MOCK_USERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      delete parsed[email];
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(parsed));
    }
  } catch (e) {
    console.error('Error deleting user:', e);
  }
}

const userTypeLabels: Record<string, string> = {
  funcionario: 'Funcionário',
  farmaceutico: 'Farmacêutico',
  gerente: 'Gerente',
  admin: 'Administrador',
};

const userTypeColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  funcionario: 'secondary',
  farmaceutico: 'default',
  gerente: 'warning',
  admin: 'destructive',
};

const userTypeIcons: Record<string, React.ReactNode> = {
  funcionario: <User className="h-3 w-3" />,
  farmaceutico: <UserCog className="h-3 w-3" />,
  gerente: <Users className="h-3 w-3" />,
  admin: <ShieldCheck className="h-3 w-3" />,
};

export default function UsuariosView({ currentUser }: UsuariosViewProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: '' as UserData['userType'] | '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getMockUsers());
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', userType: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      userType: user.userType,
      password: '',
      confirmPassword: '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.userType) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Senha é obrigatória para novos usuários');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    // Check duplicate email on create
    if (!editingUser) {
      const existing = users.find(u => u.email === formData.email);
      if (existing) {
        toast.error('Este email já está cadastrado');
        return;
      }
    }

    if (editingUser) {
      // Update existing user
      const stored = localStorage.getItem(MOCK_USERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // If email changed, move entry
        if (editingUser.email !== formData.email) {
          const oldEntry = parsed[editingUser.email];
          delete parsed[editingUser.email];
          parsed[formData.email] = {
            password: formData.password || oldEntry.password,
            user: {
              id: editingUser.id,
              email: formData.email,
              name: formData.name,
              userType: formData.userType,
              createdAt: editingUser.createdAt,
            },
          };
        } else {
          parsed[editingUser.email] = {
            password: formData.password || parsed[editingUser.email]?.password || 'senha123',
            user: {
              id: editingUser.id,
              email: formData.email,
              name: formData.name,
              userType: formData.userType,
              createdAt: editingUser.createdAt,
            },
          };
        }
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(parsed));
      }
      toast.success('Usuário atualizado com sucesso!');
    } else {
      // Create new user
      const newUser: UserData = {
        id: `user-${Date.now()}`,
        email: formData.email,
        name: formData.name,
        userType: formData.userType as UserData['userType'],
        createdAt: new Date().toISOString(),
      };
      saveUser(newUser, formData.password);
      toast.success('Usuário cadastrado com sucesso!');
    }

    setDialogOpen(false);
    resetForm();
    loadUsers();
  };

  const handleDelete = (user: UserData) => {
    if (user.email === currentUser.email) {
      toast.error('Você não pode excluir seu próprio usuário');
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.email);
    toast.success('Usuário excluído com sucesso!');
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    loadUsers();
  };

  const countByType = (type: string) => users.filter(u => u.userType === type).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h2>
          <p className="text-gray-600">Cadastre e gerencie os usuários do sistema</p>
        </div>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['funcionario', 'farmaceutico', 'gerente', 'admin'] as const).map((type) => (
          <Card key={type} className="overflow-hidden">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {userTypeLabels[type]}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{countByType(type)}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${
                  type === 'admin' ? 'bg-red-100 text-red-600' :
                  type === 'gerente' ? 'bg-yellow-100 text-yellow-600' :
                  type === 'farmaceutico' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {type === 'admin' ? <ShieldCheck className="h-5 w-5" /> :
                   type === 'gerente' ? <Users className="h-5 w-5" /> :
                   type === 'farmaceutico' ? <UserCog className="h-5 w-5" /> :
                   <User className="h-5 w-5" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum usuário cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Cadastrado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className={user.email === currentUser.email ? 'bg-blue-50/50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.name}
                          {user.email === currentUser.email && (
                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                              Você
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={userTypeColors[user.userType]} className="gap-1">
                          {userTypeIcons[user.userType]}
                          {userTypeLabels[user.userType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            disabled={user.email === currentUser.email}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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

      {/* Permissions Info Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 text-base">Permissões por Cargo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                type: 'funcionario',
                label: 'Funcionário',
                perms: ['Frente de Caixa'],
                color: 'bg-gray-100 text-gray-800 border-gray-200',
              },
              {
                type: 'farmaceutico',
                label: 'Farmacêutico',
                perms: ['Frente de Caixa', 'Medicamentos', 'Receitas'],
                color: 'bg-blue-100 text-blue-800 border-blue-200',
              },
              {
                type: 'gerente',
                label: 'Gerente',
                perms: ['Tudo do Farmacêutico', 'Médicos', 'UBS', 'Relatórios'],
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
              },
              {
                type: 'admin',
                label: 'Administrador',
                perms: ['Acesso Total', 'Gerenciar Usuários'],
                color: 'bg-red-100 text-red-800 border-red-200',
              },
            ].map(({ type, label, perms, color }) => (
              <div key={type} className={`rounded-lg p-3 border ${color}`}>
                <p className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                  {userTypeIcons[type]}
                  {label}
                </p>
                <ul className="space-y-1">
                  {perms.map(p => (
                    <li key={p} className="text-xs flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-current opacity-60 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); resetForm(); } else setDialogOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Atualize as informações do usuário. Deixe a senha em branco para manter a atual.'
                : 'Preencha os dados para criar um novo usuário no sistema.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: João Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@farmacia.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">Cargo *</Label>
              <Select
                value={formData.userType}
                onValueChange={(value) => setFormData({ ...formData, userType: value as UserData['userType'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="funcionario">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Funcionário
                    </div>
                  </SelectItem>
                  <SelectItem value="farmaceutico">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" /> Farmacêutico
                    </div>
                  </SelectItem>
                  <SelectItem value="gerente">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Gerente
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">
                {editingUser ? 'Nova Senha (opcional)' : 'Senha *'}
              </p>

              <div className="space-y-2">
                <Label htmlFor="password">{editingUser ? 'Nova Senha' : 'Senha'}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repita a senha"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?
              Esta ação não pode ser desfeita e o usuário perderá o acesso ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
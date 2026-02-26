'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  Pill,
  FileText,
  UserCog,
  Building2,
  ShoppingCart,
  BarChart3,
  LogOut,
  Menu,
  X,
  Users
} from 'lucide-react';
import MedicamentosView from './views/MedicamentosView';
import ReceitasView from './views/ReceitasView';
import MedicosView from './views/MedicosView';
import UbsView from './views/UbsView';
import FrenteCaixaView from './views/FrenteCaixaView';
import RelatoriosView from './views/RelatoriosView';
import HomeView from './views/HomeView';
import UsuariosView from './views/UsuariosView';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'farmaceutico' | 'admin' | 'gerente' | 'funcionario';
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'home', label: 'Início', icon: LayoutDashboard, roles: ['funcionario', 'farmaceutico', 'admin', 'gerente'] },
    { id: 'frente-caixa', label: 'Frente de Caixa', icon: ShoppingCart, roles: ['funcionario', 'farmaceutico', 'admin', 'gerente'] },
    { id: 'medicamentos', label: 'Medicamentos', icon: Pill, roles: ['farmaceutico', 'admin', 'gerente'] },
    { id: 'receitas', label: 'Receitas', icon: FileText, roles: ['farmaceutico', 'admin', 'gerente'] },
    { id: 'medicos', label: 'Médicos', icon: UserCog, roles: ['admin', 'gerente'] },
    { id: 'ubs', label: 'UBS', icon: Building2, roles: ['admin', 'gerente'] },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3, roles: ['admin', 'gerente'] },
    { id: 'usuarios', label: 'Usuários', icon: Users, roles: ['admin'] },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(user.userType)
  );

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView user={user} />;
      case 'medicamentos':
        return <MedicamentosView user={user} />;
      case 'receitas':
        return <ReceitasView user={user} />;
      case 'medicos':
        return <MedicosView user={user} />;
      case 'ubs':
        return <UbsView user={user} />;
      case 'frente-caixa':
        return <FrenteCaixaView user={user} />;
      case 'relatorios':
        return <RelatoriosView user={user} />;
      case 'usuarios':
        return <UsuariosView currentUser={user} />;
      default:
        return <HomeView user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Sistema Farmácia</h1>
                <p className="text-xs text-gray-500">Gestão Profissional</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.userType}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out mt-[73px] lg:mt-0`}
        >
          <nav className="p-4 space-y-1">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isUsersItem = item.id === 'usuarios';
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? isUsersItem
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'bg-blue-50 text-blue-700 font-medium'
                      : isUsersItem
                        ? 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isUsersItem && (
                    <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                      Admin
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderView()}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
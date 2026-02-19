'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { apiRequest } from '../../../lib/supabase';
import { Pill, FileText, ShoppingCart, AlertTriangle } from 'lucide-react';

interface User {
  userType: string;
  name: string;
}

interface HomeViewProps {
  user: User;
}

export default function HomeView({ user }: HomeViewProps) {
  const [stats, setStats] = useState({
    totalMedicamentos: 0,
    totalEstoque: 0,
    estoqueBaixo: 0,
    totalVendas: 0,
    totalReceitas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const [medicamentosRes, vendasRes, receitasRes] = await Promise.all([
        apiRequest('/medicamentos').catch(() => ({ medicamentos: [] })),
        apiRequest('/vendas').catch(() => ({ vendas: [] })),
        apiRequest('/receitas').catch(() => ({ receitas: [] })),
      ]);

      const medicamentos = medicamentosRes.medicamentos || [];
      const vendas = vendasRes.vendas || [];
      const receitas = receitasRes.receitas || [];

      let totalEstoque = 0;
      let estoqueBaixo = 0;

      medicamentos.forEach((med: any) => {
        const estoqueTotal = (med.lotes || []).reduce((sum: number, lote: any) => sum + lote.quantidade, 0);
        totalEstoque += estoqueTotal;
        if (estoqueTotal < 10) {
          estoqueBaixo++;
        }
      });

      setStats({
        totalMedicamentos: medicamentos.length,
        totalEstoque,
        estoqueBaixo,
        totalVendas: vendas.length,
        totalReceitas: receitas.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Medicamentos',
      value: stats.totalMedicamentos,
      icon: Pill,
      color: 'bg-blue-500',
      show: ['farmaceutico', 'admin', 'gerente'],
    },
    {
      title: 'Estoque Total',
      value: stats.totalEstoque,
      icon: Pill,
      color: 'bg-green-500',
      show: ['farmaceutico', 'admin', 'gerente'],
    },
    {
      title: 'Estoque Baixo',
      value: stats.estoqueBaixo,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      show: ['farmaceutico', 'admin', 'gerente'],
    },
    {
      title: 'Total de Vendas',
      value: stats.totalVendas,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      show: ['funcionario', 'farmaceutico', 'admin', 'gerente'],
    },
    {
      title: 'Total de Receitas',
      value: stats.totalReceitas,
      icon: FileText,
      color: 'bg-indigo-500',
      show: ['farmaceutico', 'admin', 'gerente'],
    },
  ];

  const visibleStats = statCards.filter(stat => stat.show.includes(user.userType));

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
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo, {user.name}!
        </h2>
        <p className="text-gray-600">
          Visão geral do sistema de gerenciamento da farmácia
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Controle FIFO</h3>
              <p className="text-sm text-blue-700">
                O sistema utiliza o método FIFO (First In, First Out) para controle de estoque,
                garantindo que os medicamentos mais próximos do vencimento sejam vendidos primeiro.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Gestão por Lotes</h3>
              <p className="text-sm text-green-700">
                Cada medicamento possui controle individual de lotes com validade e quantidade,
                facilitando a rastreabilidade e gestão de estoque.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Receitas Digitais</h3>
              <p className="text-sm text-purple-700">
                Sistema completo de upload e gerenciamento de receitas médicas,
                com controle de médicos e UBS vinculadas.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">Relatórios Gerenciais</h3>
              <p className="text-sm text-orange-700">
                Acesso a relatórios completos de vendas, atendimentos, medicamentos mais vendidos
                e outras métricas importantes para a gestão.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
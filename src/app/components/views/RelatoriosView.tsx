'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { BarChart3, TrendingUp, Users, Building2, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface User {
  userType: string;
}

export default function RelatoriosView({ user }: User) {
  const [loading, setLoading] = useState(true);
  const [medicamentosMaisVendidos, setMedicamentosMaisVendidos] = useState<any[]>([]);
  const [medicosMaisPrescreveram, setMedicosMaisPrescreveram] = useState<any[]>([]);
  const [atendimentosPorFuncionario, setAtendimentosPorFuncionario] = useState<any[]>([]);
  const [ubsMaisPedidos, setUbsMaisPedidos] = useState<any[]>([]);
  const [estatisticasEstoque, setEstatisticasEstoque] = useState<any>(null);

  useEffect(() => {
    loadRelatorios();
  }, []);

  const loadRelatorios = async () => {
    try {
      setLoading(true);

      const [medicamentosRes, medicosRes, funcionariosRes, ubsRes, estoqueRes] = await Promise.all([
        apiRequest('/relatorios/medicamentos-mais-vendidos').catch(() => ({ medicamentos: [] })),
        apiRequest('/relatorios/medicos-mais-prescreveram').catch(() => ({ medicos: [] })),
        apiRequest('/relatorios/atendimentos-por-funcionario').catch(() => ({ funcionarios: [] })),
        apiRequest('/relatorios/ubs-mais-pedidos').catch(() => ({ ubs: [] })),
        apiRequest('/relatorios/estatisticas-estoque').catch(() => null),
      ]);

      setMedicamentosMaisVendidos(medicamentosRes.medicamentos || []);
      setMedicosMaisPrescreveram(medicosRes.medicos || []);
      setAtendimentosPorFuncionario(funcionariosRes.funcionarios || []);
      setUbsMaisPedidos(ubsRes.ubs || []);
      setEstatisticasEstoque(estoqueRes);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Relatórios Gerenciais</h2>
        <p className="text-gray-600">Análises e métricas do sistema</p>
      </div>

      {/* Cards de Estatísticas Gerais */}
      {estatisticasEstoque && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Medicamentos
                </CardTitle>
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {estatisticasEstoque.quantidadeMedicamentos}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Estoque Total (Unidades)
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {estatisticasEstoque.quantidadeTotal}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Medicamentos Estoque Baixo
                </CardTitle>
                <Package className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {estatisticasEstoque.quantidadeEstoqueBaixo}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs com Relatórios Detalhados */}
      <Tabs defaultValue="medicamentos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="medicamentos">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Medicamentos</span>
          </TabsTrigger>
          <TabsTrigger value="medicos">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Médicos</span>
          </TabsTrigger>
          <TabsTrigger value="funcionarios">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Funcionários</span>
          </TabsTrigger>
          <TabsTrigger value="ubs">
            <Building2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">UBS</span>
          </TabsTrigger>
        </TabsList>

        {/* Medicamentos Mais Vendidos */}
        <TabsContent value="medicamentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medicamentos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              {medicamentosMaisVendidos.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma venda registrada ainda</p>
              ) : (
                <>
                  <div className="overflow-x-auto mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Posição</TableHead>
                          <TableHead>Medicamento</TableHead>
                          <TableHead>Quantidade Vendida</TableHead>
                          <TableHead>Nº de Vendas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicamentosMaisVendidos.slice(0, 10).map((item, index) => (
                          <TableRow key={item.medicamentoId}>
                            <TableCell>
                              <Badge variant={index < 3 ? 'default' : 'secondary'}>
                                {index + 1}º
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.medicamentoNome}</TableCell>
                            <TableCell>{item.quantidadeTotal}</TableCell>
                            <TableCell>{item.numeroVendas}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {medicamentosMaisVendidos.length > 0 && (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={medicamentosMaisVendidos.slice(0, 10)} key="medicamentos-chart">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="medicamentoNome" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            fontSize={12}
                          />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="quantidadeTotal" name="Quantidade Vendida" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Medicamentos com Estoque Baixo */}
          {estatisticasEstoque?.medicamentosEstoqueBaixo && estatisticasEstoque.medicamentosEstoqueBaixo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Medicamentos com Estoque Baixo ({"<"} 10 unidades)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicamento</TableHead>
                      <TableHead>Estoque Atual</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estatisticasEstoque.medicamentosEstoqueBaixo.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.nome}</TableCell>
                        <TableCell>{item.estoque}</TableCell>
                        <TableCell>
                          <Badge variant={item.estoque === 0 ? 'destructive' : 'warning'}>
                            {item.estoque === 0 ? 'Sem Estoque' : 'Estoque Baixo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Médicos que Mais Prescreveram */}
        <TabsContent value="medicos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Médicos que Mais Prescreveram</CardTitle>
            </CardHeader>
            <CardContent>
              {medicosMaisPrescreveram.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma receita com médico vinculado</p>
              ) : (
                <>
                  <div className="overflow-x-auto mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Posição</TableHead>
                          <TableHead>Médico</TableHead>
                          <TableHead>CRM</TableHead>
                          <TableHead>Nº de Receitas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicosMaisPrescreveram.map((item, index) => (
                          <TableRow key={item.medicoId}>
                            <TableCell>
                              <Badge variant={index < 3 ? 'default' : 'secondary'}>
                                {index + 1}º
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.medicoNome}</TableCell>
                            <TableCell>{item.medicoCrm}</TableCell>
                            <TableCell>{item.numeroReceitas}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={medicosMaisPrescreveram}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="medicoNome" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="numeroReceitas" name="Nº de Receitas" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Atendimentos por Funcionário */}
        <TabsContent value="funcionarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atendimentos por Funcionário</CardTitle>
            </CardHeader>
            <CardContent>
              {atendimentosPorFuncionario.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum atendimento registrado</p>
              ) : (
                <>
                  <div className="overflow-x-auto mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Posição</TableHead>
                          <TableHead>Funcionário</TableHead>
                          <TableHead>Nº de Atendimentos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {atendimentosPorFuncionario.map((item, index) => (
                          <TableRow key={item.funcionarioId}>
                            <TableCell>
                              <Badge variant={index < 3 ? 'default' : 'secondary'}>
                                {index + 1}º
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.funcionarioNome}</TableCell>
                            <TableCell>{item.numeroAtendimentos}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={atendimentosPorFuncionario}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="funcionarioNome" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="numeroAtendimentos" name="Nº de Atendimentos" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* UBS com Mais Pedidos */}
        <TabsContent value="ubs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>UBS com Mais Pedidos de Receita</CardTitle>
            </CardHeader>
            <CardContent>
              {ubsMaisPedidos.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma receita com UBS vinculada</p>
              ) : (
                <>
                  <div className="overflow-x-auto mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Posição</TableHead>
                          <TableHead>UBS</TableHead>
                          <TableHead>Endereço</TableHead>
                          <TableHead>Nº de Pedidos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ubsMaisPedidos.map((item, index) => (
                          <TableRow key={item.ubsId}>
                            <TableCell>
                              <Badge variant={index < 3 ? 'default' : 'secondary'}>
                                {index + 1}º
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.ubsNome}</TableCell>
                            <TableCell className="text-sm text-gray-600">{item.ubsEndereco}</TableCell>
                            <TableCell>{item.numeroPedidos}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ubsMaisPedidos}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="ubsNome" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="numeroPedidos" name="Nº de Pedidos" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
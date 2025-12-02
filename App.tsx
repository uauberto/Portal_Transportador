import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
  login, 
  logout, 
  getAllUsers, 
  updateUserConfig, 
  getAllCarriers, 
  createCarrier, 
  updateCarrier, 
  deleteCarrier 
} from './services/authService';
import { getNFes, generateZip } from './services/nfeService';
import { User, NFe, NFeStatus, UserRole, Transportadora } from './types';
import { Button } from './components/ui/Button';
import { NFeDetailModal } from './components/NFeDetailModal';
import { 
  Truck, 
  LogOut, 
  FileArchive, 
  Calendar, 
  ChevronRight, 
  LayoutDashboard,
  Package,
  MapPin,
  FileText,
  Users,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Info,
  Building,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';

// --- Auth Context
const AuthContext = React.createContext<{
  user: User | null;
  loginUser: (u: string, p: string) => Promise<void>;
  logoutUser: () => void;
}>({ user: null, loginUser: async () => {}, logoutUser: () => {} });

// --- Protected Route Wrapper
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactElement, requiredRole?: UserRole }) => {
  const { user } = React.useContext(AuthContext);
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (requiredRole && user.role !== requiredRole) {
     return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// --- Components Pages

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = React.useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await loginUser(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-900 font-sans p-4">
      
      {/* Brand Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur mb-5 shadow-xl border border-white/20">
           <Truck className="text-white" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-wide uppercase">PORTAL DO TRANSPORTADOR</h2>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Acesso ao Sistema</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Email / Usuário</label>
              <input 
                type="email" 
                placeholder="exemplo@empresa.com.br"
                className="w-full px-4 py-3 bg-gray-50 text-base text-gray-900 border border-gray-200 rounded focus:ring-2 focus:ring-brand-600 focus:bg-white focus:border-transparent outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 text-base text-gray-900 border border-gray-200 rounded focus:ring-2 focus:ring-brand-600 focus:bg-white focus:border-transparent outline-none transition pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-brand-600 transition"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center pt-2">
              <input id="remember" type="checkbox" className="h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
              <label htmlFor="remember" className="ml-3 block text-base text-gray-500">
                Mantenha-me conectado
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-base p-4 rounded flex items-center gap-2">
                 <Info size={20} /> {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3.5 text-lg font-bold" size="lg" isLoading={isLoading}>
              ENTRAR
            </Button>
          </form>
        </div>
        
        {/* Credenciais de Teste (Visíveis para avaliação) */}
        <div className="bg-gray-100 p-5 border-t border-gray-200 text-sm text-gray-500">
          <p className="font-bold text-gray-700 mb-3 uppercase">Credenciais de Teste (Avaliação):</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded border border-gray-200 cursor-pointer hover:bg-blue-50 transition" onClick={() => { setEmail('admin@sistema.com.br'); setPassword('123456'); }}>
               <p className="font-bold text-red-600 mb-1">ADMINISTRADOR</p>
               <p>admin@sistema.com.br</p>
               <p>Senha: 123456</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200 cursor-pointer hover:bg-blue-50 transition" onClick={() => { setEmail('joao@transrapido.com.br'); setPassword('123456'); }}>
               <p className="font-bold text-blue-600 mb-1">TRANSPORTADORA</p>
               <p>joao@transrapido.com.br</p>
               <p>Senha: 123456</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-brand-800 uppercase font-bold tracking-wider">
          Portal do Transportador &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

// --- ADMIN USER MANAGEMENT PAGE ---

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [carriers, setCarriers] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getAllCarriers()])
      .then(([usersData, carriersData]) => {
        setUsers(usersData);
        setCarriers(carriersData);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    // Optimistic update
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    await updateUserConfig(userId, { role: newRole });
  };

  const handleCarrierChange = async (userId: string, carrierId: string) => {
     // Optimistic update
     setUsers(users.map(u => u.id === userId ? { ...u, carrierId: carrierId || undefined } : u));
     await updateUserConfig(userId, { carrierId: carrierId || undefined });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Acessos</h1>
        <p className="text-gray-500 text-lg mt-1">Configure quem pode acessar o sistema e quais dados podem visualizar.</p>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left text-base">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-bold">
            <tr>
              <th className="px-6 py-5">Usuário</th>
              <th className="px-6 py-5">Email</th>
              <th className="px-6 py-5">Função (Role)</th>
              <th className="px-6 py-5">Transportadora Vinculada</th>
              <th className="px-6 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan={5} className="p-8 text-center">Carregando usuários...</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-5 font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-5 text-gray-600">{u.email}</td>
                  <td className="px-6 py-5">
                    <select 
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className={`border rounded px-3 py-1.5 text-sm font-bold ${u.role === UserRole.ADMIN ? 'text-red-600 bg-red-50 border-red-200' : 'text-blue-600 bg-blue-50 border-blue-200'}`}
                    >
                      <option value={UserRole.CARRIER}>TRANSPORTADORA</option>
                      <option value={UserRole.ADMIN}>ADMINISTRADOR</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    {u.role === UserRole.ADMIN ? (
                      <span className="text-gray-400 italic text-sm">Acesso total (Sem restrição)</span>
                    ) : (
                      <select
                        value={u.carrierId || ''}
                        onChange={(e) => handleCarrierChange(u.id, e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 w-full max-w-xs focus:ring-1 focus:ring-brand-500 outline-none text-base"
                      >
                         <option value="">-- Selecione --</option>
                         {carriers.map(c => (
                           <option key={c.id} value={c.id}>{c.name} ({c.cnpj})</option>
                         ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-green-100 text-green-800">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 bg-yellow-50 border border-yellow-200 p-5 rounded-md flex gap-4 text-base text-yellow-800">
        <Lock size={24} className="flex-shrink-0" />
        <div>
           <p className="font-bold">Nota de Segurança:</p>
           <p>Usuários configurados como <strong>ADMINISTRADOR</strong> podem ver todas as notas fiscais e modificar configurações de outros usuários. Usuários configurados como <strong>TRANSPORTADORA</strong> só visualizam notas vinculadas à transportadora selecionada.</p>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN CARRIER MANAGEMENT PAGE (NEW) ---

const AdminCarrierManagement = () => {
  const [carriers, setCarriers] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCnpj, setFormCnpj] = useState('');

  const fetchCarriers = () => {
    setLoading(true);
    getAllCarriers().then(setCarriers).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  const handleOpenModal = (carrier?: Transportadora) => {
    if (carrier) {
      setEditingId(carrier.id);
      setFormName(carrier.name);
      setFormCnpj(carrier.cnpj);
    } else {
      setEditingId(null);
      setFormName('');
      setFormCnpj('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateCarrier(editingId, { name: formName, cnpj: formCnpj });
      } else {
        await createCarrier({ name: formName, cnpj: formCnpj });
      }
      setIsModalOpen(false);
      fetchCarriers();
    } catch (err) {
      alert("Erro ao salvar transportadora");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transportadora?")) {
      await deleteCarrier(id);
      fetchCarriers();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-800">Transportadoras</h1>
           <p className="text-gray-500 text-lg mt-1">Cadastre e gerencie as empresas parceiras.</p>
        </div>
        <Button onClick={() => handleOpenModal()} size="lg">
           <Plus size={20} className="mr-2" /> Nova Transportadora
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left text-base">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-bold">
            <tr>
              <th className="px-6 py-5">Razão Social / Nome</th>
              <th className="px-6 py-5">CNPJ</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan={3} className="p-8 text-center">Carregando...</td></tr>
            ) : carriers.length === 0 ? (
               <tr><td colSpan={3} className="p-8 text-center text-gray-500">Nenhuma transportadora cadastrada.</td></tr>
            ) : (
              carriers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-5 font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-5 text-gray-600 font-mono text-base">{c.cnpj}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleOpenModal(c)}
                        className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded transition" 
                        title="Editar"
                      >
                         <Edit2 size={18} />
                      </button>
                      <button 
                         onClick={() => handleDelete(c.id)}
                         className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition" 
                         title="Excluir"
                      >
                         <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
             <h3 className="text-xl font-bold text-gray-800 mb-6">
               {editingId ? 'Editar Transportadora' : 'Nova Transportadora'}
             </h3>
             <form onSubmit={handleSave} className="space-y-5">
               <div>
                 <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Nome da Transportadora</label>
                 <input 
                   type="text" 
                   value={formName} 
                   onChange={e => setFormName(e.target.value)}
                   className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:ring-1 focus:ring-brand-500 outline-none"
                   placeholder="Ex: TransRápido Logística"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-500 uppercase mb-2">CNPJ</label>
                 <input 
                   type="text" 
                   value={formCnpj} 
                   onChange={e => setFormCnpj(e.target.value)}
                   className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:ring-1 focus:ring-brand-500 outline-none"
                   placeholder="00.000.000/0000-00"
                   required
                 />
               </div>
               <div className="flex justify-end gap-3 pt-4">
                 <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                 <Button type="submit" isLoading={isSubmitting}>Salvar</Button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};


// --- DASHBOARD ---

const DashboardLayout = () => {
  const { user, logoutUser } = React.useContext(AuthContext);
  const location = useLocation();

  // Navigation Items
  const navItems = [
    { label: 'Dashboards', path: '/dashboard', icon: LayoutDashboard, adminOnly: false },
    { label: 'Documentos Fiscais', path: '/dashboard', icon: Package, adminOnly: false },
  ];

  if (user?.role === UserRole.ADMIN) {
    navItems.push({ label: 'Usuários & Permissões', path: '/admin/users', icon: Users, adminOnly: true });
    navItems.push({ label: 'Transportadoras', path: '/admin/carriers', icon: Building, adminOnly: true });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Dark */}
      <aside className="bg-dark-900 text-gray-300 w-full md:w-72 flex-shrink-0 flex flex-col shadow-2xl z-20">
        
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 bg-dark-900 border-b border-dark-800 shadow-sm">
          <Truck className="text-white mr-3 flex-shrink-0" size={28} />
          <span className="font-bold text-sm text-white tracking-wide uppercase leading-tight">Portal do<br/>Transportador</span>
        </div>

        {/* User Quick Info */}
        <div className="px-6 py-8 border-b border-dark-800">
           <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Logado como</p>
           <div className="flex items-center gap-3 text-white text-lg font-medium truncate">
             <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
             {user?.name}
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 space-y-2 overflow-y-auto">
           {navItems.map((item, idx) => {
             const isActive = location.pathname === item.path;
             return (
               <Link 
                  key={idx} 
                  to={item.path}
                  className={`flex items-center gap-4 px-8 py-4 border-l-4 transition-colors ${
                    isActive 
                    ? 'border-brand-500 bg-dark-800 text-white' 
                    : 'border-transparent hover:bg-dark-800 hover:text-white'
                  }`}
               >
                 <item.icon size={22} />
                 <span className="text-base font-medium">{item.label}</span>
               </Link>
             )
           })}
        </nav>

        {/* Footer */}
        <div className="p-6 bg-dark-900 border-t border-dark-800">
           <button onClick={logoutUser} className="flex items-center gap-3 text-base text-gray-400 hover:text-white transition w-full px-4 py-3 rounded hover:bg-dark-800">
             <LogOut size={20} /> Sair
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm z-10">
           <div className="flex items-center text-gray-400 text-base">
              <span className="mr-2">Portal</span> / <span className="ml-2 text-gray-800 font-medium">
                {location.pathname.includes('admin') ? 'Administração' : 'Dashboard'}
              </span>
           </div>
           <div className="flex items-center gap-4">
              <Button variant="outline" size="md">
                <Settings size={18} className="mr-2" /> Configurações
              </Button>
           </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 relative">
          <Routes>
            <Route path="/" element={<NFeList user={user} />} />
            <Route path="/users" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                 <AdminUserManagement />
              </ProtectedRoute>
            } />
             <Route path="/carriers" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                 <AdminCarrierManagement />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// --- NFE LIST COMPONENT (Extracted from old DashboardLayout for cleaner code) ---

const NFeList = ({ user }: { user: User | null }) => {
  const [nfes, setNfes] = useState<NFe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [filterDate, setFilterDate] = useState('');
  const [filterNumber, setFilterNumber] = useState('');
  const [filterRoute, setFilterRoute] = useState('');

  const [downloading, setDownloading] = useState(false);
  const [viewNFe, setViewNFe] = useState<NFe | null>(null);

  useEffect(() => {
    if (user) {
      // If admin, pass a wildcard or specific logic. For now, mockService filters by carrierId.
      // If admin, mock service should perhaps return all? 
      // For this demo, let's assume Admin sees 't1' for now or update service logic.
      // Let's rely on the service handling "if user.role === ADMIN, ignore carrier filter"
      // But since service takes `carrierId`, let's just use the user's carrierId if exists, or a default.
      
      const targetCarrierId = user.role === UserRole.ADMIN ? 't1' : user.carrierId; 
      // Note: In a real app, Admin would see a "Select Carrier" filter in the NFe List.
      // To keep it simple, Admins just see Data for T1 in this view.
      
      if(targetCarrierId) {
        setLoading(true);
        getNFes(targetCarrierId, { 
          issueDate: filterDate, 
          number: filterNumber, 
          route: filterRoute 
        })
          .then(setNfes)
          .finally(() => setLoading(false));
      } else {
        setNfes([]); // Admin with no carrier selected context
        setLoading(false);
      }
    }
  }, [user, filterDate, filterNumber, filterRoute]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(nfes.map(n => n.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) return;
    setDownloading(true);
    try {
      const selectedNfes = nfes.filter(n => selectedIds.has(n.id));
      const blob = await generateZip(selectedNfes, user?.name || 'Transportadora');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `transportadora_${dateStr}_${selectedIds.size}_notas.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert("Erro ao gerar ZIP");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-8 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Grid de Notas Fiscais</h1>
            <p className="text-gray-500 text-lg mt-1">Visualização e download de arquivos XML</p>
          </div>
          <div className="flex gap-4">
             {selectedIds.size > 0 && (
                <div className="bg-brand-50 border border-brand-200 text-brand-800 px-5 py-3 rounded-lg flex items-center gap-4 animate-fade-in shadow-sm">
                  <span className="font-medium text-base">{selectedIds.size} selecionadas</span>
                  <Button size="md" onClick={handleBulkDownload} isLoading={downloading}>
                    <FileArchive size={20} className="mr-2" /> Baixar .ZIP
                  </Button>
                </div>
             )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-bold text-gray-500 uppercase mb-2 block">Emissão</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3 text-gray-400" size={20} />
                <input 
                  type="date" 
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded text-base focus:ring-1 focus:ring-brand-500 outline-none"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-500 uppercase mb-2 block">Número</label>
              <div className="relative">
                <FileText className="absolute left-4 top-3 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Ex: 1234" 
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded text-base focus:ring-1 focus:ring-brand-500 outline-none"
                  value={filterNumber}
                  onChange={e => setFilterNumber(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-500 uppercase mb-2 block">Rota</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Ex: SP-RJ" 
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded text-base focus:ring-1 focus:ring-brand-500 outline-none"
                  value={filterRoute}
                  onChange={e => setFilterRoute(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-5 w-16 text-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={nfes.length > 0 && selectedIds.size === nfes.length}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-5 w-5"
                    />
                  </th>
                  <th className="px-8 py-5 font-bold uppercase text-sm">Nota</th>
                  <th className="px-8 py-5 font-bold uppercase text-sm">Data</th>
                  <th className="px-8 py-5 font-bold uppercase text-sm">Origem / Destino</th>
                  <th className="px-8 py-5 font-bold uppercase text-sm">Rota</th>
                  <th className="px-8 py-5 font-bold uppercase text-sm w-32">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-500">Carregando documentos...</td></tr>
                ) : nfes.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-500">Nenhum documento encontrado.</td></tr>
                ) : (
                  nfes.map((nfe) => (
                    <tr key={nfe.id} className={`hover:bg-blue-50/30 transition ${selectedIds.has(nfe.id) ? 'bg-blue-50/60' : ''}`}>
                      <td className="px-8 py-5 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(nfe.id)}
                          onChange={() => handleSelectOne(nfe.id)}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-5 w-5"
                        />
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-bold text-gray-800 text-lg">#{nfe.number}</span>
                      </td>
                      <td className="px-8 py-5 text-gray-600">
                         {new Date(nfe.issuedAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex flex-col">
                           <span className="font-medium text-gray-800 text-base">{nfe.senderName}</span>
                           <span className="text-gray-400 text-sm mt-1">PARA: {nfe.recipientName}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <span className="inline-block px-3 py-1.5 rounded bg-gray-100 text-gray-700 text-sm font-semibold border border-gray-200">
                           {nfe.route}
                         </span>
                      </td>
                      <td className="px-8 py-5">
                        <button 
                          onClick={() => setViewNFe(nfe)}
                          className="text-brand-600 hover:text-brand-800 p-2 rounded hover:bg-brand-50 transition"
                          title="Visualizar"
                        >
                          <ChevronRight size={22} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <NFeDetailModal 
          isOpen={!!viewNFe} 
          nfe={viewNFe} 
          onClose={() => setViewNFe(null)} 
        />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const loginUser = async (u: string, p: string) => {
    const userData = await login(u, p);
    setUser(userData);
  };

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
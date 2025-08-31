import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, AdminView, DashboardAnalytics, Template, ScriptData, ContentIntelligenceData, Quote, QuoteSettings } from '../types';
import { authService } from '../services/authService';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { useToast } from '../hooks/useToast';
import { TrashIcon } from './icons/TrashIcon';
import { BlockIcon } from './icons/BlockIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { EditIcon } from './icons/EditIcon';
import Modal from './ui/Modal';
import Textarea from './ui/Textarea';
import Checkbox from './ui/Checkbox';
import { templateService } from '../services/templateService';
import ContentIntelligenceTab from './ContentIntelligenceTab';
import { announcementService } from '../services/announcementService';
import { settingsService } from '../services/settingsService';
import { quoteService } from '../services/quoteService';
import EditQuoteModal from './EditQuoteModal';
import Select from './ui/Select';
import GeneratedUsersModal from './GeneratedUsersModal';
import SendMessageModal from './SendMessageModal';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { MessageSquareIcon } from './icons/MessageSquareIcon';
import UserEditModal from './UserEditModal';
import Spinner from './ui/Spinner';
import { UserPlusIcon } from './icons/UserPlusIcon';
import UserGenerationModal from './UserGenerationModal';

interface AdminDashboardViewProps {
    activeView: AdminView;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } }
};

const getMostFrequent = (arr: (string | undefined)[]): string => {
    const filteredArr = arr.filter((item): item is string => !!item);
    if (filteredArr.length === 0) return 'N/A';
    const counts = filteredArr.reduce((acc, value) => {
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

const DashboardTab: React.FC<{ data: DashboardAnalytics | null }> = ({ data }) => {
    if (!data) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4"><h4 className="text-sm text-text-secondary">Total Pengguna</h4><p className="text-3xl font-bold">{data.totalUsers}</p></Card>
                <Card className="p-4"><h4 className="text-sm text-text-secondary">Aktif Hari Ini</h4><p className="text-3xl font-bold">{data.activeUsersToday}</p></Card>
                <Card className="p-4"><h4 className="text-sm text-text-secondary">Total Skrip Dibuat</h4><p className="text-3xl font-bold">{data.scriptsGeneratedTotal}</p></Card>
                <Card className="p-4"><h4 className="text-sm text-text-secondary">Fitur Terpopuler</h4><p className="text-3xl font-bold">{data.mostPopularFeature}</p></Card>
            </div>
             <Card className="p-4">
                <h3 className="font-bold mb-2">Aktivitas Terbaru</h3>
                <ul className="space-y-2">
                    {data.recentActivity.map((act, i) => (
                        <li key={i} className="text-sm text-text-secondary border-b border-border pb-1 last:border-b-0">
                           <span className="font-semibold text-accent">{act.user}</span> {act.action} - <span className="text-xs">{new Date(act.timestamp).toLocaleTimeString()}</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </motion.div>
    );
};


const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ activeView }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [intelligenceData, setIntelligenceData] = useState<ContentIntelligenceData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isUserGenerationModalOpen, setIsUserGenerationModalOpen] = useState(false);
  const [generatedUsers, setGeneratedUsers] = useState<User[] | null>(null);
  const [messagingUser, setMessagingUser] = useState<User | null>(null);
  
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');

  const [quoteSettings, setQuoteSettings] = useState<QuoteSettings | null>(null);
  const [motivationalQuotes, setMotivationalQuotes] = useState<Quote[]>([]);
  const [toughLoveQuotes, setToughLoveQuotes] = useState<Quote[]>([]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<{ type: 'motivational' | 'tough-love', quote: Quote | null } | null>(null);
  const [selectedMotivational, setSelectedMotivational] = useState(new Set<string>());
  const [selectedToughLove, setSelectedToughLove] = useState(new Set<string>());


  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [allUsers, allTemplates, currentSettings, motQuotes, tlQuotes, currentAnnouncement] = await Promise.all([
        authService.getUsers(),
        templateService.getTemplates(),
        settingsService.getSettings(),
        quoteService.getMotivationalQuotes(),
        quoteService.getToughLoveQuotes(),
        announcementService.getAnnouncement()
    ]);

    setUsers(allUsers);
    setTemplates(allTemplates);
    setQuoteSettings(currentSettings);
    setMotivationalQuotes(motQuotes);
    setToughLoveQuotes(tlQuotes);
    if (currentAnnouncement) {
        setAnnouncementTitle(currentAnnouncement.title);
        setAnnouncementMessage(currentAnnouncement.message);
    }
    
    // Analytics (can be expanded with backend data)
    const activeToday = allUsers.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
    setAnalytics({
        totalUsers: allUsers.length,
        activeUsersToday: activeToday,
        scriptsGeneratedTotal: allUsers.reduce((sum, u) => sum + u.scriptsGenerated, 0),
        mostPopularFeature: 'Generator Script',
        featureUsage: [ { name: 'Generator Script', count: 150 }, { name: 'Link to Script', count: 89 }, { name: 'Hook Generator', count: 120 } ],
        recentActivity: [ { user: 'user_abc', action: 'generated a script', timestamp: new Date().toISOString() }, { user: 'user_def', action: 'saved a template', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() } ]
    });

    // Intelligence Data can be calculated on backend in the future
    setIntelligenceData({
        mostSuccessfulFormula: 'AIDA',
        mostSuccessfulHookType: 'Pain Point',
        mostSuccessfulTone: 'Friendly',
        nichePopularity: [{name: 'Beauty', count: 50}, {name: 'Gadget', count: 30}]
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // User Management Handlers
  const handleToggleBlock = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || user.role === 'admin') return;
    await authService.updateUser({ ...user, status: user.status === 'active' ? 'blocked' : 'active' });
    fetchData();
    addToast('Status pengguna diperbarui.');
  };

  const handleDelete = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'admin') {
        addToast('Admin tidak bisa dihapus.');
        return;
    }
    if (window.confirm('Anda yakin ingin menghapus pengguna ini?')) {
        // await authService.deleteUser(userId);
        addToast('Fungsi hapus pengguna memerlukan backend.');
        fetchData();
    }
  };

  const handleSaveUser = async (updatedUser: User) => {
      await authService.updateUser(updatedUser);
      fetchData();
      setEditingUser(null);
      addToast('Pengguna berhasil diperbarui.');
  };
  
  const handleUsersGenerated = async (newUsers: User[]) => {
    await authService.addUsers(newUsers);
    setGeneratedUsers(newUsers);
    fetchData(); // Refresh user list
  };
  
  const handleSendMessage = async (message: User['directMessage']) => {
    if (messagingUser) {
        await authService.updateUser({ ...messagingUser, directMessage: message });
        fetchData();
        setMessagingUser(null);
        addToast(`Pesan untuk ${messagingUser.username} berhasil diperbarui.`);
    }
  };

  const handleSaveAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
        addToast("Judul dan pesan pengumuman harus diisi.");
        return;
    }
    await announcementService.setAnnouncement(announcementTitle, announcementMessage);
    addToast("Pengumuman global berhasil diperbarui.");
  };

  const handleSaveQuoteSettings = async () => {
    if (!quoteSettings) return;
    await settingsService.saveSettings(quoteSettings);
    addToast("Pengaturan kutipan berhasil disimpan.");
  };

  const handleSaveQuote = async (type: 'motivational' | 'tough-love', quote: Quote) => {
    if (type === 'motivational') {
        await quoteService.saveMotivationalQuote(quote);
    } else {
        await quoteService.saveToughLoveQuote(quote);
    }
    fetchData();
    setEditingQuote(null);
    setIsQuoteModalOpen(false);
    addToast("Kutipan berhasil disimpan.");
  };
  
  const handleDeleteQuote = async (type: 'motivational' | 'tough-love', quoteId: string) => {
      if (window.confirm("Yakin ingin menghapus kutipan ini?")) {
          if (type === 'motivational') {
              await quoteService.deleteMotivationalQuote(quoteId);
          } else {
              await quoteService.deleteToughLoveQuote(quoteId);
          }
          fetchData();
          addToast("Kutipan berhasil dihapus.");
      }
  };


  const filteredUsers = useMemo(() => {
    return users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, searchTerm]);
  
  const viewTitles: Record<AdminView, string> = {
    dashboard: "Dashboard Analitik",
    intelligence: "Intelijen Konten",
    users: "Manajemen Pengguna",
    settings: "Pengaturan Aplikasi",
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg"/></div>
  }
  
  const SettingsTab: React.FC = () => {
    if (!quoteSettings) return <Spinner />;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card className="p-4">
                <h3 className="font-bold text-lg mb-2">Pengumuman Global</h3>
                <div className="space-y-4">
                    <Input label="Judul Pengumuman" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} />
                    <Textarea label="Isi Pesan" value={announcementMessage} onChange={e => setAnnouncementMessage(e.target.value)} />
                    <Button onClick={handleSaveAnnouncement}>Simpan & Umumkan</Button>
                </div>
            </Card>
            <Card className="p-4">
                <h3 className="font-bold text-lg mb-2">Pengaturan Kutipan</h3>
                <div className="space-y-4">
                    <Checkbox label="Aktifkan Kutipan Motivasi" checked={quoteSettings.motivationalEnabled} onChange={e => setQuoteSettings(s => s && {...s, motivationalEnabled: e.target.checked})} />
                    <Checkbox label="Aktifkan Kutipan 'Tough Love'" checked={quoteSettings.toughLoveEnabled} onChange={e => setQuoteSettings(s => s && {...s, toughLoveEnabled: e.target.checked})} />
                    <Input label="Ambang Batas 'Tough Love' (jumlah generate)" type="number" value={quoteSettings.toughLoveThreshold} onChange={e => setQuoteSettings(s => s && {...s, toughLoveThreshold: parseInt(e.target.value, 10)})} />
                    <Button onClick={handleSaveQuoteSettings}>Simpan Pengaturan Kutipan</Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">Kutipan Motivasi</h3>
                    <Button size="sm" onClick={() => { setEditingQuote({ type: 'motivational', quote: null }); setIsQuoteModalOpen(true); }}>Tambah</Button>
                  </div>
                  <ul className="max-h-60 overflow-y-auto space-y-2">
                      {motivationalQuotes.map(q => (
                          <li key={q.id} className="text-sm p-2 bg-secondary rounded flex justify-between items-start">
                              <span className="flex-1 italic">"{q.quote}"</span>
                              <div className="flex gap-1 ml-2">
                                  <button onClick={() => { setEditingQuote({ type: 'motivational', quote: q }); setIsQuoteModalOpen(true); }}><EditIcon className="w-4 h-4 text-text-secondary hover:text-accent"/></button>
                                  <button onClick={() => handleDeleteQuote('motivational', q.id)}><TrashIcon className="w-4 h-4 text-text-secondary hover:text-red-500"/></button>
                              </div>
                          </li>
                      ))}
                  </ul>
              </Card>
              <Card className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">Kutipan 'Tough Love'</h3>
                    <Button size="sm" onClick={() => { setEditingQuote({ type: 'tough-love', quote: null }); setIsQuoteModalOpen(true); }}>Tambah</Button>
                  </div>
                   <ul className="max-h-60 overflow-y-auto space-y-2">
                      {toughLoveQuotes.map(q => (
                          <li key={q.id} className="text-sm p-2 bg-secondary rounded flex justify-between items-start">
                              <span className="flex-1 italic">"{q.quote}"</span>
                              <div className="flex gap-1 ml-2">
                                  <button onClick={() => { setEditingQuote({ type: 'tough-love', quote: q }); setIsQuoteModalOpen(true); }}><EditIcon className="w-4 h-4 text-text-secondary hover:text-accent"/></button>
                                  <button onClick={() => handleDeleteQuote('tough-love', q.id)}><TrashIcon className="w-4 h-4 text-text-secondary hover:text-red-500"/></button>
                              </div>
                          </li>
                      ))}
                  </ul>
              </Card>
            </div>
        </motion.div>
    );
  };


  const renderContent = () => {
      switch (activeView) {
          case 'dashboard':
              return <DashboardTab data={analytics} />;
          case 'intelligence':
              return intelligenceData ? <ContentIntelligenceTab data={intelligenceData} /> : <Spinner />;
          case 'settings':
              return <SettingsTab />;
          case 'users':
              return (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1">
                      <div>
                        <Card className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                               <Input placeholder="Cari pengguna..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                               <Button onClick={() => setIsUserGenerationModalOpen(true)}><UserPlusIcon className="w-4 h-4 mr-2"/>Generate Pengguna</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-text-secondary">
                                    <thead className="text-xs text-text-primary uppercase bg-secondary">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Pengguna</th>
                                            <th scope="col" className="px-6 py-3">Perangkat (30hr)</th>
                                            <th scope="col" className="px-6 py-3">Status</th>
                                            <th scope="col" className="px-6 py-3">Kadaluwarsa</th>
                                            <th scope="col" className="px-6 py-3">Pesan</th>
                                            <th scope="col" className="px-6 py-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                      <AnimatePresence>
                                        {filteredUsers.map(user => (
                                            <motion.tr key={user.id} layout variants={itemVariants} initial="hidden" animate="visible" exit="exit" className="bg-card border-b border-border">
                                                <td className="px-6 py-4 font-medium text-text-primary flex items-center gap-2">
                                                    {user.username} {user.role === 'admin' && '(Admin)'}
                                                    {user.isSuspicious && <AlertTriangleIcon className="w-4 h-4 text-yellow-500" title="Akun ini terdeteksi aktivitas mencurigakan" />}
                                                </td>
                                                <td className={`px-6 py-4 font-semibold ${user.uniqueDeviceCountLast30Days > 3 ? 'text-red-500' : 'text-text-primary'}`}>{user.uniqueDeviceCountLast30Days}</td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{user.status}</span></td>
                                                <td className="px-6 py-4">
                                                    {user.expiresAt
                                                        ? new Date(user.expiresAt).toLocaleDateString()
                                                        : (user.durationDays ? `Aktif setelah login (${user.durationDays} hari)` : 'Seumur Hidup')
                                                    }
                                                </td>
                                                <td className="px-6 py-4">{user.directMessage ? <span className="text-blue-400">Aktif</span> : 'N/A'}</td>
                                                <td className="px-6 py-4 flex items-center gap-2">
                                                    <Button size="sm" variant="secondary" onClick={() => setMessagingUser(user)} disabled={user.role === 'admin'}><MessageSquareIcon className="w-4 h-4"/></Button>
                                                    <Button size="sm" variant="secondary" onClick={() => setEditingUser(user)} disabled={user.role === 'admin'}><EditIcon className="w-4 h-4"/></Button>
                                                    <Button size="sm" variant="secondary" onClick={() => handleToggleBlock(user.id)} disabled={user.role === 'admin'}><BlockIcon className="w-4 h-4" /></Button>
                                                    <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)} disabled={user.role === 'admin'}><TrashIcon className="w-4 h-4" /></Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                      </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                      </div>
                  </motion.div>
              );
            default:
                return <p>Dashboard section coming soon.</p>;
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-text-primary">{viewTitles[activeView]}</h2>
        <p className="text-text-secondary mt-1">Pusat komando untuk analitik, pengguna, dan pengaturan aplikasi.</p>
      </div>
      
      <div>{renderContent()}</div>

      {isUserGenerationModalOpen && <UserGenerationModal onClose={() => setIsUserGenerationModalOpen(false)} onGenerate={handleUsersGenerated} />}
      {generatedUsers && <GeneratedUsersModal users={generatedUsers} onClose={() => setGeneratedUsers(null)} />}

      {editingUser && <UserEditModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
      {messagingUser && <SendMessageModal user={messagingUser} onClose={() => setMessagingUser(null)} onSend={handleSendMessage} />}
      
      {isQuoteModalOpen && editingQuote && (
          <EditQuoteModal
              quoteData={editingQuote}
              onClose={() => setIsQuoteModalOpen(false)}
              onSave={handleSaveQuote}
          />
      )}
    </div>
  );
};

export default AdminDashboardView;
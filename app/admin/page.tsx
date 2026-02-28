'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { auth } from '@/lib/auth';
import { Registration } from '@/types';
import { formatWeekRange, formatDate, getNext10Weeks, getWeekNumber, getAllWeeksOfYear, getCurrentYear, getAvailableYears } from '@/lib/dates';
import { parseISO, format } from 'date-fns';
import { Trash2, Plus, Calendar, Users, Download, LogOut, Home, BarChart3, ChevronDown, ChevronRight, List, Layers, XCircle, MoreVertical } from 'lucide-react';
import AddParticipantModal from '@/components/AddParticipantModal';
import WeekManagementModal from '@/components/WeekManagementModal';

type SortField = 'firstName' | 'lastName' | 'email' | 'weekStart' | 'createdAt' | 'location';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'list' | 'grouped';

export default function AdminDashboard() {
  const router = useRouter();
  const { 
    registrations, 
    deleteRegistration,
    cancelRegistration,
    reactivateRegistration,
    loadFromStorage, 
    initializeWeeks,
    weekAvailability,
    getWeekRegistrations,
    toggleWeekAvailability
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<'participants' | 'weeks' | 'stats'>('participants');
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; id: string; name: string } | null>(null);
  const [cancelConfirmModal, setCancelConfirmModal] = useState<{ isOpen: boolean; id: string; name: string } | null>(null);
  const [toggleWeekModal, setToggleWeekModal] = useState<{ isOpen: boolean; weekKey: string; count: number } | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentYear());

  const allWeeksOfYear = useMemo(() => getAllWeeksOfYear(selectedYear), [selectedYear]);
  const availableYears = useMemo(() => getAvailableYears(), []);

  const toggleWeek = (weekKey: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekKey)) {
      newExpanded.delete(weekKey);
    } else {
      newExpanded.add(weekKey);
    }
    setExpandedWeeks(newExpanded);
  };

  const filteredAndSortedRegistrations = useMemo(() => {
    let filtered = registrations.filter(r => {
      const regYear = new Date(r.weekStart).getFullYear();
      return regYear === selectedYear;
    });

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(r => r.location === selectedLocation);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.firstName.toLowerCase().includes(query) ||
        r.lastName.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.phone.includes(query)
      );
    }

    filtered.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (sortField === 'weekStart' || sortField === 'createdAt') {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      } else {
        aVal = (aVal as string).toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [registrations, selectedLocation, searchQuery, sortField, sortOrder, selectedYear]);

  const weekGroups = useMemo(() => {
    const groups: { [key: string]: Registration[] } = {};

    filteredAndSortedRegistrations.forEach(reg => {
      if (!groups[reg.weekStart]) {
        groups[reg.weekStart] = [];
      }
      groups[reg.weekStart].push(reg);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  }, [filteredAndSortedRegistrations]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmModal({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    if (deleteConfirmModal) {
      deleteRegistration(deleteConfirmModal.id);
      setDeleteConfirmModal(null);
    }
  };

  const handleCancel = (id: string, name: string) => {
    setCancelConfirmModal({ isOpen: true, id, name });
  };

  const confirmCancel = () => {
    if (cancelConfirmModal) {
      cancelRegistration(cancelConfirmModal.id);
      setCancelConfirmModal(null);
    }
  };

  const handleReactivate = (id: string) => {
    reactivateRegistration(id);
    setActionMenuOpen(null);
  };

  const handleToggleWeek = (weekKey: string, count: number) => {
    if (count > 0) {
      setToggleWeekModal({ isOpen: true, weekKey, count });
    } else {
      toggleWeekAvailability(weekKey);
    }
  };

  const confirmToggleWeek = () => {
    if (toggleWeekModal) {
      toggleWeekAvailability(toggleWeekModal.weekKey);
      setToggleWeekModal(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Förnamn', 'Efternamn', 'E-post', 'Telefon', 'Plats', 'Vecka', 'Anmäld'];
    const rows = filteredAndSortedRegistrations.map(r => [
      r.firstName,
      r.lastName,
      r.email,
      r.phone,
      r.location === 'sodermalm' ? 'Södermalm' : 'Gärdet',
      `Vecka ${getWeekNumber(parseISO(r.weekStart))}`,
      format(parseISO(r.createdAt), 'yyyy-MM-dd HH:mm')
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anmalningar-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const totalStats = {
    total: registrations.length,
    sodermalm: registrations.filter(r => r.location === 'sodermalm').length,
    gardet: registrations.filter(r => r.location === 'gardet').length,
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    if (!auth.isAuthenticated()) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      setCurrentUser(auth.getCurrentUser());
      loadFromStorage();
      initializeWeeks();
    }
  }, [isMounted, router, loadFromStorage, initializeWeeks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.action-menu')) {
        setActionMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    auth.logout();
    router.push('/admin/login');
  };

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F3EA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-teal mx-auto"></div>
          <p className="mt-4 text-neutral-600">Laddar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EA] flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-300 flex flex-col">
        <div className="p-6 border-b border-neutral-300">
          <img 
            src="/logo.svg" 
            alt="Eudora Logo" 
            className="h-10 w-auto"
          />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveView('participants')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
              activeView === 'participants'
                ? 'bg-primary-teal text-white'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Deltagare</span>
            <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-semibold ${
              activeView === 'participants' 
                ? 'bg-white/20 text-white' 
                : 'bg-neutral-200 text-neutral-700'
            }`}>
              {registrations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveView('weeks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
              activeView === 'weeks'
                ? 'bg-primary-teal text-white'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Veckor</span>
          </button>

          <button
            onClick={() => setActiveView('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
              activeView === 'stats'
                ? 'bg-primary-teal text-white'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Statistik</span>
          </button>

          <div className="pt-4 mt-4 border-t border-neutral-300">
            <a
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-all font-medium"
            >
              <Home className="w-5 h-5" />
              <span>Startsida</span>
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-neutral-300">
          <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-lg mb-2 border border-neutral-300">
            <img 
              src={
                currentUser?.email === 'suki.ogunkanmi@eudoraforskola.se'
                  ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suki&skinColor=brown&backgroundColor=b6e3f4&radius=50'
                  : currentUser?.email === 'mary.carlsson@eudoraforskola.se'
                  ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mary&skinColor=light&backgroundColor=c0aede&radius=50'
                  : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=d1d4f9&radius=50'
              }
              alt="Admin Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900">{currentUser?.name || 'Admin'}</p>
              <p className="text-xs text-neutral-500 truncate">{currentUser?.email || 'admin@eudora.se'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logga ut</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F5F3EA]">
        {/* Participants View */}
        {activeView === 'participants' && (
          <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Deltagare {selectedYear}</h2>
                <p className="text-neutral-600">{filteredAndSortedRegistrations.length} registreringar</p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-white border border-neutral-300 rounded-lg p-1">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-4 py-2 rounded-md font-medium transition-all ${
                        selectedYear === year
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all font-medium flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Lägg till
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-5 py-2.5 bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-all font-medium flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exportera
                </button>
              </div>
            </div>

            {/* Filters & View Toggle */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Sök efter namn, e-post eller telefon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 bg-white border border-neutral-300 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedLocation('all')}
                  className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                    selectedLocation === 'all'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Alla
                </button>
                <button
                  onClick={() => setSelectedLocation('sodermalm')}
                  className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                    selectedLocation === 'sodermalm'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Södermalm
                </button>
                <button
                  onClick={() => setSelectedLocation('gardet')}
                  className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                    selectedLocation === 'gardet'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Gärdet
                </button>
              </div>
              <div className="flex gap-2 bg-white border border-neutral-300 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md font-medium transition-all text-sm flex items-center gap-2 ${
                    viewMode === 'list'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('grouped')}
                  className={`px-4 py-2 rounded-md font-medium transition-all text-sm flex items-center gap-2 ${
                    viewMode === 'grouped'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Grupperad
                </button>
              </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white border border-neutral-200 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                        #
                      </th>
                      <th 
                        onClick={() => handleSort('createdAt')}
                        className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                      >
                        Anmäld {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('firstName')}
                        className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                      >
                        Namn {sortField === 'firstName' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('email')}
                        className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                      >
                        Kontakt {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('location')}
                        className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                      >
                        Plats {sortField === 'location' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('weekStart')}
                        className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                      >
                        Vecka {sortField === 'weekStart' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredAndSortedRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                          Inga deltagare hittades
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedRegistrations.map((registration, index) => (
                        <tr key={registration.id} className="hover:bg-neutral-50 transition-colors relative">
                          <td className="px-6 py-4 text-sm text-neutral-500">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-neutral-900">
                              {format(parseISO(registration.createdAt), 'M/d/yyyy')}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {format(parseISO(registration.createdAt), 'h:mma')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`font-medium ${registration.status === 'cancelled' ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                                {registration.firstName} {registration.lastName}
                              </div>
                              {registration.status === 'cancelled' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600">
                                  Avregistrerad
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-neutral-900">{registration.email}</div>
                            <div className="text-xs text-neutral-500">{registration.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              registration.location === 'sodermalm'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {registration.location === 'sodermalm' ? 'Eudora Södermalm' : 'Eudora Gärdet'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                              Vecka {getWeekNumber(parseISO(registration.weekStart))}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right relative">
                            <div className="relative inline-block action-menu">
                              <button
                                onClick={() => setActionMenuOpen(actionMenuOpen === registration.id ? null : registration.id)}
                                className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                              {actionMenuOpen === registration.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-50">
                                  {registration.status === 'cancelled' ? (
                                    <>
                                      <button
                                        onClick={() => handleReactivate(registration.id)}
                                        className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 rounded-t-lg"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        Återaktivera
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDelete(registration.id, `${registration.firstName} ${registration.lastName}`);
                                          setActionMenuOpen(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Ta bort permanent
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          handleCancel(registration.id, `${registration.firstName} ${registration.lastName}`);
                                          setActionMenuOpen(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 rounded-t-lg"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        Avregistrera
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDelete(registration.id, `${registration.firstName} ${registration.lastName}`);
                                          setActionMenuOpen(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Ta bort permanent
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Grouped View */}
            {viewMode === 'grouped' && (
              <div className="space-y-2">
                {weekGroups.map(([weekKey, weekRegistrations]) => {
                  const isExpanded = expandedWeeks.has(weekKey);
                  const weekNum = getWeekNumber(parseISO(weekKey));
                  const weekRange = formatWeekRange(parseISO(weekKey));
                  const sodermalm = weekRegistrations.filter(r => r.location === 'sodermalm').length;
                  const gardet = weekRegistrations.filter(r => r.location === 'gardet').length;

                  return (
                    <div key={weekKey} className="bg-white border border-neutral-200 rounded-lg overflow-visible">
                      <button
                        onClick={() => toggleWeek(weekKey)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-neutral-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-neutral-400" />
                          )}
                          <div className="text-left">
                            <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                              Week Number
                            </div>
                            <div className="text-lg font-bold text-neutral-900">
                              Vecka {weekNum}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-sm text-neutral-500">{weekRange}</div>
                          <div className="flex items-center gap-3">
                            {sodermalm > 0 && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Eudora Södermalm
                              </span>
                            )}
                            {gardet > 0 && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Eudora Gärdet
                              </span>
                            )}
                          </div>
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {weekRegistrations.length} Registered
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-neutral-200 overflow-visible">
                          <div className="overflow-visible">
                            <table className="w-full">
                              <tbody className="divide-y divide-neutral-200">
                              {weekRegistrations.map((registration, index) => (
                                <tr key={registration.id} className="hover:bg-neutral-50 relative">
                                  <td className="px-6 py-4 text-sm text-neutral-500 w-16">
                                    {index + 1}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-neutral-900">
                                    {format(parseISO(registration.createdAt), 'M/d/yyyy')}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-neutral-500">
                                    {format(parseISO(registration.createdAt), 'h:mma')}
                                  </td>
                                  <td className="px-6 py-4 text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                      <span className={registration.status === 'cancelled' ? 'text-neutral-400 line-through' : 'text-neutral-900'}>
                                        {registration.firstName}
                                      </span>
                                      {registration.status === 'cancelled' && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600">
                                          Avregistrerad
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className={`px-6 py-4 text-sm font-medium ${registration.status === 'cancelled' ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                                    {registration.lastName}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-neutral-600">
                                    {registration.email}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-neutral-600">
                                    {registration.phone}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                      registration.location === 'sodermalm'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-purple-100 text-purple-800'
                                    }`}>
                                      {registration.location === 'sodermalm' ? 'Eudora Södermalm' : 'Eudora Gärdet'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                                      Vecka {weekNum}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Registered
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right relative">
                                    <div className="relative inline-block action-menu">
                                      <button
                                        onClick={() => setActionMenuOpen(actionMenuOpen === registration.id ? null : registration.id)}
                                        className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
                                      >
                                        <MoreVertical className="w-5 h-5" />
                                      </button>
                                      {actionMenuOpen === registration.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-50">
                                          {registration.status === 'cancelled' ? (
                                            <>
                                              <button
                                                onClick={() => handleReactivate(registration.id)}
                                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 rounded-t-lg"
                                              >
                                                <XCircle className="w-4 h-4" />
                                                Återaktivera
                                              </button>
                                              <button
                                                onClick={() => {
                                                  handleDelete(registration.id, `${registration.firstName} ${registration.lastName}`);
                                                  setActionMenuOpen(null);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                                Ta bort permanent
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <button
                                                onClick={() => {
                                                  handleCancel(registration.id, `${registration.firstName} ${registration.lastName}`);
                                                  setActionMenuOpen(null);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 rounded-t-lg"
                                              >
                                                <XCircle className="w-4 h-4" />
                                                Avregistrera
                                              </button>
                                              <button
                                                onClick={() => {
                                                  handleDelete(registration.id, `${registration.firstName} ${registration.lastName}`);
                                                  setActionMenuOpen(null);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                                Ta bort permanent
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Weeks View */}
        {activeView === 'weeks' && (
          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Veckohantering {selectedYear}</h2>
                <p className="text-neutral-600">Hantera tillgänglighet för veckor</p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-neutral-300 rounded-lg p-1">
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      selectedYear === year
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg overflow-visible">
              <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Vecka</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Datum</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Södermalm</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Gärdet</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Totalt</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Öppen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {allWeeksOfYear.map((week) => {
                      const weekKey = formatDate(week);
                      const sodermalm = getWeekRegistrations(weekKey, 'sodermalm');
                      const gardet = getWeekRegistrations(weekKey, 'gardet');
                      const total = sodermalm.length + gardet.length;
                      const isAvailable = weekAvailability[weekKey]?.isAvailable !== false;
                      const weekNum = getWeekNumber(week);
                      const isPastWeek = new Date(weekKey) < new Date();
                      
                      return (
                        <tr 
                          key={weekKey} 
                          className={`hover:bg-neutral-50 transition-colors ${isPastWeek ? 'opacity-50' : ''}`}
                        >
                          <td className="px-6 py-4 font-medium text-neutral-900">
                            Vecka {weekNum}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {formatWeekRange(week)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {sodermalm.length > 0 ? (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                sodermalm.length >= 15 ? 'bg-red-100 text-red-800' : 
                                sodermalm.length >= 12 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {sodermalm.length}/15
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-sm">0/15</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {gardet.length > 0 ? (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                gardet.length >= 15 ? 'bg-red-100 text-red-800' : 
                                gardet.length >= 12 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {gardet.length}/15
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-sm">0/15</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {total > 0 ? (
                              <span className="font-semibold text-neutral-900">{total}</span>
                            ) : (
                              <span className="text-neutral-400">0</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggleWeek(weekKey, total)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                isAvailable ? 'bg-green-500' : 'bg-neutral-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Stats View */}
        {activeView === 'stats' && (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">Statistik</h2>
              <p className="text-neutral-600">Översikt över anmälningar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-neutral-200 rounded-lg p-8">
                <div className="text-sm text-neutral-500 mb-2">Totalt antal anmälningar</div>
                <div className="text-5xl font-bold text-neutral-900 mb-2">{totalStats.total}</div>
                <div className="text-sm text-neutral-600">Alla platser och veckor</div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-8">
                <div className="text-sm text-neutral-500 mb-2">Södermalm</div>
                <div className="text-5xl font-bold text-neutral-900 mb-2">{totalStats.sodermalm}</div>
                <div className="text-sm text-neutral-600">Torsdagar 10:00-11:00</div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-8">
                <div className="text-sm text-neutral-500 mb-2">Gärdet</div>
                <div className="text-5xl font-bold text-neutral-900 mb-2">{totalStats.gardet}</div>
                <div className="text-sm text-neutral-600">Tisdagar 13:00-14:00</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddModal && <AddParticipantModal onClose={() => setShowAddModal(false)} />}
      {showWeekModal && <WeekManagementModal onClose={() => setShowWeekModal(false)} />}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Ta bort deltagare permanent</h3>
            <p className="text-neutral-600 mb-6">
              Är du säker på att du vill ta bort <strong>{deleteConfirmModal.name}</strong> permanent? 
              Detta kan inte ångras.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all"
              >
                Avbryt
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all"
              >
                Ta bort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Avregistrera deltagare</h3>
            <p className="text-neutral-600 mb-6">
              Är du säker på att du vill avregistrera <strong>{cancelConfirmModal.name}</strong>? 
              De kommer inte längre räknas som aktiva deltagare.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancelConfirmModal(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all"
              >
                Avbryt
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-all"
              >
                Avregistrera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Week Confirmation Modal */}
      {toggleWeekModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Ändra veckostatus</h3>
            <p className="text-neutral-600 mb-6">
              Det finns <strong>{toggleWeekModal.count} anmälningar</strong> för denna vecka. 
              Är du säker på att du vill ändra statusen?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setToggleWeekModal(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all"
              >
                Avbryt
              </button>
              <button
                onClick={confirmToggleWeek}
                className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-all"
              >
                Fortsätt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { auth } from '@/lib/auth';
import { Registration } from '@/types';
import {
  formatWeekRange,
  formatDate,
  formatRegistrationDate,
  formatRegistrationTime,
  getNext10Weeks,
  getWeekNumber,
  getAllWeeksOfYear,
  getCurrentYear,
  getAvailableYears,
} from '@/lib/dates';
import { parseISO, format } from 'date-fns';
import { Plus, Calendar, Users, Download, LogOut, Home, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import AddParticipantModal from '@/components/AddParticipantModal';
import WeekManagementModal from '@/components/WeekManagementModal';
import { RegistrationActionsMenu } from '@/components/admin/RegistrationActionsMenu';
import { Badge, Button, ConfirmModal, Input, Select } from '@/components/ui';
import { formatSessionLabel, LOCATIONS, TIME_SLOTS, MAX_CAPACITY_PER_SESSION } from '@/lib/schedule';

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
    loadFromDatabase, 
    initializeWeeks,
    weekAvailability,
    getWeekRegistrations,
    toggleWeekAvailability,
    importRegistrations
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

  const hasActiveFilters =
    searchQuery.length > 0 || selectedLocation !== 'all' || viewMode !== 'list';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocation('all');
    setViewMode('list');
  };

  const yearOptions = availableYears.map((year) => ({
    value: String(year),
    label: String(year),
  }));

  const locationOptions = [
    { value: 'all', label: 'Alla platser' },
    { value: 'sodermalm', label: 'Södermalm' },
    { value: 'gardet', label: 'Gärdet' },
  ];

  const viewModeOptions = [
    { value: 'list', label: 'Lista' },
    { value: 'grouped', label: 'Grupperad per vecka' },
  ];

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

  const handleImportData = async () => {
    try {
      const response = await fetch('/import-data.json');
      const data = await response.json();
      importRegistrations(data);
      alert(`Successfully imported ${data.length} registrations!`);
      window.location.reload();
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import data. Check console for details.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Förnamn', 'Efternamn', 'E-post', 'Telefon', 'Pass', 'Vecka', 'Anmäld'];
    const rows = filteredAndSortedRegistrations.map(r => [
      r.firstName,
      r.lastName,
      r.email,
      r.phone,
      formatSessionLabel(r.location, r.timeSlot || 'morning'),
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
      loadFromDatabase();
      initializeWeeks();
    }
  }, [isMounted, router, loadFromDatabase, initializeWeeks]);

  const handleLogout = () => {
    auth.logout();
    router.push('/admin/login');
  };

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-teal" />
          <p className="mt-4 text-muted">Laddar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg flex flex-col lg:flex-row overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-full lg:w-64 bg-surface border-b lg:border-b-0 lg:border-r border-ink/10 flex flex-col lg:h-screen">
        <div className="p-6 border-b border-ink/10">
          <img 
            src="/logo.svg" 
            alt="Eudora Logo" 
            className="h-10 w-auto"
          />
        </div>

        <nav className="flex lg:flex-col flex-row lg:flex-1 p-2 lg:p-4 space-x-1 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-x-visible">
          <button
            onClick={() => setActiveView('participants')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-all font-medium ${
              activeView === 'participants'
                ? 'bg-teal text-white'
                : 'text-muted hover:bg-bg-sage hover:text-ink'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Deltagare</span>
            <span className={`ml-auto px-2.5 py-1 text-sm font-semibold ${
              activeView === 'participants' 
                ? 'bg-surface/20 text-white' 
                : 'bg-bg-sage text-ink'
            }`}>
              {registrations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveView('weeks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-all font-medium ${
              activeView === 'weeks'
                ? 'bg-teal text-white'
                : 'text-muted hover:bg-bg-sage hover:text-ink'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Veckor</span>
          </button>

          <button
            onClick={() => setActiveView('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-all font-medium ${
              activeView === 'stats'
                ? 'bg-teal text-white'
                : 'text-muted hover:bg-bg-sage hover:text-ink'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Statistik</span>
          </button>

          <div className="pt-4 mt-4 border-t border-ink/10">
            <a
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-muted hover:bg-bg-sage hover:text-ink transition-all font-medium"
            >
              <Home className="w-5 h-5" />
              <span>Startsida</span>
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-ink/10">
          <div className="flex items-center gap-3 px-4 py-3 bg-bg-sage rounded-none mb-2 border border-ink/10">
            <img 
              src={
                currentUser?.email === 'suki.ogunkanmi@eudoraforskola.se'
                  ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=Suki&backgroundColor=b6e3f4'
                  : currentUser?.email === 'mary.carlsson@eudoraforskola.se'
                  ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=Mary&backgroundColor=c0aede'
                  : 'https://api.dicebear.com/9.x/avataaars/svg?seed=Admin&backgroundColor=d1d4f9'
              }
              alt="Admin Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-ink">{currentUser?.name || 'Admin'}</p>
              <p className="text-sm text-muted truncate">{currentUser?.email || 'admin@eudora.se'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logga ut</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-bg">
        {/* Participants View */}
        {activeView === 'participants' && (
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-ink mb-2">Deltagare {selectedYear}</h2>
                <p className="text-muted">{filteredAndSortedRegistrations.length} registreringar</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 bg-teal text-white rounded-none hover:opacity-90 transition-all font-medium flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Lägg till
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-5 py-2.5 bg-surface border border-ink/10 text-ink rounded-none hover:bg-bg-sage transition-all font-medium flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exportera
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="mb-6 sticky top-0 z-20 bg-bg pb-4 border-b border-ink/10">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                  <Input
                    type="text"
                    placeholder="Sök namn, e-post eller telefon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-ink/10 focus:border-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:items-center lg:gap-3">
                  <Select
                    compact
                    className="w-full lg:w-28"
                    value={String(selectedYear)}
                    options={yearOptions}
                    onChange={(value) => setSelectedYear(Number(value))}
                  />
                  <Select
                    compact
                    className="w-full lg:w-40"
                    value={selectedLocation}
                    options={locationOptions}
                    onChange={setSelectedLocation}
                  />
                  <Select
                    compact
                    className="w-full sm:col-span-2 lg:col-span-1 lg:w-44"
                    value={viewMode}
                    options={viewModeOptions}
                    onChange={(value) => setViewMode(value as ViewMode)}
                  />
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="col-span-2 normal-case lg:col-span-1"
                      onClick={clearFilters}
                    >
                      Rensa filter
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-surface border border-ink/10 rounded-none">
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead className="bg-bg-sage border-b border-ink/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                        #
                      </th>
                      <th 
                        onClick={() => handleSort('createdAt')}
                        className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider cursor-pointer hover:bg-bg-sage"
                      >
                        Anmäld {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('firstName')}
                        className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider cursor-pointer hover:bg-bg-sage"
                      >
                        Namn {sortField === 'firstName' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('email')}
                        className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider cursor-pointer hover:bg-bg-sage"
                      >
                        Kontakt {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('location')}
                        className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider cursor-pointer hover:bg-bg-sage"
                      >
                        Plats {sortField === 'location' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('weekStart')}
                        className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider cursor-pointer hover:bg-bg-sage"
                      >
                        Vecka {sortField === 'weekStart' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {filteredAndSortedRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-muted">
                          Inga deltagare hittades
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedRegistrations.map((registration, index) => (
                        <tr key={registration.id} className="hover:bg-bg-sage transition-colors relative">
                          <td className="px-6 py-4 text-base text-muted">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-base text-ink">
                              {formatRegistrationDate(registration.createdAt)}
                            </div>
                            <div className="text-sm text-muted">
                              {formatRegistrationTime(registration.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`font-medium ${registration.status === 'cancelled' ? 'text-muted line-through' : 'text-ink'}`}>
                                {registration.firstName} {registration.lastName}
                              </div>
                              {registration.status === 'cancelled' && (
                                <Badge variant="muted" size="sm">
                                  Avregistrerad
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-base text-ink">{registration.email}</div>
                            <div className="text-sm text-muted">{registration.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="session" size="sm">
                              {formatSessionLabel(registration.location, registration.timeSlot || 'morning')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="week" size="sm">
                              Vecka {getWeekNumber(parseISO(registration.weekStart))}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <RegistrationActionsMenu
                              registrationId={registration.id}
                              isOpen={actionMenuOpen === registration.id}
                              isCancelled={registration.status === 'cancelled'}
                              onToggle={() =>
                                setActionMenuOpen(actionMenuOpen === registration.id ? null : registration.id)
                              }
                              onClose={() => setActionMenuOpen(null)}
                              onCancel={() =>
                                handleCancel(registration.id, `${registration.firstName} ${registration.lastName}`)
                              }
                              onReactivate={() => handleReactivate(registration.id)}
                              onDelete={() =>
                                handleDelete(registration.id, `${registration.firstName} ${registration.lastName}`)
                              }
                            />
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
                    <div key={weekKey} className="bg-surface border border-ink/10 rounded-none overflow-visible">
                      <button
                        onClick={() => toggleWeek(weekKey)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-bg-sage transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-neutral-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-neutral-400" />
                          )}
                          <div className="text-left">
                            <div className="text-xs text-muted uppercase tracking-wider font-medium">
                              Veckonummer
                            </div>
                            <div className="text-lg font-bold text-ink">
                              Vecka {weekNum}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-base text-muted">{weekRange}</div>
                          <div className="flex items-center gap-3">
                            {sodermalm > 0 && (
                              <Badge variant="session" size="sm">
                                Eudora Södermalm
                              </Badge>
                            )}
                            {gardet > 0 && (
                              <Badge variant="session" size="sm">
                                Eudora Gärdet
                              </Badge>
                            )}
                          </div>
                          <Badge variant="count" size="sm">
                            {weekRegistrations.length} anmälda
                          </Badge>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-ink/10 overflow-visible">
                          <div className="overflow-visible">
                            <table className="w-full">
                              <tbody className="divide-y divide-ink/10">
                              {weekRegistrations.map((registration, index) => (
                                <tr key={registration.id} className="hover:bg-bg-sage relative">
                                  <td className="px-6 py-4 text-base text-muted w-16">
                                    {index + 1}
                                  </td>
                                  <td className="px-6 py-4 text-base text-ink">
                                    {formatRegistrationDate(registration.createdAt)}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-muted">
                                    {formatRegistrationTime(registration.createdAt)}
                                  </td>
                                  <td className="px-6 py-4 text-base font-medium">
                                    <div className="flex items-center gap-2">
                                      <span className={registration.status === 'cancelled' ? 'text-muted line-through' : 'text-ink'}>
                                        {registration.firstName}
                                      </span>
                                      {registration.status === 'cancelled' && (
                                        <Badge variant="muted" size="sm">
                                          Avregistrerad
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                  <td className={`px-6 py-4 text-base font-medium ${registration.status === 'cancelled' ? 'text-muted line-through' : 'text-ink'}`}>
                                    {registration.lastName}
                                  </td>
                                  <td className="px-6 py-4 text-base text-muted">
                                    {registration.email}
                                  </td>
                                  <td className="px-6 py-4 text-base text-muted">
                                    {registration.phone}
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge variant="session" size="sm">
                                      {formatSessionLabel(registration.location, registration.timeSlot || 'morning')}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge variant="week" size="sm">
                                      Vecka {weekNum}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge variant="count" size="sm">
                                      Anmäld
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <RegistrationActionsMenu
                                      registrationId={registration.id}
                                      isOpen={actionMenuOpen === registration.id}
                                      isCancelled={registration.status === 'cancelled'}
                                      onToggle={() =>
                                        setActionMenuOpen(actionMenuOpen === registration.id ? null : registration.id)
                                      }
                                      onClose={() => setActionMenuOpen(null)}
                                      onCancel={() =>
                                        handleCancel(registration.id, `${registration.firstName} ${registration.lastName}`)
                                      }
                                      onReactivate={() => handleReactivate(registration.id)}
                                      onDelete={() =>
                                        handleDelete(registration.id, `${registration.firstName} ${registration.lastName}`)
                                      }
                                    />
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
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-ink mb-2">Veckohantering {selectedYear}</h2>
                <p className="text-muted">Hantera tillgänglighet för veckor</p>
              </div>
              <Select
                compact
                className="w-full sm:w-28"
                value={String(selectedYear)}
                options={yearOptions}
                onChange={(value) => setSelectedYear(Number(value))}
              />
            </div>

            <div className="bg-surface border border-ink/10 rounded-none overflow-visible">
              <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-bg-sage border-b border-ink/10 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Vecka</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Datum</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Södermalm</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Gärdet</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Totalt</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Öppen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {allWeeksOfYear.map((week) => {
                      const weekKey = formatDate(week);
                      const sodMorning = getWeekRegistrations(weekKey, 'sodermalm', 'morning').length;
                      const sodAfternoon = getWeekRegistrations(weekKey, 'sodermalm', 'afternoon').length;
                      const gardMorning = getWeekRegistrations(weekKey, 'gardet', 'morning').length;
                      const gardAfternoon = getWeekRegistrations(weekKey, 'gardet', 'afternoon').length;
                      const sodermalm = sodMorning + sodAfternoon;
                      const gardet = gardMorning + gardAfternoon;
                      const total = sodermalm + gardet;
                      const isAvailable = weekAvailability[weekKey]?.isAvailable !== false;
                      const weekNum = getWeekNumber(week);
                      const isPastWeek = new Date(weekKey) < new Date();
                      
                      return (
                        <tr 
                          key={weekKey} 
                          className={`hover:bg-bg-sage transition-colors ${isPastWeek ? 'opacity-50' : ''}`}
                        >
                          <td className="px-6 py-4 font-medium text-ink">
                            Vecka {weekNum}
                          </td>
                          <td className="px-6 py-4 text-base text-muted">
                            {formatWeekRange(week)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-1 text-base">
                              <span className={sodMorning >= MAX_CAPACITY_PER_SESSION ? 'text-red-700 font-medium' : 'text-ink'}>
                                {TIME_SLOTS.morning.time}: {sodMorning}/{MAX_CAPACITY_PER_SESSION}
                              </span>
                              <span className={sodAfternoon >= MAX_CAPACITY_PER_SESSION ? 'text-red-700 font-medium' : 'text-ink'}>
                                {TIME_SLOTS.afternoon.time}: {sodAfternoon}/{MAX_CAPACITY_PER_SESSION}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-1 text-base">
                              <span className={gardMorning >= MAX_CAPACITY_PER_SESSION ? 'text-red-700 font-medium' : 'text-ink'}>
                                {TIME_SLOTS.morning.time}: {gardMorning}/{MAX_CAPACITY_PER_SESSION}
                              </span>
                              <span className={gardAfternoon >= MAX_CAPACITY_PER_SESSION ? 'text-red-700 font-medium' : 'text-ink'}>
                                {TIME_SLOTS.afternoon.time}: {gardAfternoon}/{MAX_CAPACITY_PER_SESSION}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {total > 0 ? (
                              <span className="font-semibold text-ink">{total}</span>
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
                                className={`inline-block h-4 w-4 transform rounded-full bg-surface shadow transition-transform ${
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
              <h2 className="text-3xl font-bold text-ink mb-2">Statistik</h2>
              <p className="text-muted">Översikt över anmälningar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface border border-ink/10 rounded-none p-8">
                <div className="text-base text-muted mb-2">Totalt antal anmälningar</div>
                <div className="text-5xl font-bold text-ink mb-2">{totalStats.total}</div>
                <div className="text-base text-muted">Alla platser och veckor</div>
              </div>

              <div className="bg-surface border border-ink/10 rounded-none p-8">
                <div className="text-base text-muted mb-2">Södermalm</div>
                <div className="text-5xl font-bold text-ink mb-2">{totalStats.sodermalm}</div>
                <div className="text-base text-muted">{LOCATIONS.sodermalm.day} {TIME_SLOTS.morning.time} & {TIME_SLOTS.afternoon.time}</div>
              </div>

              <div className="bg-surface border border-ink/10 rounded-none p-8">
                <div className="text-base text-muted mb-2">Gärdet</div>
                <div className="text-5xl font-bold text-ink mb-2">{totalStats.gardet}</div>
                <div className="text-base text-muted">{LOCATIONS.gardet.day} {TIME_SLOTS.morning.time} & {TIME_SLOTS.afternoon.time}</div>
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
        <ConfirmModal
          title="Ta bort deltagare permanent"
          message={
            <>
              Är du säker på att du vill ta bort <strong>{deleteConfirmModal.name}</strong> permanent?
              Detta kan inte ångras.
            </>
          }
          confirmLabel="Ta bort"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmModal(null)}
          variant="danger"
        />
      )}

      {cancelConfirmModal && (
        <ConfirmModal
          title="Avregistrera deltagare"
          message={
            <>
              Är du säker på att du vill avregistrera <strong>{cancelConfirmModal.name}</strong>?
              De kommer inte längre räknas som aktiva deltagare.
            </>
          }
          confirmLabel="Avregistrera"
          onConfirm={confirmCancel}
          onCancel={() => setCancelConfirmModal(null)}
        />
      )}

      {toggleWeekModal && (
        <ConfirmModal
          title="Ändra veckostatus"
          message={
            <>
              Det finns <strong>{toggleWeekModal.count} anmälningar</strong> för denna vecka.
              Är du säker på att du vill ändra statusen?
            </>
          }
          confirmLabel="Fortsätt"
          onConfirm={confirmToggleWeek}
          onCancel={() => setToggleWeekModal(null)}
        />
      )}
    </div>
  );
}

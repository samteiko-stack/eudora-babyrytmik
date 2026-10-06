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
import { Badge, Button, Card, ConfirmModal, EmptyState, Input, NavItem, PageHeader, Select, StatCard, Switch } from '@/components/ui';
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
    <div className="flex min-h-screen flex-col bg-bg lg:h-screen lg:flex-row lg:overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-full shrink-0 border-b border-ink/10 bg-surface lg:flex lg:h-screen lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between border-b border-ink/10 p-4 lg:p-6">
          <img 
            src="/logo.svg" 
            alt="Eudora Logo" 
            className="h-8 w-auto lg:h-10"
          />
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center text-error lg:hidden"
            aria-label="Logga ut"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <nav className="grid grid-cols-4 gap-1 p-2 lg:flex lg:flex-1 lg:flex-col lg:p-4">
          <NavItem
            onClick={() => setActiveView('participants')}
            active={activeView === 'participants'}
            icon={<Users className="h-5 w-5" />}
            count={registrations.length}
          >
            Deltagare
          </NavItem>

          <NavItem
            onClick={() => setActiveView('weeks')}
            active={activeView === 'weeks'}
            icon={<Calendar className="h-5 w-5" />}
          >
            Veckor
          </NavItem>

          <NavItem
            onClick={() => setActiveView('stats')}
            active={activeView === 'stats'}
            icon={<BarChart3 className="h-5 w-5" />}
          >
            Statistik
          </NavItem>

          <div className="contents lg:mt-4 lg:block lg:border-t lg:border-ink/10 lg:pt-4">
            <a
              href="/"
              className="flex min-h-14 w-full flex-col items-center justify-center gap-1 px-2 py-2 text-center text-xs font-semibold text-muted transition-colors hover:bg-bg-sage hover:text-ink lg:min-h-11 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-left lg:text-sm"
            >
              <Home className="w-5 h-5" />
              <span>Startsida</span>
            </a>
          </div>
        </nav>

        <div className="hidden border-t border-ink/10 p-4 lg:block">
          <div className="mb-2 flex items-center gap-3 rounded-md border border-border bg-bg-sage px-3 py-3">
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
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-error-bg"
          >
            <LogOut className="w-5 h-5" />
            <span>Logga ut</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 bg-bg lg:overflow-y-auto lg:overflow-x-hidden">
        {/* Participants View */}
        {activeView === 'participants' && (
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <PageHeader
              className="mb-6"
              title={`Deltagare ${selectedYear}`}
              description={`${filteredAndSortedRegistrations.length} registreringar`}
              actions={
                <>
                  <Button className="flex-1 sm:flex-none" onClick={() => setShowAddModal(true)}><Plus className="h-5 w-5" />Lägg till</Button>
                  <Button className="flex-1 sm:flex-none" variant="secondary" onClick={exportToCSV}><Download className="h-5 w-5" />Exportera</Button>
                </>
              }
            />

            {/* Toolbar */}
            <Card padding="sm" className="mb-6 lg:sticky lg:top-0 lg:z-20">
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:items-center lg:gap-3">
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
                    className="w-full lg:w-44"
                    value={viewMode}
                    options={viewModeOptions}
                    onChange={(value) => setViewMode(value as ViewMode)}
                  />
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="normal-case"
                      onClick={clearFilters}
                    >
                      Rensa filter
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* List View */}
            {viewMode === 'list' && (
              <Card padding="none" className="overflow-hidden">
                <div className="hidden overflow-x-auto md:block">
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
                        <td colSpan={7}><EmptyState title="Inga deltagare hittades" description="Justera sökningen eller filtren och försök igen." icon={<Users className="h-6 w-6" />} /></td>
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
                              isOpen={actionMenuOpen === `list-desktop:${registration.id}`}
                              isCancelled={registration.status === 'cancelled'}
                              onToggle={() => setActionMenuOpen(current =>
                                current === `list-desktop:${registration.id}`
                                  ? null
                                  : `list-desktop:${registration.id}`
                              )}
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
                <div className="divide-y divide-ink/10 md:hidden">
                  {filteredAndSortedRegistrations.length === 0 ? (
                    <EmptyState title="Inga deltagare hittades" description="Justera sökningen eller filtren och försök igen." icon={<Users className="h-6 w-6" />} />
                  ) : (
                    filteredAndSortedRegistrations.map((registration) => (
                      <article key={registration.id} className="relative p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className={`font-semibold ${registration.status === 'cancelled' ? 'text-muted line-through' : 'text-ink'}`}>
                                {registration.firstName} {registration.lastName}
                              </h3>
                              {registration.status === 'cancelled' && <Badge variant="muted" size="sm">Avregistrerad</Badge>}
                            </div>
                            <p className="mt-1 break-all text-sm text-ink">{registration.email}</p>
                            <p className="text-sm text-muted">{registration.phone}</p>
                          </div>
                          <RegistrationActionsMenu
                            registrationId={registration.id}
                            isOpen={actionMenuOpen === `list-mobile:${registration.id}`}
                            isCancelled={registration.status === 'cancelled'}
                            onToggle={() => setActionMenuOpen(current =>
                              current === `list-mobile:${registration.id}`
                                ? null
                                : `list-mobile:${registration.id}`
                            )}
                            onClose={() => setActionMenuOpen(null)}
                            onCancel={() => handleCancel(registration.id, `${registration.firstName} ${registration.lastName}`)}
                            onReactivate={() => handleReactivate(registration.id)}
                            onDelete={() => handleDelete(registration.id, `${registration.firstName} ${registration.lastName}`)}
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="session" size="sm">{formatSessionLabel(registration.location, registration.timeSlot || 'morning')}</Badge>
                          <Badge variant="week" size="sm">Vecka {getWeekNumber(parseISO(registration.weekStart))}</Badge>
                        </div>
                        <p className="mt-3 text-xs text-muted">
                          Anmäld {formatRegistrationDate(registration.createdAt)} kl. {formatRegistrationTime(registration.createdAt)}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </Card>
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
                    <div key={weekKey} className="overflow-visible rounded-lg border border-border bg-surface shadow-sm">
                      <button
                        onClick={() => toggleWeek(weekKey)}
                        className="flex w-full flex-col items-stretch gap-3 px-4 py-4 text-left transition-colors hover:bg-bg-sage sm:flex-row sm:items-center sm:justify-between sm:px-6"
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

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
                          <div className="text-base text-muted">{weekRange}</div>
                          <div className="flex flex-wrap items-center gap-2">
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
                          <div className="overflow-x-auto">
                            <table className="min-w-[58rem] w-full">
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
                                      isOpen={actionMenuOpen === `grouped:${registration.id}`}
                                      isCancelled={registration.status === 'cancelled'}
                                      onToggle={() => setActionMenuOpen(current =>
                                        current === `grouped:${registration.id}`
                                          ? null
                                          : `grouped:${registration.id}`
                                      )}
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
            <PageHeader
              className="mb-6"
              title={`Veckohantering ${selectedYear}`}
              description="Hantera tillgänglighet och kapacitet för alla pass."
              actions={<Select
                compact
                className="w-full sm:w-28"
                value={String(selectedYear)}
                options={yearOptions}
                onChange={(value) => setSelectedYear(Number(value))}
              />}
            />

            <Card padding="none" className="overflow-visible">
              <div className="hidden max-h-[calc(100vh-280px)] overflow-auto md:block">
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
                              <span className={sodMorning >= MAX_CAPACITY_PER_SESSION ? 'text-error font-medium' : 'text-ink'}>
                                {TIME_SLOTS.morning.time}: {sodMorning}/{MAX_CAPACITY_PER_SESSION}
                              </span>
                              <span className={sodAfternoon >= MAX_CAPACITY_PER_SESSION ? 'text-error font-medium' : 'text-ink'}>
                                {TIME_SLOTS.afternoon.time}: {sodAfternoon}/{MAX_CAPACITY_PER_SESSION}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-1 text-base">
                              <span className={gardMorning >= MAX_CAPACITY_PER_SESSION ? 'text-error font-medium' : 'text-ink'}>
                                {TIME_SLOTS.morning.time}: {gardMorning}/{MAX_CAPACITY_PER_SESSION}
                              </span>
                              <span className={gardAfternoon >= MAX_CAPACITY_PER_SESSION ? 'text-error font-medium' : 'text-ink'}>
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
                            <Switch checked={isAvailable} onChange={() => handleToggleWeek(weekKey, total)} label={`${isAvailable ? 'Stäng' : 'Öppna'} vecka ${weekNum}`} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-ink/10 md:hidden">
                {allWeeksOfYear.map((week) => {
                  const weekKey = formatDate(week);
                  const sodMorning = getWeekRegistrations(weekKey, 'sodermalm', 'morning').length;
                  const sodAfternoon = getWeekRegistrations(weekKey, 'sodermalm', 'afternoon').length;
                  const gardMorning = getWeekRegistrations(weekKey, 'gardet', 'morning').length;
                  const gardAfternoon = getWeekRegistrations(weekKey, 'gardet', 'afternoon').length;
                  const total = sodMorning + sodAfternoon + gardMorning + gardAfternoon;
                  const isAvailable = weekAvailability[weekKey]?.isAvailable !== false;
                  const weekNum = getWeekNumber(week);
                  const isPastWeek = new Date(weekKey) < new Date();

                  return (
                    <article key={weekKey} className={`p-4 ${isPastWeek ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-ink">Vecka {weekNum}</h3>
                          <p className="text-sm text-muted">{formatWeekRange(week)}</p>
                        </div>
                        <Switch checked={isAvailable} onChange={() => handleToggleWeek(weekKey, total)} label={`${isAvailable ? 'Stäng' : 'Öppna'} vecka ${weekNum}`} />
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-3 text-sm min-[420px]:grid-cols-2">
                        <div className="border border-ink/10 bg-bg-sage p-3">
                          <strong className="block text-ink">Södermalm</strong>
                          <span className="mt-1 block text-muted">{TIME_SLOTS.morning.time}: {sodMorning}/{MAX_CAPACITY_PER_SESSION}</span>
                          <span className="block text-muted">{TIME_SLOTS.afternoon.time}: {sodAfternoon}/{MAX_CAPACITY_PER_SESSION}</span>
                        </div>
                        <div className="border border-ink/10 bg-bg-sage p-3">
                          <strong className="block text-ink">Gärdet</strong>
                          <span className="mt-1 block text-muted">{TIME_SLOTS.morning.time}: {gardMorning}/{MAX_CAPACITY_PER_SESSION}</span>
                          <span className="block text-muted">{TIME_SLOTS.afternoon.time}: {gardAfternoon}/{MAX_CAPACITY_PER_SESSION}</span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted">Totalt: <strong className="text-ink">{total}</strong></p>
                    </article>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Stats View */}
        {activeView === 'stats' && (
          <div className="p-4 sm:p-6 lg:p-8">
            <PageHeader className="mb-8" title="Statistik" description="Översikt över anmälningar" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Totalt antal anmälningar" value={totalStats.total} detail="Alla platser och veckor" />
              <StatCard label="Södermalm" value={totalStats.sodermalm} detail={`${LOCATIONS.sodermalm.day} ${TIME_SLOTS.morning.time} & ${TIME_SLOTS.afternoon.time}`} />
              <StatCard label="Gärdet" value={totalStats.gardet} detail={`${LOCATIONS.gardet.day} ${TIME_SLOTS.morning.time} & ${TIME_SLOTS.afternoon.time}`} />
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

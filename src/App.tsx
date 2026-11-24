import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  Activity,
  BarChart3,
  Cloud,
  CloudOff,
  Download,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Terminal,
  Upload,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { useVibeBoard } from './store/useVibeBoard';
import type { AppView, Project, Timeframe } from './types';
import { OverviewView } from './components/OverviewView';
import { ProjectsView } from './components/ProjectsView';
import { EventsView } from './components/EventsView';
import { InstallView } from './components/InstallView';
import { ProjectModal } from './components/ProjectModal';
import { LogEventModal } from './components/LogEventModal';
import { AuthModal } from './components/AuthModal';

const NAV_ITEMS: { id: AppView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'events', label: 'Events', icon: Activity },
  { id: 'install', label: 'Install', icon: Terminal },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const {
    projects,
    events,
    isCloud,
    syncing,
    refreshCloud,
    addProject,
    updateProject,
    deleteProject,
    logEvent,
    exportJson,
    importJson,
    resetDemoData,
  } = useVibeBoard(user);

  const [view, setView] = useState<AppView>('overview');
  const [timeframe, setTimeframe] = useState<Timeframe>('7D');
  const [selectedId, setSelectedId] = useState<string>('all');
  const [installProjectId, setInstallProjectId] = useState<string | undefined>(undefined);

  const [projectModal, setProjectModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    project: Project | null;
  }>({ open: false, mode: 'create', project: null });

  const [eventModal, setEventModal] = useState<{ open: boolean; projectId?: string }>({
    open: false,
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        importJson(reader.result);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setMenuOpen(false);
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    if (selectedId === id) setSelectedId('all');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSelectedId('all');
    setMenuOpen(false);
  };

  return (
    <div className="luma-ambient-bg min-h-screen text-[#131517]">
      {/* Luma-style Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#131517]/6 bg-[#FAF9F7]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          {/* Brand + Nav */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setView('overview')}
              className="flex items-center gap-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4D79] via-[#E11D48] to-[#7C3AED] text-white shadow-sm">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold tracking-tight text-[#131517]">
                VibeBoard
              </span>
            </button>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setView(item.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'bg-white text-[#131517] shadow-xs ring-1 ring-[#131517]/8'
                        : 'text-[#64666B] hover:bg-white/60 hover:text-[#131517]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Timeframe Switcher */}
            <div className="hidden items-center rounded-full bg-white p-0.5 font-mono text-[11px] ring-1 ring-[#131517]/8 sm:flex">
              {(['7D', '30D', '90D'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-full px-2.5 py-1 font-medium transition ${
                    timeframe === tf
                      ? 'bg-[#131517] text-white'
                      : 'text-[#64666B] hover:text-[#131517]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Cloud Sync / Sign In Pill */}
            {user ? (
              <div className="hidden items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1.5 text-[11px] font-medium text-[#047857] lg:inline-flex">
                <Cloud className="h-3.5 w-3.5" />
                <span>{syncing ? 'Syncing…' : user.email?.split('@')[0]}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-medium text-[#131517] ring-1 ring-[#131517]/10 transition hover:bg-[#F5F4F1]"
              >
                <CloudOff className="h-3.5 w-3.5 text-[#E11D48]" />
                Sign In
              </button>
            )}

            {/* Primary Add App CTA */}
            <button
              type="button"
              onClick={() => setProjectModal({ open: true, mode: 'create', project: null })}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#131517] px-3.5 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-[#2A2D32]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add App
            </button>

            {/* Workspace Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                title="Workspace options"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#5C5E64] ring-1 ring-[#131517]/8 transition hover:text-[#131517]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-[#131517]/10 bg-white p-1.5 shadow-xl">
                    {user && (
                      <div className="border-b border-[#131517]/6 px-3 py-2">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8E9096]">
                          Supabase Synced
                        </div>
                        <div className="truncate text-xs font-medium text-[#131517]">
                          {user.email}
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        exportJson();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#131517] transition hover:bg-[#FAF9F7]"
                    >
                      <Download className="h-3.5 w-3.5 text-[#64666B]" />
                      Export JSON Backup
                    </button>
                    {!user && (
                      <>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#131517] transition hover:bg-[#FAF9F7]"
                        >
                          <Upload className="h-3.5 w-3.5 text-[#64666B]" />
                          Import JSON Backup
                        </button>
                        <div className="my-1 border-t border-[#131517]/6" />
                        <button
                          type="button"
                          onClick={() => {
                            resetDemoData();
                            setSelectedId('all');
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#BE123C] transition hover:bg-[#FFF1F2]"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reset Demo Data
                        </button>
                      </>
                    )}
                    {user && (
                      <>
                        <div className="my-1 border-t border-[#131517]/6" />
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#BE123C] transition hover:bg-[#FFF1F2]"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sign Out
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex items-center justify-between gap-2 border-t border-[#131517]/6 px-4 py-2 md:hidden">
          <div className="flex items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active ? 'bg-[#131517] text-white' : 'text-[#64666B]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace Canvas */}
      <main className="mx-auto max-w-6xl px-5 py-7">
        {!isCloud && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FECDD3]/80 bg-white/85 px-4 py-3 shadow-xs backdrop-blur-xs">
            <div className="flex items-center gap-2.5 text-xs text-[#3F4147]">
              <span className="h-2 w-2 rounded-full bg-[#E11D48] animate-pulse-dot" />
              <span>
                <strong className="font-semibold text-[#131517]">Local Demo Mode.</strong> Sign in
                to sync your projects to Supabase Postgres and ingest live traffic + Stripe
                webhooks.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="rounded-full bg-[#131517] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#2A2D32]"
            >
              Sign In / Create Account
            </button>
          </div>
        )}

        {view === 'overview' && (
          <OverviewView
            projects={projects}
            events={events}
            timeframe={timeframe}
            selectedId={selectedId}
            onSelectId={setSelectedId}
            onEditProject={(project) =>
              setProjectModal({ open: true, mode: 'edit', project })
            }
            onOpenAddProject={() =>
              setProjectModal({ open: true, mode: 'create', project: null })
            }
            onOpenLogEvent={(projectId) => setEventModal({ open: true, projectId })}
            onQuickRevenue={(project, amount) =>
              logEvent({
                projectId: project.id,
                type: 'revenue',
                label: 'stripe.charge.succeeded',
                detail: `+$${amount.toFixed(2)} · Quick Sale`,
                amount,
              })
            }
          />
        )}

        {view === 'projects' && (
          <ProjectsView
            projects={projects}
            timeframe={timeframe}
            onAddProject={() =>
              setProjectModal({ open: true, mode: 'create', project: null })
            }
            onEditProject={(project) =>
              setProjectModal({ open: true, mode: 'edit', project })
            }
            onDeleteProject={handleDeleteProject}
            onOpenInstall={(projectId) => {
              setInstallProjectId(projectId);
              setView('install');
            }}
            onInspectProject={(projectId) => {
              setSelectedId(projectId);
              setView('overview');
            }}
          />
        )}

        {view === 'events' && (
          <EventsView
            projects={projects}
            events={events}
            onOpenLogEvent={(projectId) => setEventModal({ open: true, projectId })}
          />
        )}

        {view === 'install' && (
          <InstallView
            projects={projects}
            isCloud={isCloud}
            initialProjectId={installProjectId}
            onRefreshCloud={refreshCloud}
          />
        )}
      </main>

      {/* Modals */}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      {projectModal.open && (
        <ProjectModal
          mode={projectModal.mode}
          timeframe={timeframe}
          initialProject={projectModal.project}
          onClose={() => setProjectModal({ open: false, mode: 'create', project: null })}
          onCreate={async (input) => {
            const created = await addProject(input);
            if (created) setSelectedId(created.id);
          }}
          onUpdate={(id, updates) => updateProject(id, timeframe, updates)}
        />
      )}

      {eventModal.open && projects.length > 0 && (
        <LogEventModal
          projects={projects}
          defaultProjectId={eventModal.projectId}
          onClose={() => setEventModal({ open: false })}
          onLog={logEvent}
        />
      )}
    </div>
  );
}

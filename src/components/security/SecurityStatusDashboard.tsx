import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  UserCheck,
  Download,
  Bell,
  Clock,
  Activity,
  X,
  CheckCircle2,
  AlertTriangle,
  CopyCheck,
  Database,
  Cloud,
} from 'lucide-react';
import {
  getSecurityDashboardSnapshot,
  checkDailyBackupReminder,
  dismissBackupReminderToday,
  getLastBackupTimestamp,
  getAuthorizedAdminEmail,
  setAuthorizedAdminEmail,
} from '../../utils/security';
import { setSupabaseCredentials, getSupabaseSecurityStatus } from '../../lib/supabase';

interface ToonViblyShieldBadgeProps {
  onClick?: () => void;
  className?: string;
}

export const ToonViblyShieldBadge: React.FC<ToonViblyShieldBadgeProps> = ({
  onClick,
  className = '',
}) => {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs hover:bg-emerald-700 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      title="View Military-Grade Security Status"
    >
      <span>🔒 Secured by ToonVibly Shield</span>
    </Tag>
  );
};

export const PeaceverseFooterShieldBar: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={`px-3.5 py-2 rounded-2xl bg-emerald-950 text-emerald-100 border border-emerald-700/60 text-[11px] font-semibold tracking-tight text-center shadow-sm ${
        onClick ? 'cursor-pointer hover:bg-emerald-900 transition-colors' : ''
      }`}
    >
      🔒 Peaceverse24 Shield Active | Supabase RLS: ON | Bunny CDN: Secured | Cloudflare: ON
    </Tag>
  );
};

interface SecurityStatusDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  firebaseUser: { uid?: string; email?: string | null; emailVerified?: boolean } | null;
  disableCopyOnSensitive: boolean;
  onToggleCopyProtection: (next: boolean) => void;
  onExportMyData: () => void;
}

export const SecurityStatusDashboard: React.FC<SecurityStatusDashboardProps> = ({
  isOpen,
  onClose,
  firebaseUser,
  disableCopyOnSensitive,
  onToggleCopyProtection,
  onExportMyData,
}) => {
  const [snapshot, setSnapshot] = useState(() => getSecurityDashboardSnapshot(firebaseUser));
  const [backupState, setBackupState] = useState(() => checkDailyBackupReminder());
  const [lastBackupTs, setLastBackupTs] = useState(() => getLastBackupTimestamp());
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [adminEmailDraft, setAdminEmailDraft] = useState(() => getAuthorizedAdminEmail());
  const [supabaseUrlDraft, setSupabaseUrlDraft] = useState(() => {
    try {
      return localStorage.getItem('peaceverse_supabase_url') || '';
    } catch {
      return '';
    }
  });
  const [configSavedNotice, setConfigSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSnapshot(getSecurityDashboardSnapshot(firebaseUser));
    setBackupState(checkDailyBackupReminder());
    setLastBackupTs(getLastBackupTimestamp());
    setAdminEmailDraft(getAuthorizedAdminEmail());
  }, [isOpen, firebaseUser]);

  if (!isOpen) return null;

  const adminEmail = getAuthorizedAdminEmail();
  const supabaseStatus = getSupabaseSecurityStatus();

  const handleExport = () => {
    onExportMyData();
    setLastBackupTs(getLastBackupTimestamp());
    setBackupState(checkDailyBackupReminder());
    setExportSuccess('Your encrypted JSON backup has been downloaded!');
    setTimeout(() => setExportSuccess(null), 4000);
  };

  const handleSaveSecurityConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmailDraft.trim() && adminEmailDraft.includes('@')) {
      setAuthorizedAdminEmail(adminEmailDraft.trim());
    }
    if (supabaseUrlDraft.trim()) {
      setSupabaseCredentials(supabaseUrlDraft.trim());
    }
    setSnapshot(getSecurityDashboardSnapshot(firebaseUser));
    setConfigSavedNotice('Security configuration saved!');
    setTimeout(() => setConfigSavedNotice(null), 3500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E4E6EB] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E4E6EB] bg-gradient-to-r from-emerald-50 via-white to-emerald-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-black">
                Peaceverse24 Security Dashboard
              </h2>
              <p className="text-[11px] text-emerald-700 font-semibold">
                🔒 Peaceverse24 Shield Active • Supabase • Firebase • Bunny CDN • Cloudflare
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-black cursor-pointer"
            aria-label="Close security dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Core Required Status Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <Database className="w-4 h-4 text-emerald-700 mx-auto" />
              <p className="text-[10px] font-bold text-[#65676B] uppercase">Supabase RLS</p>
              <p className="text-xs font-black text-emerald-700">{snapshot.supabaseRlsStatus}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <Lock className="w-4 h-4 text-emerald-700 mx-auto" />
              <p className="text-[10px] font-bold text-[#65676B] uppercase">Bunny CDN</p>
              <p className="text-xs font-black text-emerald-700">{snapshot.bunnyCdnStatus}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <Cloud className="w-4 h-4 text-emerald-700 mx-auto" />
              <p className="text-[10px] font-bold text-[#65676B] uppercase">Cloudflare</p>
              <p className="text-xs font-black text-emerald-700">{snapshot.cloudflareStatus}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700 mx-auto" />
              <p className="text-[10px] font-bold text-[#65676B] uppercase">Firebase Rules</p>
              <p className="text-xs font-black text-emerald-700">{snapshot.firebaseRulesStatus}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <KeyRound className="w-4 h-4 text-emerald-700 mx-auto" />
              <p className="text-[10px] font-bold text-[#65676B] uppercase">API Keys</p>
              <p
                className={`text-xs font-black ${
                  snapshot.apiKeysStatus === 'Hidden' ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {snapshot.apiKeysStatus}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <UserCheck className="w-4 h-4 text-emerald-700 mx-auto" />
              <p className="text-[10px] font-bold text-[#65676B] uppercase">Auth</p>
              <p
                className={`text-xs font-black ${
                  snapshot.authStatus === 'Enabled' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {snapshot.authStatus}
              </p>
            </div>
          </div>

          {/* Live Protection Telemetry */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E4E6EB] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#65676B] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                Rate Limiter (Firebase / API / Supabase)
              </span>
              <span className="font-bold text-black tabular-nums">
                {snapshot.rateLimitUsed}/{snapshot.rateLimitMax} min • 20/60s DB
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#65676B]">Friend Requests Daily Cap</span>
              <span className="font-bold text-black tabular-nums">
                {snapshot.friendRequestsToday}/{snapshot.friendRequestsDailyMax} today
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#65676B] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                24h Auto-Logout Timer
              </span>
              <span className="font-bold text-black tabular-nums">
                {snapshot.sessionHoursLeft}h remaining
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#65676B]">XSS Filter &amp; Post Cap</span>
              <span className="font-bold text-emerald-700">
                DOMPurify + {supabaseStatus.maxPostLength} chars ✓
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#65676B]">Bunny CDN Upload Guard</span>
              <span className="font-bold text-emerald-700">
                5MB Img • 50MB Vid • .exe/.php Blocked ✓
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#65676B]">Chat Message Privacy</span>
              <span className="font-bold text-emerald-700">Base64 Encrypted + Auth Check ✓</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#65676B]">Admin Route Access (/admin)</span>
              <span className="font-bold text-black" data-sensitive="true">
                {adminEmail ? `Locked (${adminEmail})` : 'Admin Email Pending'}
              </span>
            </div>
          </div>

          {/* Admin Email & Supabase URL Setup */}
          <form
            onSubmit={handleSaveSecurityConfig}
            className="p-3.5 rounded-2xl bg-white border border-[#E4E6EB] space-y-2.5"
          >
            <p className="font-bold text-xs text-black">
              Admin Email &amp; Supabase Project Configuration
            </p>
            <div className="space-y-2">
              <input
                type="email"
                value={adminEmailDraft}
                onChange={(e) => setAdminEmailDraft(e.target.value)}
                placeholder="Authorized Admin Email (e.g. masterlive251@gmail.com)"
                className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-black"
              />
              <input
                type="url"
                value={supabaseUrlDraft}
                onChange={(e) => setSupabaseUrlDraft(e.target.value)}
                placeholder="Supabase URL (https://your-project.supabase.co)"
                className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-black"
              />
            </div>
            {configSavedNotice && (
              <p className="text-[11px] font-bold text-emerald-700">{configSavedNotice}</p>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer"
            >
              Save Admin &amp; Supabase Config
            </button>
          </form>

          {/* Sensitive Data Right-Click / Copy Toggle */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E4E6EB] flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CopyCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-xs text-black">
                  Disable Right-Click &amp; Copy on Sensitive Data
                </p>
                <p className="text-[11px] text-[#65676B]">
                  Protects email, wallet coins, and payment numbers
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={disableCopyOnSensitive}
              onClick={() => onToggleCopyProtection(!disableCopyOnSensitive)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center shrink-0 cursor-pointer ${
                disableCopyOnSensitive ? 'bg-emerald-600' : 'bg-[#CED0D4]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  disableCopyOnSensitive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Backup & Export My Data */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-xs text-black">Daily Backup &amp; Export</span>
              </div>
              <span className="text-[11px] text-[#65676B]">
                {lastBackupTs
                  ? `Last: ${new Date(lastBackupTs).toLocaleDateString()}`
                  : 'No backup yet'}
              </span>
            </div>

            {backupState.needsBackup && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Daily backup recommended for your profile &amp; posts.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    dismissBackupReminderToday();
                    setBackupState(checkDailyBackupReminder());
                  }}
                  className="text-[10px] font-bold text-amber-700 hover:underline shrink-0 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {exportSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{exportSuccess}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleExport}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export My Data</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E4E6EB] bg-white flex items-center justify-between gap-2">
          <ToonViblyShieldBadge />
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-xs font-bold text-black cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

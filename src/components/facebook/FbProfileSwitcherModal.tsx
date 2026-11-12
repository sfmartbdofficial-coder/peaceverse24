import React, { useState } from 'react';
import {
  Check,
  Plus,
  Camera,
  Phone,
  MoreHorizontal,
  X
} from 'lucide-react';
import { UserProfile } from '../../types';

export interface ExtraProfileItem {
  id: string;
  name: string;
  avatar: string;
  type: 'page' | 'profile';
  notifications?: number;
}

export interface OtherProfileItem {
  id: string;
  name: string;
  avatar: string;
  badgeIcon?: 'instagram' | 'whatsapp';
  notifications?: number;
}

interface FbProfileSwitcherModalProps {
  userProfile: UserProfile;
  activeProfileId?: string;
  onSelectProfile?: (id: string, name: string) => void;
  onClose: () => void;
  onCreatePage?: () => void;
  onOpenAccountsCenter?: () => void;
}

export const FbProfileSwitcherModal: React.FC<FbProfileSwitcherModalProps> = ({
  userProfile,
  activeProfileId = 'main',
  onSelectProfile,
  onClose,
  onCreatePage,
  onOpenAccountsCenter,
}) => {
  const [selectedId, setSelectedId] = useState<string>(activeProfileId);
  const [switchFeedback, setSwitchFeedback] = useState<string | null>(null);
  const [showAccountsCenter, setShowAccountsCenter] = useState<boolean>(false);

  // Dynamic extra profiles (e.g. pages created by user, excluding demo mock IDs)
  const [extraProfiles] = useState<ExtraProfileItem[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_fb_pages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const demoIds = ['page-sf-mart', 'page-sharif-story', 'page-angel-mahi', 'page-noor-academy'];
          const userPages = parsed.filter((p: any) => p.isOwner && !demoIds.includes(p.id));
          if (userPages.length > 0) {
            return userPages.map((p: any) => ({
              id: p.id,
              name: p.name,
              avatar: p.avatar,
              type: 'page' as const,
              notifications: 2,
            }));
          }
        }
      }
    } catch {
      return [];
    }
    return [];
  });

  // Dynamic other profiles (e.g. connected Instagram or WhatsApp)
  const [otherProfiles] = useState<OtherProfileItem[]>(() => {
    try {
      const stored = localStorage.getItem('peaceverse_other_profiles');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleSelect = (id: string, name: string) => {
    setSelectedId(id);
    setSwitchFeedback(`সুইচ করা হয়েছে: ${name}`);
    if (onSelectProfile) onSelectProfile(id, name);
    setTimeout(() => {
      setSwitchFeedback(null);
      onClose();
    }, 600);
  };

  const mainName = userProfile.name && userProfile.name !== 'New Member' ? userProfile.name : 'Siddik';

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end justify-center p-0 animate-in fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg bg-white rounded-t-[28px] p-4 text-neutral-900 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] overflow-y-auto no-scrollbar font-sans select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Drag Handle */}
          <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-3.5" />

          {/* Switch Feedback Toast */}
          {switchFeedback && (
            <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl text-center border border-emerald-200 animate-in fade-in">
              {switchFeedback}
            </div>
          )}

          {/* Upper Section: Main Profile Card & Pages (Matching Facebook Screenshot 2) */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-neutral-100">
            
            {/* 1. Main Personal Profile */}
            <button
              onClick={() => handleSelect('main', mainName)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-200 shadow-xs shrink-0 bg-[#0866FF] flex items-center justify-center text-white font-bold text-lg">
                  {userProfile.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt={mainName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    'SI'
                  )}
                </div>
                <div>
                  <p className="font-semibold text-base text-neutral-900 leading-tight">
                    {mainName}
                  </p>
                </div>
              </div>

              {selectedId === 'main' && (
                <div className="w-6 h-6 rounded-full bg-[#0866FF] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Dynamic Pages / Extra Profiles */}
            {extraProfiles.map((prof) => (
              <button
                key={prof.id}
                onClick={() => handleSelect(prof.id, prof.name)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-200 shadow-xs shrink-0 bg-neutral-100 flex items-center justify-center">
                    <img
                      src={prof.avatar}
                      alt={prof.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[15px] text-neutral-900 leading-tight">
                      {prof.name}
                    </p>
                    {prof.notifications ? (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        <span>{prof.notifications} notifications</span>
                      </div>
                    ) : null}
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-[11px] font-medium capitalize">
                      {prof.type || 'Page'}
                    </span>
                  </div>
                </div>

                {selectedId === prof.id && (
                  <div className="w-6 h-6 rounded-full bg-[#0866FF] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            ))}

            {/* Create peaceverse24 Page Button */}
            <button
              onClick={() => {
                onClose();
                if (onCreatePage) onCreatePage();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-left cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
                <Plus className="w-6 h-6 stroke-[2.2]" />
              </div>
              <p className="font-medium text-[15px] text-neutral-900">
                Create peaceverse24 Page
              </p>
            </button>

          </div>

          {/* Lower Section: Other profiles (renders only if external accounts exist) */}
          {otherProfiles.length > 0 && (
            <div className="pt-4">
              <h3 className="text-sm font-semibold text-neutral-600 px-1 pb-2">
                Other profiles
              </h3>

              <div className="bg-white rounded-2xl border border-neutral-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-neutral-100">
                {otherProfiles.map((other) => (
                  <div key={other.id} className="flex items-center justify-between p-3.5 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 shrink-0">
                        <img
                          src={other.avatar}
                          alt={other.name}
                          className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                        />
                        {other.badgeIcon === 'instagram' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white ring-2 ring-white">
                            <Camera className="w-2.5 h-2.5" />
                          </div>
                        )}
                        {other.badgeIcon === 'whatsapp' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-2 ring-white">
                            <Phone className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[15px] text-neutral-900 leading-tight">
                          {other.name}
                        </p>
                        {other.notifications ? (
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            <span>{other.notifications} notifications</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <button
                      className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Button: Go to Accounts Center (Exact Screenshot 2) */}
          <div className="pt-4 pb-2">
            <button
              onClick={() => {
                if (onOpenAccountsCenter) {
                  onOpenAccountsCenter();
                } else {
                  setShowAccountsCenter(true);
                }
              }}
              className="w-full py-2.5 px-4 rounded-full border border-neutral-300 hover:bg-neutral-50 active:scale-[0.99] text-sm font-semibold text-neutral-800 transition-all text-center shadow-xs cursor-pointer"
            >
              Go to Accounts Center
            </button>
          </div>

        </div>
      </div>

      {/* Meta Accounts Center Modal */}
      {showAccountsCenter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 text-neutral-900 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-[#0866FF] font-black text-lg">∞ Meta</span>
                <span className="font-bold text-base text-neutral-800">Accounts Center</span>
              </div>
              <button
                onClick={() => setShowAccountsCenter(false)}
                className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Manage your connected experiences and account settings across peaceverse24.
            </p>

            <div className="space-y-2 text-sm font-medium">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900">Profiles & Accounts</p>
                  <p className="text-xs text-neutral-500">peaceverse24</p>
                </div>
                <span className="text-xs text-[#0866FF] font-bold">
                  {1 + extraProfiles.length} connected
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900">Password & Security</p>
                  <p className="text-xs text-neutral-500">Two-factor auth, saved logins</p>
                </div>
                <span className="text-xs text-emerald-600 font-bold">Secured ✓</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900">Personal Details</p>
                  <p className="text-xs text-neutral-500">Contact info, birthday, identity verification</p>
                </div>
                <span className="text-xs text-[#0866FF] font-bold">Edit</span>
              </div>
            </div>

            <button
              onClick={() => setShowAccountsCenter(false)}
              className="w-full py-2.5 rounded-full bg-[#0866FF] text-white font-semibold text-sm hover:bg-[#1877F2] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

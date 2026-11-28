import React, { useState } from 'react';
import { X, Flag, Ban, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { submitContentReportToFirestore } from '../../lib/firebase';

interface YtReportBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'video' | 'short' | 'live' | 'channel';
  targetId: string;
  targetTitle?: string;
  creatorId: string;
  creatorName: string;
  reporterId: string;
  isBlocked: boolean;
  onToggleBlockCreator: (creatorId: string, creatorName: string) => void;
}

const REPORT_REASONS = [
  'Not Halal / Modesty violation (অশালীন বা হারাম কন্টেন্ট)',
  'Gambling / Haram betting promotion (জুয়া বা বেটিং)',
  'Hate speech or harassment (ঘৃণাত্মক বক্তব্য বা হয়রানি)',
  'Misinformation / Fake Islamic ruling (ভুল বা বিভ্রান্তিকর তথ্য)',
  'Spam or scam link (স্প্যাম বা প্রতারণা)',
];

export const YtReportBlockModal: React.FC<YtReportBlockModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  creatorId,
  creatorName,
  reporterId,
  isBlocked,
  onToggleBlockCreator,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContentReportToFirestore({
        reporterId,
        targetType,
        targetId,
        targetAuthorId: creatorId,
        targetAuthorName: creatorName,
        reason: selectedReason,
        details: details.trim(),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
            <h3 className="text-base font-extrabold text-zinc-950">Report &amp; Block</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Quick Block Creator Card */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-900 truncate">{creatorName}</p>
              <p className="text-xs text-zinc-500">
                {isBlocked
                  ? 'Channel is currently blocked from your feed.'
                  : 'Hide all videos & live rooms from this channel.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onToggleBlockCreator(creatorId || creatorName, creatorName);
                onClose();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                isBlocked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{isBlocked ? 'Unblock' : 'Block Channel'}</span>
            </button>
          </div>

          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto" />
              <p className="text-base font-bold text-zinc-950">Report Received — জাজাকাল্লাহু খাইরান</p>
              <p className="text-xs text-zinc-600">
                Our Halal Moderation Team will review {targetTitle ? `"${targetTitle.slice(0, 50)}"` : 'this content'} shortly.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#16A34A] text-white font-bold text-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Report for Halal Review</span>
              </p>

              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selectedReason === reason
                        ? 'border-[#DC2626] bg-red-50/70 text-zinc-950 font-semibold'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="mt-0.5 accent-[#DC2626]"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Optional details (timestamp or reason)..."
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#DC2626]"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Submit Report</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

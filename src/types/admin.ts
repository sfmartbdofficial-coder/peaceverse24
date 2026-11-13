export interface AdSlot {
  id: string;
  slotName: string;
  placement: 'home_feed' | 'reels_preroll' | 'marketplace_top' | 'story_ad';
  sponsorName: string;
  adTitle: string;
  adDescription: string;
  imageUrl: string;
  targetUrl: string;
  cpmRate: number; // in BDT per 1000 impressions
  cpcRate: number; // in BDT per click
  impressions: number;
  clicks: number;
  totalEarnings: number;
  isActive: boolean;
  category: string;
}

export interface MonetizedCreator {
  id: string;
  name: string;
  avatar: string;
  category: string;
  followersCount: number;
  totalViews: number;
  halalScore: number;
  status: 'approved' | 'pending' | 'rejected';
  totalEarnings: number; // in BDT
  paidEarnings: number;
  pendingBalance: number;
  appliedDate: string;
  payoutMethod: 'bKash' | 'Nagad' | 'Bank' | 'PayPal' | 'Stripe' | 'Payoneer';
  accountNumber: string;
}

export interface PayoutRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  amount: number;
  method: 'bKash' | 'Nagad' | 'Bank' | 'PayPal' | 'Stripe' | 'Payoneer';
  accountNumber: string;
  date: string;
  status: 'paid' | 'pending';
  transactionId?: string;
}

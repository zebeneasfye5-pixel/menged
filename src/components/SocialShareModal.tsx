import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  X,
  Sparkles
} from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  title = 'የመንገድ እና ትራንስፖርት ባለስልጣን | National Transport & Fleet Command',
  url = typeof window !== 'undefined' ? window.location.href : '',
}) => {
  const [copied, setCopied] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('transport_et_likes');
      return saved ? parseInt(saved, 10) : 1482;
    }
    return 1482;
  });
  const [hasLiked, setHasLiked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('transport_et_user_has_liked') === 'true';
    }
    return false;
  });

  const handleToggleLike = () => {
    if (hasLiked) {
      const next = Math.max(0, likeCount - 1);
      setLikeCount(next);
      setHasLiked(false);
      localStorage.setItem('transport_et_likes', next.toString());
      localStorage.setItem('transport_et_user_has_liked', 'false');
    } else {
      const next = likeCount + 1;
      setLikeCount(next);
      setHasLiked(true);
      localStorage.setItem('transport_et_likes', next.toString());
      localStorage.setItem('transport_et_user_has_liked', 'true');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: 'የመንገድ እና ትራንስፖርት ባለስልጣን - የቀጥታ ጂፒኤስ ክትትል፣ የተሽከርካሪ ተራና ዲጂታል ክፍያ ስርዓት',
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(`${title}\n${url}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`የመንገድና ትራንስፖርት የቀጥታ ፖርታል: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">ላይክ እና ሸር (Like & Share)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Heart Like Button */}
        <div className="bg-gradient-to-r from-rose-950/40 via-slate-800 to-amber-950/40 border border-slate-700 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <span>ስርዓቱን ወደዱት?</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </span>
            <p className="text-xs text-slate-400">ድጋፍዎን በዕለታዊ ላይክ ይግለጹ</p>
          </div>

          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all active:scale-90 shadow-lg ${
              hasLiked
                ? 'bg-rose-600 text-white shadow-rose-950/60 ring-2 ring-rose-400'
                : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white text-white' : 'text-rose-400'}`} />
            <span className="font-mono text-sm">{likeCount}</span>
          </button>
        </div>

        {/* Share buttons */}
        <div className="space-y-3 text-xs">
          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[11px]">
            በማህበራዊ ሚዲያ ያጋሩ (Share with others):
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Telegram */}
            <button
              onClick={shareTelegram}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-all shadow"
            >
              <Send className="w-4 h-4" />
              <span>ቴሌግራም (Telegram)</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow"
            >
              <MessageCircle className="w-4 h-4" />
              <span>ዋትስአፕ (WhatsApp)</span>
            </button>

            {/* Facebook */}
            <button
              onClick={shareFacebook}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow"
            >
              <Facebook className="w-4 h-4" />
              <span>ፌስቡክ (Facebook)</span>
            </button>

            {/* Native Mobile Share */}
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow"
            >
              <Share2 className="w-4 h-4" />
              <span>በስልክ አጋራ (Share)</span>
            </button>
          </div>
        </div>

        {/* Copy Link input */}
        <div className="bg-slate-800 p-2.5 rounded-2xl border border-slate-700 flex items-center justify-between gap-2 text-xs">
          <input
            type="text"
            readOnly
            value={url}
            className="bg-transparent text-slate-300 font-mono text-xs w-full focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shrink-0 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'ተገልብጧል!' : 'ኮፒ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

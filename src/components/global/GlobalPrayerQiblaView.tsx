import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Compass,
  Clock,
  MapPin,
  Navigation,
  BookOpen,
  Globe,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import {
  GLOBAL_CITIES,
  GlobalCity,
  PrayerSchedule,
  calculateQiblaBearing,
  calculateDistanceToKaabaKm,
  getCompassCardinal,
  detectUserGlobalCity,
  fetchPrayerTimesForCity,
  getDailyQuranVerse,
} from '../../lib/globalPrayer';
import { useLanguage } from '../../context/LanguageContext';

interface GlobalPrayerQiblaViewProps {
  onBack: () => void;
}

export const GlobalPrayerQiblaView: React.FC<GlobalPrayerQiblaViewProps> = ({ onBack }) => {
  const { currentLang } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<GlobalCity>(GLOBAL_CITIES[0]);
  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [compassActive, setCompassActive] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string>('');

  const qiblaBearing = calculateQiblaBearing(selectedCity.lat, selectedCity.lng);
  const distanceKm = calculateDistanceToKaabaKm(selectedCity.lat, selectedCity.lng);
  const cardinal = getCompassCardinal(qiblaBearing);
  const dailyVerse = getDailyQuranVerse(currentLang);

  // Initial auto city detection
  useEffect(() => {
    let mounted = true;
    (async () => {
      const detected = await detectUserGlobalCity();
      if (mounted) {
        setSelectedCity(detected);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load prayer times whenever city changes
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPrayerTimesForCity(selectedCity).then((data) => {
      if (mounted) {
        setSchedule(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [selectedCity]);

  // Listen to device compass orientation when supported
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const ev = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
      if (typeof ev.webkitCompassHeading === 'number') {
        setDeviceHeading(Math.round(ev.webkitCompassHeading));
        setCompassActive(true);
      } else if (typeof event.alpha === 'number') {
        setDeviceHeading(Math.round((360 - event.alpha) % 360));
        setCompassActive(true);
      }
    };
    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, []);

  const handleCitySelect = (city: GlobalCity) => {
    setSelectedCity(city);
    setGpsStatus('');
    try {
      localStorage.setItem('peaceworld_selected_city', city.id);
    } catch {}
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation unavailable on this device');
      return;
    }
    setGpsStatus('Detecting GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        setSelectedCity({
          id: 'gps-live',
          city: `My Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
          country: 'GPS Detected',
          countryCode: 'GPS',
          flag: '📍',
          lat,
          lng,
          timezoneOffsetHours: Math.round(-new Date().getTimezoneOffset() / 60),
          method: 3,
        });
        setGpsStatus('Exact GPS coordinates active');
      },
      () => {
        setGpsStatus('Location permission denied — using city selector');
      },
      { timeout: 6000 }
    );
  };

  const enableCompassSensor = async () => {
    try {
      const req = (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        ?.requestPermission;
      if (typeof req === 'function') {
        const permission = await req();
        if (permission === 'granted') setCompassActive(true);
      } else {
        setCompassActive(true);
      }
    } catch {
      setCompassActive(false);
    }
  };

  // Relative angle of Qibla arrow based on current device heading
  const needleRotation = (qiblaBearing - deviceHeading + 360) % 360;
  const isAligned = needleRotation <= 6 || needleRotation >= 354;

  const prayerRows = schedule
    ? [
        { key: 'Fajr', label: currentLang === 'bn' ? 'ফজর' : currentLang === 'ar' ? 'الفجر' : 'Fajr', time: schedule.times.Fajr },
        { key: 'Sunrise', label: currentLang === 'bn' ? 'সূর্যোদয়' : currentLang === 'ar' ? 'الشروق' : 'Sunrise', time: schedule.times.Sunrise },
        { key: 'Dhuhr', label: currentLang === 'bn' ? 'যোহর' : currentLang === 'ar' ? 'الظهر' : 'Dhuhr', time: schedule.times.Dhuhr },
        { key: 'Asr', label: currentLang === 'bn' ? 'আসর' : currentLang === 'ar' ? 'العصر' : 'Asr', time: schedule.times.Asr },
        { key: 'Maghrib', label: currentLang === 'bn' ? 'মাগরিব' : currentLang === 'ar' ? 'المغرب' : 'Maghrib', time: schedule.times.Maghrib },
        { key: 'Isha', label: currentLang === 'bn' ? 'ইশা' : currentLang === 'ar' ? 'العشاء' : 'Isha', time: schedule.times.Isha },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#121212] text-[#050505] dark:text-[#e4e6eb] pb-24">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#242526] border-b border-[#E4E6EB] dark:border-[#393a3b] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg truncate flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Global Qibla & Prayer Times</span>
              </h1>
              <p className="text-xs text-[#65676B] dark:text-[#b0b3b8] truncate">
                {selectedCity.flag} {selectedCity.city}, {selectedCity.country}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDetectGps}
            className="px-3 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#0055d4] text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Detect My Location</span>
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-3 sm:p-5 space-y-5">
        {gpsStatus && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{gpsStatus}</span>
          </div>
        )}

        {/* Global City Presets */}
        <div className="bg-white dark:bg-[#1C1C1D] border border-[#E4E6EB] dark:border-[#2e2f30] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-[#65676B] dark:text-[#b0b3b8] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0866FF]" />
              <span>Select World City</span>
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
              {distanceKm.toLocaleString()} km to Kaaba
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {GLOBAL_CITIES.map((city) => {
              const active = selectedCity.id === city.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0866FF] text-white shadow-sm'
                      : 'bg-[#F0F2F5] dark:bg-[#2a2b2d] text-[#050505] dark:text-[#e4e6eb] hover:bg-[#E4E6EB] dark:hover:bg-[#3a3b3c]'
                  }`}
                >
                  <span>{city.flag}</span>
                  <span>{city.city}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Qibla Compass & City Prayer Times Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {/* Qibla Compass Card */}
          <div className="bg-white dark:bg-[#1C1C1D] border border-[#E4E6EB] dark:border-[#2e2f30] rounded-2xl p-5 flex flex-col items-center justify-between space-y-4">
            <div className="w-full flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base">Qibla Compass</h2>
                <p className="text-xs text-[#65676B] dark:text-[#b0b3b8]">
                  Direction to Al-Masjid Al-Haram
                </p>
              </div>
              <button
                type="button"
                onClick={enableCompassSensor}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold cursor-pointer"
              >
                {compassActive ? 'Sensor Live' : 'Enable Sensor'}
              </button>
            </div>

            {/* Compass Dial */}
            <div className="relative w-56 h-56 flex items-center justify-center my-2">
              <div
                className={`absolute inset-0 rounded-full border-4 transition-colors ${
                  isAligned
                    ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                    : 'border-[#E4E6EB] dark:border-[#393a3b]'
                }`}
              />

              {/* Rotating Dial Ring based on device heading */}
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full transition-transform duration-150"
                style={{ transform: `rotate(${-deviceHeading}deg)` }}
              >
                <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                {Array.from({ length: 36 }).map((_, idx) => {
                  const angle = idx * 10;
                  const major = idx % 9 === 0;
                  return (
                    <line
                      key={angle}
                      x1="100"
                      y1={major ? 10 : 14}
                      x2="100"
                      y2={major ? 22 : 19}
                      stroke={idx === 0 ? '#ef4444' : 'currentColor'}
                      strokeOpacity={major ? 0.7 : 0.3}
                      strokeWidth={major ? 2.5 : 1}
                      transform={`rotate(${angle} 100 100)`}
                    />
                  );
                })}
                <text x="100" y="36" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="800">N</text>
                <text x="166" y="104" textAnchor="middle" fill="currentColor" fillOpacity="0.65" fontSize="12" fontWeight="700">E</text>
                <text x="100" y="174" textAnchor="middle" fill="currentColor" fillOpacity="0.65" fontSize="12" fontWeight="700">S</text>
                <text x="34" y="104" textAnchor="middle" fill="currentColor" fillOpacity="0.65" fontSize="12" fontWeight="700">W</text>
              </svg>

              {/* Qibla Kaaba Pointer Needle */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-200 pointer-events-none"
                style={{ transform: `rotate(${needleRotation}deg)` }}
              >
                <div className="relative h-full w-8 flex flex-col items-center justify-start pt-5">
                  <div className="w-7 h-7 rounded-lg bg-neutral-950 border-2 border-amber-400 flex items-center justify-center shadow-lg">
                    <span className="text-xs">🕋</span>
                  </div>
                  <div className="w-1 h-16 bg-gradient-to-b from-emerald-500 to-transparent rounded-full" />
                </div>
              </div>

              {/* Center Readout */}
              <div className="w-20 h-20 rounded-full bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#393a3b] shadow-md flex flex-col items-center justify-center z-10">
                <span className="text-lg font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                  {qiblaBearing}°
                </span>
                <span className="text-[11px] font-bold text-[#65676B] dark:text-[#b0b3b8]">
                  {cardinal}
                </span>
              </div>
            </div>

            {/* Calibration Slider for Desktop / Manual Checking */}
            <div className="w-full space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-[#65676B] dark:text-[#b0b3b8] tabular-nums">
                <span>Phone Heading: {deviceHeading}°</span>
                {isAligned ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Facing Qibla
                  </span>
                ) : (
                  <span>Rotate phone to 0° offset</span>
                )}
              </div>
              <input
                type="range"
                min={0}
                max={359}
                value={deviceHeading}
                onChange={(e) => setDeviceHeading(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
                aria-label="Simulate compass heading"
              />
            </div>
          </div>

          {/* Global Prayer Times Card */}
          <div className="bg-white dark:bg-[#1C1C1D] border border-[#E4E6EB] dark:border-[#2e2f30] rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold text-base flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#0866FF]" />
                  <span>Prayer Times · {selectedCity.city}</span>
                </h2>
                <p className="text-xs text-[#65676B] dark:text-[#b0b3b8] mt-0.5">
                  {schedule ? `${schedule.hijriDate} · ${schedule.gregorianDate}` : 'Loading schedule...'}
                </p>
              </div>
              {loading && <RefreshCw className="w-4 h-4 animate-spin text-[#0866FF]" />}
            </div>

            {schedule && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#0866FF] to-emerald-600 text-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider opacity-85 block">Next Prayer</span>
                  <span className="text-base font-black">{schedule.nextPrayer.name}</span>
                </div>
                <div className="text-right tabular-nums">
                  <span className="text-lg font-black block leading-tight">{schedule.nextPrayer.time}</span>
                  <span className="text-[11px] opacity-90">in {schedule.nextPrayer.remainingText}</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              {prayerRows.map((row) => {
                const isNext = schedule?.nextPrayer.name === row.key;
                return (
                  <div
                    key={row.key}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      isNext
                        ? 'bg-emerald-500/15 border border-emerald-500/40 font-bold text-emerald-700 dark:text-emerald-300'
                        : 'bg-[#F0F2F5] dark:bg-[#242526] text-[#050505] dark:text-[#e4e6eb]'
                    }`}
                  >
                    <span>{row.label}</span>
                    <span className="font-mono font-bold tabular-nums">{row.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Quran Verse in User's Selected Language */}
        <div className="bg-gradient-to-br from-emerald-950 via-[#132520] to-[#0b1322] text-white rounded-2xl border border-emerald-500/35 p-5 sm:p-6 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Daily Quran Verse ({currentLang.toUpperCase()})</span>
            </span>
            <span>{dailyVerse.surahRef}</span>
          </div>

          <p className="text-xl sm:text-2xl font-arabic text-right leading-loose text-emerald-50" dir="rtl">
            {dailyVerse.arabic}
          </p>

          <p className="text-sm sm:text-base text-slate-100 leading-relaxed border-t border-emerald-500/25 pt-3">
            “{dailyVerse.localized}”
          </p>
        </div>
      </div>
    </div>
  );
};

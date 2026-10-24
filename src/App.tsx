/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { GpsLiveTracking } from './components/GpsLiveTracking';
import { QueueTurnManager } from './components/QueueTurnManager';
import { VehiclesManagement } from './components/VehiclesManagement';
import { DriversManagement } from './components/DriversManagement';
import { OwnersManagement } from './components/OwnersManagement';
import { RoutesTariffs } from './components/RoutesTariffs';
import { TrafficSafetyAndTips } from './components/TrafficSafetyAndTips';
import { VoiceTranslatorIntercom } from './components/VoiceTranslatorIntercom';
import { PaymentsAndSettlements } from './components/PaymentsAndSettlements';
import { ExcelReportsModal } from './components/ExcelReportsModal';
import { SocialShareModal } from './components/SocialShareModal';
import { SmartContractModal } from './components/SmartContractModal';

import { 
  Driver, 
  Language, 
  Owner, 
  OwnerSettlement, 
  PassengerTicketPayment, 
  QueueTurn, 
  SafetyReport, 
  TerminalExitFee, 
  TransportRoute, 
  Vehicle 
} from './types';
import { StorageService } from './utils/storage';
import { playEmergencySiren, speakText } from './utils/audio';
import { AlertOctagon, PhoneCall, ShieldAlert, WifiOff, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentLang, setCurrentLang] = useState<Language>('am');
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Active Role state: user (ተጠቃሚ/መንገደኛ) vs inspector (ተቆጣጣሪ/ባለስልጣን)
  const [activeRole, setActiveRole] = useState<'user' | 'inspector'>('user');

  // Modals state
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [contractModalOpen, setContractModalOpen] = useState<boolean>(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);

  // Persistent state collections from StorageService
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => StorageService.getVehicles());
  const [drivers, setDrivers] = useState<Driver[]>(() => StorageService.getDrivers());
  const [owners, setOwners] = useState<Owner[]>(() => StorageService.getOwners());
  const [queues, setQueues] = useState<QueueTurn[]>(() => StorageService.getQueues());
  const [routes, setRoutes] = useState<TransportRoute[]>(() => StorageService.getRoutes());
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>(() => StorageService.getReports());
  const [payments, setPayments] = useState<PassengerTicketPayment[]>(() => StorageService.getPayments());
  const [exitFees, setExitFees] = useState<TerminalExitFee[]>(() => StorageService.getExitFees());
  const [settlements, setSettlements] = useState<OwnerSettlement[]>(() => StorageService.getSettlements());

  // Online / Offline connectivity listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update handlers with persistent storage sync
  const handleUpdateVehicles = (updated: Vehicle[]) => {
    setVehicles(updated);
    StorageService.saveVehicles(updated);
  };

  const handleUpdateDrivers = (updated: Driver[]) => {
    setDrivers(updated);
    StorageService.saveDrivers(updated);
  };

  const handleUpdateOwners = (updated: Owner[]) => {
    setOwners(updated);
    StorageService.saveOwners(updated);
  };

  const handleUpdateQueues = (updated: QueueTurn[]) => {
    setQueues(updated);
    StorageService.saveQueues(updated);
  };

  const handleUpdateRoutes = (updated: TransportRoute[]) => {
    setRoutes(updated);
    StorageService.saveRoutes(updated);
  };

  const handleUpdateReports = (updated: SafetyReport[]) => {
    setSafetyReports(updated);
    StorageService.saveReports(updated);
  };

  const handleUpdatePayments = (updated: PassengerTicketPayment[]) => {
    setPayments(updated);
    StorageService.savePayments(updated);
  };

  const handleUpdateExitFees = (updated: TerminalExitFee[]) => {
    setExitFees(updated);
    StorageService.saveExitFees(updated);
  };

  const handleUpdateSettlements = (updated: OwnerSettlement[]) => {
    setSettlements(updated);
    StorageService.saveSettlements(updated);
  };

  // Live GPS Telemetry heartbeat: simulate slight motion and speed variation
  useEffect(() => {
    const timer = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status !== 'on_route') return v;
          const dLat = (Math.random() - 0.5) * 0.008;
          const dLng = (Math.random() - 0.5) * 0.008;
          let newSpeed = v.currentSpeed + Math.floor((Math.random() - 0.48) * 4);
          if (newSpeed < 30) newSpeed = 40;
          if (newSpeed > 105) newSpeed = 95;

          return {
            ...v,
            lat: Number((v.lat + dLat).toFixed(4)),
            lng: Number((v.lng + dLng).toFixed(4)),
            currentSpeed: newSpeed,
            fuelLevel: Math.max(15, v.fuelLevel - (Math.random() > 0.8 ? 1 : 0)),
            lastUpdate: 'አሁን (የቀጥታ)',
          };
        })
      );
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const handleTriggerEmergency = () => {
    setEmergencyModalOpen(true);
    if (audioAlertsEnabled) {
      playEmergencySiren();
    }
    speakText('አስቸኳይ ማስጠንቀቂያ! የትራንስፖርት ባለስልጣን የአደጋ እና ደህንነት መቆጣጠሪያ ክፍል ነቅቷል።', 'am');
  };

  const emergencyCount = vehicles.filter((v) => v.currentSpeed > v.speedLimit).length + 
    safetyReports.filter((r) => r.severity === 'critical' && r.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Universal Command Bar Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        audioAlertsEnabled={audioAlertsEnabled}
        setAudioAlertsEnabled={setAudioAlertsEnabled}
        emergencyCount={emergencyCount}
        onTriggerEmergency={handleTriggerEmergency}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onOpenShareModal={() => setShareModalOpen(true)}
        onOpenContractModal={() => setContractModalOpen(true)}
      />

      {/* Offline Toast Indicator */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-1.5 flex items-center justify-center gap-2 font-medium">
          <WifiOff className="w-3.5 h-3.5" />
          <span>ከኔትወርክ ውጪ ነዎት (Offline Mode) — የተቀመጡ መረጃዎች በስልክዎ/ኮምፒውተርዎ ላይ ያለምንም ችግር እየሰሩ ናቸው።</span>
        </div>
      )}

      {/* Main Applet Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardOverview
            vehicles={vehicles}
            queues={queues}
            reports={safetyReports}
            currentLang={currentLang}
            onNavigateTab={setCurrentTab}
            audioAlertsEnabled={audioAlertsEnabled}
            activeRole={activeRole}
            onRoleChange={setActiveRole}
            onOpenShareModal={() => setShareModalOpen(true)}
            onOpenContractModal={() => setContractModalOpen(true)}
          />
        )}

        {currentTab === 'liveTracking' && (
          <GpsLiveTracking
            vehicles={vehicles}
            currentLang={currentLang}
            audioAlertsEnabled={audioAlertsEnabled}
          />
        )}

        {currentTab === 'queueTurns' && (
          <QueueTurnManager
            queues={queues}
            vehicles={vehicles}
            currentLang={currentLang}
            onUpdateQueue={handleUpdateQueues}
            audioAlertsEnabled={audioAlertsEnabled}
          />
        )}

        {currentTab === 'vehicles' && (
          <VehiclesManagement
            vehicles={vehicles}
            currentLang={currentLang}
            onUpdateVehicles={handleUpdateVehicles}
          />
        )}

        {currentTab === 'drivers' && (
          <DriversManagement
            drivers={drivers}
            currentLang={currentLang}
            onUpdateDrivers={handleUpdateDrivers}
          />
        )}

        {currentTab === 'owners' && (
          <OwnersManagement
            owners={owners}
            currentLang={currentLang}
            onUpdateOwners={handleUpdateOwners}
          />
        )}

        {currentTab === 'routesTariffs' && (
          <RoutesTariffs
            routes={routes}
            currentLang={currentLang}
            onUpdateRoutes={handleUpdateRoutes}
          />
        )}

        {currentTab === 'paymentsSettlements' && (
          <PaymentsAndSettlements
            payments={payments}
            exitFees={exitFees}
            settlements={settlements}
            vehicles={vehicles}
            owners={owners}
            queues={queues}
            currentLang={currentLang}
            onUpdatePayments={handleUpdatePayments}
            onUpdateExitFees={handleUpdateExitFees}
            onUpdateSettlements={handleUpdateSettlements}
            onUpdateQueues={handleUpdateQueues}
            audioAlertsEnabled={audioAlertsEnabled}
          />
        )}

        {currentTab === 'safetyCitizenTips' && (
          <TrafficSafetyAndTips
            reports={safetyReports}
            vehicles={vehicles}
            currentLang={currentLang}
            onUpdateReports={handleUpdateReports}
            audioAlertsEnabled={audioAlertsEnabled}
          />
        )}

        {currentTab === 'voiceTranslator' && (
          <VoiceTranslatorIntercom
            currentLang={currentLang}
            audioAlertsEnabled={audioAlertsEnabled}
          />
        )}

        {currentTab === 'reportsExport' && (
          <ExcelReportsModal
            vehicles={vehicles}
            drivers={drivers}
            queues={queues}
            reports={safetyReports}
            currentLang={currentLang}
          />
        )}
      </main>

      {/* Social Share & Like Modal */}
      <SocialShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="የመንገድ እና ትራንስፖርት ባለስልጣን | National Transport & Fleet Command"
      />

      {/* Smart Contract Agreement Modal */}
      <SmartContractModal
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        audioAlertsEnabled={audioAlertsEnabled}
      />

      {/* Emergency SOS Protocol Modal */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-red-950 via-slate-900 to-slate-900 border-2 border-red-500 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-red-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600 rounded-2xl animate-bounce shadow-lg shadow-red-950">
                  <AlertOctagon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">አስቸኳይ የትራፊክ ደህንነት ማስጠንቀቂያ (SOS)</h3>
                  <p className="text-xs text-red-300">National Road Safety Emergency Hotline 991 / 907</p>
                </div>
              </div>
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-200">
              <div className="p-3 bg-red-900/30 border border-red-600/40 rounded-xl space-y-1">
                <span className="font-bold text-red-300 block">የተፈጠረው ማንቂያ:</span>
                <p>
                  በአገር አቀፍ አውራ ጎዳናዎች ላይ የፍጥነት ወሰን ጥሰት ወይም አደጋ ተከስቷል። በአቅራቢያ የሚገኙ የትራፊክ ፖሊስ ኬላዎች እና አምቡላንሶች በተጠንቀቅ እንዲቆሙ መልዕክት ተሰራጭቷል።
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase block">የትራፊክ ፖሊስ ፈጣን ጥሪ</span>
                  <span className="font-mono font-extrabold text-amber-400 text-lg">991</span>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase block">አምቡላንስ / ቀይ መስቀል</span>
                  <span className="font-mono font-extrabold text-red-400 text-lg">907</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
              >
                ማንቂያውን አጥፋ (Dismiss)
              </button>
              <button
                onClick={() => {
                  setCurrentTab('safetyCitizenTips');
                  setEmergencyModalOpen(false);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg"
              >
                ወደ ደህንነት ማዕከል ሂድ ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300 font-medium">የመንገድ እና ትራንስፖርት ባለስልጣን | National Transport & Fleet Command</span>
            <span className="text-slate-400">© 2026 PWA Live</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>ባጃጅ • ታክሲ • አውቶቡስ • ጭነት</span>
            <span>•</span>
            <span>ክፍያና ርክክብ</span>
            <span>•</span>
            <span>የቀጥታ ጂፒኤስ</span>
            <span>•</span>
            <span>8 ቋንቋዎች</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

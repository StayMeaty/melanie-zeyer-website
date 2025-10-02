/**
 * Content Migration Component for Tina CMS
 * 
 * React component providing a UI for migrating existing blog content to Tina format.
 * Includes localStorage migration, progress tracking, and error reporting.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  migrateLocalStorageDrafts,
  importDraftData,
  getMigrationStats,
  getMigratedDrafts,
  clearMigratedDrafts,
  restoreFromBackup,
  clearMigrationBackup,
  MigrationProgress,
  MigrationResult,
  MigrationError,
  TinaMigrationOptions
} from '../utils/contentMigration';

interface ContentMigrationProps {
  onClose: () => void;
  onMigrationComplete?: (result: MigrationResult) => void;
}

const ContentMigration: React.FC<ContentMigrationProps> = ({
  onClose,
  onMigrationComplete
}) => {
  // State management
  const [currentStep, setCurrentStep] = useState<'overview' | 'migrate' | 'import' | 'results'>('overview');
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrationOptions, setMigrationOptions] = useState<TinaMigrationOptions>({
    validateSchema: true,
    createBackup: true,
    preserveOriginal: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current migration statistics
  const [stats, setStats] = useState(() => getMigrationStats());
  
  const refreshStats = useCallback(() => {
    setStats(getMigrationStats());
  }, []);
  
  // Progress tracking callbacks
  const handleProgress = useCallback((progress: MigrationProgress) => {
    setMigrationProgress(progress);
  }, []);
  
  const handleError = useCallback((error: MigrationError) => {
    console.error('Migration error:', error);
  }, []);
  
  // Migrate localStorage drafts
  const handleMigrateLocalStorage = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setMigrationProgress(null);
    setCurrentStep('migrate');
    
    try {
      const result = await migrateLocalStorageDrafts({
        ...migrationOptions,
        onProgress: handleProgress,
        onError: handleError
      });
      
      setMigrationResult(result);
      setCurrentStep('results');
      refreshStats();
      onMigrationComplete?.(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setIsProcessing(false);
    }
  }, [migrationOptions, handleProgress, handleError, refreshStats, onMigrationComplete]);
  
  // Import external draft data
  const handleImportFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    setMigrationProgress(null);
    setCurrentStep('import');
    
    try {
      const fileContent = await file.text();
      const data = JSON.parse(fileContent);
      
      // Handle different file formats
      let draftsArray: unknown[];
      
      if (data.drafts && Array.isArray(data.drafts)) {
        // Export file format
        draftsArray = data.drafts;
      } else if (Array.isArray(data)) {
        // Direct array format
        draftsArray = data;
      } else {
        throw new Error('Invalid file format - expected array of drafts or export file');
      }
      
      const result = await importDraftData(draftsArray, {
        ...migrationOptions,
        onProgress: handleProgress,
        onError: handleError
      });
      
      setMigrationResult(result);
      setCurrentStep('results');
      refreshStats();
      onMigrationComplete?.(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [migrationOptions, handleProgress, handleError, refreshStats, onMigrationComplete]);
  
  // Clear migrated drafts
  const handleClearMigrated = useCallback(() => {
    if (confirm('Sind Sie sicher, dass Sie alle migrierten Entwürfe löschen möchten?')) {
      clearMigratedDrafts();
      refreshStats();
    }
  }, [refreshStats]);
  
  // Restore from backup
  const handleRestoreBackup = useCallback((backupKey: string) => {
    if (confirm('Möchten Sie wirklich vom Backup wiederherstellen? Dies überschreibt aktuelle Änderungen.')) {
      const success = restoreFromBackup(backupKey);
      if (success) {
        refreshStats();
        alert('Backup erfolgreich wiederhergestellt!');
      } else {
        alert('Fehler beim Wiederherstellen des Backups');
      }
    }
  }, [refreshStats]);
  
  // Clear backup
  const handleClearBackup = useCallback((backupKey: string) => {
    if (confirm('Backup löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      clearMigrationBackup(backupKey);
      refreshStats();
    }
  }, [refreshStats]);
  
  // Render progress display
  const renderProgress = () => {
    if (!migrationProgress) return null;
    
    const progressPercentage = migrationProgress.total > 0 
      ? Math.round((migrationProgress.completed / migrationProgress.total) * 100)
      : 0;
    
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Migration Progress</span>
          <span className="text-sm text-gray-500">{progressPercentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          <div>Bearbeitet: {migrationProgress.completed} / {migrationProgress.total}</div>
          <div>Fehlgeschlagen: {migrationProgress.failed}</div>
          {migrationProgress.currentItem && (
            <div>Aktuell: {migrationProgress.currentItem}</div>
          )}
        </div>
        
        {migrationProgress.errors.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-red-700 mb-2">Fehler:</h4>
            <div className="max-h-32 overflow-y-auto">
              {migrationProgress.errors.map((error, index) => (
                <div key={index} className="text-xs text-red-600 mb-1">
                  {error.item}: {error.error}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render migration results
  const renderResults = () => {
    if (!migrationResult) return null;
    
    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${migrationResult.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <h3 className={`font-semibold ${migrationResult.success ? 'text-green-800' : 'text-yellow-800'}`}>
            {migrationResult.success ? 'Migration erfolgreich!' : 'Migration mit Warnungen abgeschlossen'}
          </h3>
          
          <div className="mt-2 text-sm">
            <div>Erfolgreich migriert: {migrationResult.migratedCount}</div>
            <div>Fehlgeschlagen: {migrationResult.failedCount}</div>
            {migrationResult.backupData ? (
              <div>Backup erstellt: {String(migrationResult.backupData)}</div>
            ) : null}
          </div>
        </div>
        
        {migrationResult.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Fehler Details:</h4>
            <div className="max-h-48 overflow-y-auto">
              {migrationResult.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-700 mb-2">
                  <strong>{error.item}:</strong> {error.error}
                  <div className="text-xs text-red-600">{error.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentStep('overview')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Zurück zur Übersicht
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Schließen
          </button>
        </div>
      </div>
    );
  };
  
  // Render overview page
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Migrations-Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium">LocalStorage Entwürfe</div>
            <div className="text-2xl font-bold text-blue-600">{stats.localStorageDrafts}</div>
          </div>
          <div>
            <div className="font-medium">Migrierte Entwürfe</div>
            <div className="text-2xl font-bold text-green-600">{stats.migratedDrafts}</div>
          </div>
          <div>
            <div className="font-medium">Backups</div>
            <div className="text-2xl font-bold text-orange-600">{stats.backupKeys.length}</div>
          </div>
        </div>
      </div>
      
      {/* Migration Options */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Migrations-Optionen</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={migrationOptions.validateSchema}
              onChange={(e) => setMigrationOptions(prev => ({
                ...prev,
                validateSchema: e.target.checked
              }))}
              className="mr-2"
            />
            Schema-Validierung aktivieren
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={migrationOptions.createBackup}
              onChange={(e) => setMigrationOptions(prev => ({
                ...prev,
                createBackup: e.target.checked
              }))}
              className="mr-2"
            />
            Backup vor Migration erstellen
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={migrationOptions.preserveOriginal}
              onChange={(e) => setMigrationOptions(prev => ({
                ...prev,
                preserveOriginal: e.target.checked
              }))}
              className="mr-2"
            />
            Ursprüngliche Daten beibehalten
          </label>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3">Aktionen</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleMigrateLocalStorage}
              disabled={isProcessing || stats.localStorageDrafts === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              LocalStorage Entwürfe migrieren
            </button>
            
            <label className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
              JSON-Datei importieren
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
                disabled={isProcessing}
              />
            </label>
            
            <button
              onClick={refreshStats}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Status aktualisieren
            </button>
          </div>
        </div>
        
        {/* Migrated Drafts Management */}
        {stats.migratedDrafts > 0 && (
          <div>
            <h4 className="font-medium mb-2">Migrierte Entwürfe verwalten</h4>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const drafts = getMigratedDrafts();
                  console.log('Migrated drafts:', drafts);
                  alert(`${drafts.length} migrierte Entwürfe in der Konsole ausgegeben`);
                }}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                Entwürfe anzeigen
              </button>
              
              <button
                onClick={handleClearMigrated}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                Entwürfe löschen
              </button>
            </div>
          </div>
        )}
        
        {/* Backup Management */}
        {stats.backupKeys.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Backup-Verwaltung</h4>
            <div className="space-y-2">
              {stats.backupKeys.map(backupKey => (
                <div key={backupKey} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                  <span>{backupKey}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestoreBackup(backupKey)}
                      className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200"
                    >
                      Wiederherstellen
                    </button>
                    <button
                      onClick={() => handleClearBackup(backupKey)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Content Migration zu Tina CMS</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isProcessing}
            >
              ✕
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-700">{error}</div>
            </div>
          )}
          
          {/* Content based on current step */}
          {currentStep === 'overview' && renderOverview()}
          {(currentStep === 'migrate' || currentStep === 'import') && (
            <div>
              <h3 className="font-semibold mb-4">
                {currentStep === 'migrate' ? 'LocalStorage Migration' : 'JSON Import'}
              </h3>
              {renderProgress()}
              {isProcessing && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div className="mt-2 text-sm text-gray-600">Migration läuft...</div>
                </div>
              )}
            </div>
          )}
          {currentStep === 'results' && renderResults()}
        </div>
      </div>
    </div>
  );
};

export default ContentMigration;
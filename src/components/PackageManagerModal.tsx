import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import { PythonPackage, Language } from '../types';
import { translations } from '../translations';
import { safeFetch } from '../lib/api';

interface PackageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const CURATED_MARKETPLACE: Array<{
  name: string;
  category: string;
  desc: string;
  pypi: string;
}> = [
  { name: 'numpy', category: 'Numerical Computing', desc: 'Powerful N-dimensional array processing and linear algebra.', pypi: 'numpy' },
  { name: 'pandas', category: 'Data Analysis', desc: 'High-performance data manipulation and DataFrame structures.', pypi: 'pandas' },
  { name: 'matplotlib', category: 'Visualization', desc: 'Comprehensive library for creating static, animated, and interactive plots.', pypi: 'matplotlib' },
  { name: 'seaborn', category: 'Visualization', desc: 'Statistical data visualization based on matplotlib.', pypi: 'seaborn' },
  { name: 'scikit-learn', category: 'Machine Learning', desc: 'Machine learning tools for predictive data analysis.', pypi: 'scikit-learn' },
  { name: 'statsmodels', category: 'Econometrics & Stats', desc: 'Statistical models, hypothesis tests, and data exploration.', pypi: 'statsmodels' },
  { name: 'sympy', category: 'Symbolic Mathematics', desc: 'Python library for symbolic mathematics and calculus.', pypi: 'sympy' },
  { name: 'scipy', category: 'Scientific Computing', desc: 'Fundamental algorithms for scientific computing in Python.', pypi: 'scipy' },
  { name: 'plotly', category: 'Visualization', desc: 'Interactive graphing library for publication-quality graphs.', pypi: 'plotly' },
  { name: 'polars', category: 'Data Analysis', desc: 'Lightning-fast DataFrame library implemented in Rust.', pypi: 'polars' },
  { name: 'xgboost', category: 'Machine Learning', desc: 'Extreme gradient boosting algorithm for tabular models.', pypi: 'xgboost' },
  { name: 'torch', category: 'Deep Learning', desc: 'Tensors and Dynamic neural networks in Python with GPU acceleration.', pypi: 'torch' },
  { name: 'nltk', category: 'NLP', desc: 'Natural Language Toolkit for text processing and linguistics.', pypi: 'nltk' }
];

const INITIAL_PRELOADED_PACKAGES: PythonPackage[] = [
  { name: 'numpy', version: '2.2.6' },
  { name: 'pandas', version: '2.3.3' },
  { name: 'matplotlib', version: '3.10.9' },
  { name: 'seaborn', version: '0.13.2' },
  { name: 'scikit-learn', version: '1.7.2' },
  { name: 'scipy', version: '1.15.3' },
  { name: 'statsmodels', version: '0.15.0' },
  { name: 'sympy', version: '1.14.0' },
  { name: 'plotly', version: '7.0.0' }
];

export const PackageManagerModal: React.FC<PackageManagerModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [installedPackages, setInstalledPackages] = useState<PythonPackage[]>(INITIAL_PRELOADED_PACKAGES);
  const [loading, setLoading] = useState(false);
  const [installingName, setInstallingName] = useState<string | null>(null);
  const [customPackageInput, setCustomPackageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [installLog, setInstallLog] = useState<string | null>(null);
  const [failedPkg, setFailedPkg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace'>('installed');

  const t = translations[language];

  const fetchInstalled = async () => {
    setLoading(true);
    try {
      const res = await safeFetch<{ packages: PythonPackage[] }>('/api/packages/list', undefined, 15000);
      if (res.ok && res.data?.packages && res.data.packages.length > 0) {
        setInstalledPackages(res.data.packages);
      }
    } catch (e) {
      console.error('Failed to fetch packages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInstalled();
    }
  }, [isOpen]);

  const handleInstall = async (pkgName: string) => {
    const existing = installedPackages.find(p => p.name.toLowerCase() === pkgName.toLowerCase().trim());
    if (existing) {
      setInstallLog(`✓ ${pkgName} is already installed (v${existing.version}). Ready to use: 'import ${pkgName}'`);
      setFailedPkg(null);
      return;
    }

    setInstallingName(pkgName);
    setFailedPkg(null);
    setInstallLog(`Installing ${pkgName} via pip... please wait.`);
    try {
      const res = await safeFetch<any>('/api/packages/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageName: pkgName })
      }, 75000, 2);

      if (res.ok && res.data?.status === 'success') {
        setInstallLog(`✓ Successfully installed ${pkgName}!\n${res.data.stdout || ''}`);
        setFailedPkg(null);
        await fetchInstalled();
      } else {
        const errorMsg = res.data?.message || res.error || 'Server reconnecting. Please retry.';
        setInstallLog(`❌ Installation failed for ${pkgName}:\n${errorMsg}`);
        setFailedPkg(pkgName);
      }
    } catch (e: any) {
      setInstallLog(`❌ Error: ${e.message || 'Installation encountered an issue.'}`);
      setFailedPkg(pkgName);
    } finally {
      setInstallingName(null);
    }
  };

  const handleUninstall = async (pkgName: string) => {
    if (!confirm(`Are you sure you want to uninstall ${pkgName}?`)) return;
    setInstallingName(pkgName);
    setInstallLog(`Uninstalling ${pkgName}...`);
    try {
      const res = await safeFetch<any>('/api/packages/uninstall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageName: pkgName })
      }, 25000);

      if (res.ok && res.data?.status === 'success') {
        setInstallLog(`✓ Successfully uninstalled ${pkgName}`);
        await fetchInstalled();
      } else {
        setInstallLog(`❌ Uninstall failed: ${res.error || res.data?.message || 'Server timeout'}`);
      }
    } catch (e: any) {
      setInstallLog(`❌ Error: ${e.message || 'Failed to uninstall package.'}`);
    } finally {
      setInstallingName(null);
    }
  };

  if (!isOpen) return null;

  const installedSet = new Set(installedPackages.map(p => p.name.toLowerCase()));

  const filteredInstalled = installedPackages.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMarketplace = CURATED_MARKETPLACE.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-neutral-900 dark:text-white text-base">
              Python Package Manager (Pip)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Custom Install Bar */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Package className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customPackageInput}
                onChange={(e) => setCustomPackageInput(e.target.value)}
                placeholder="Enter PyPI package name (e.g. polars, xgboost)..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <button
              onClick={() => {
                if (customPackageInput.trim()) {
                  handleInstall(customPackageInput.trim());
                  setCustomPackageInput('');
                }
              }}
              disabled={!customPackageInput.trim() || !!installingName}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          </div>

          {/* Sub tabs & Search */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1 p-0.5 bg-neutral-200/60 dark:bg-neutral-800 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('installed')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'installed'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Installed ({installedPackages.length})
              </button>
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'marketplace'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Curated Marketplace
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter..."
                className="pl-8 pr-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs w-44 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Install progress output / logs */}
        {installLog && (
          <div className="p-3 bg-neutral-900 text-neutral-200 font-mono text-xs border-b border-neutral-800 flex flex-col gap-2">
            <div className="max-h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {installLog}
            </div>
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-800">
              {failedPkg && (
                <button
                  onClick={() => handleInstall(failedPkg)}
                  disabled={!!installingName}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-sans text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${installingName ? 'animate-spin' : ''}`} />
                  <span>Retry Install ({failedPkg})</span>
                </button>
              )}
              <button
                onClick={() => {
                  setInstallLog(null);
                  setFailedPkg(null);
                }}
                className="px-2 py-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 font-sans text-xs transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'installed' ? (
            loading ? (
              <div className="p-8 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading installed packages...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {filteredInstalled.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-800/30 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                        {pkg.name}
                      </span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-mono">
                        v{pkg.version}
                      </span>
                    </div>

                    <button
                      onClick={() => handleUninstall(pkg.name)}
                      disabled={installingName === pkg.name}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-500 transition-colors"
                      title="Uninstall package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Marketplace Tab */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {filteredMarketplace.map((card) => {
                const isInstalled = installedSet.has(card.name.toLowerCase());
                return (
                  <div
                    key={card.name}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex flex-col justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900 dark:text-white font-mono">
                          {card.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {card.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-neutral-200/60 dark:border-neutral-800/60">
                      {isInstalled ? (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Installed</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInstall(card.name)}
                          disabled={installingName === card.name}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Install</span>
                        </button>
                      )}

                      <a
                        href={`https://pypi.org/project/${card.pypi}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center gap-0.5"
                      >
                        <span>PyPI</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between text-xs text-neutral-500">
          <span>Packages are installed to isolated user environment.</span>
          <button
            onClick={fetchInstalled}
            className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reload List</span>
          </button>
        </div>
      </div>
    </div>
  );
};

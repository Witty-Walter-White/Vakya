import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud, AlertTriangle, Clock, FileWarning,
  TrendingUp, ShieldCheck, FilePlus, ArrowUpRight, Loader2, Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchContracts } from '../api/client';
import './Dashboard.css';


interface DBContract {
  id: string;
  user_id: string;
  filename: string;
  analyzed_at: string;
  risk_score: number | null;
  risk_level: string | null;
  status: string;
}

const riskColors: Record<string, string> = {
  critical: 'var(--risk-critical)',
  warning:  'var(--risk-warning)',
  safe:     'var(--risk-safe)',
};

const riskLevelMap = (level: string | null): string => {
  const l = (level || '').toLowerCase();
  if (l === 'high' || l === 'critical') return 'critical';
  if (l === 'medium' || l === 'warning') return 'warning';
  if (l === 'low' || l === 'safe') return 'safe';
  return 'warning';
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  review:      { label: 'In Review',   cls: 'badge-warning' },
  negotiating: { label: 'Negotiating', cls: 'badge-ai' },
  signed:      { label: 'Signed',      cls: 'badge-safe' },
  escalated:   { label: 'Escalated',   cls: 'badge-critical' },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });


const Dashboard = () => {
  const navigate = useNavigate();
  const { user, t, language } = useApp();

  const [contracts, setContracts] = useState<DBContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchContracts(user.id)
      .then(({ contracts: rows }) => setContracts(rows))
      .catch(() => setError('Could not load contracts. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      navigate('/app/analysis/new', { state: { file: e.target.files[0] } });
    }
  };

  
  const criticalCount  = contracts.filter(c => riskLevelMap(c.risk_level) === 'critical').length;
  const warningCount   = contracts.filter(c => riskLevelMap(c.risk_level) === 'warning').length;
  const safeCount      = contracts.filter(c => riskLevelMap(c.risk_level) === 'safe').length;
  const pendingReview  = contracts.filter(c => c.status === 'review').length;

  return (
    <div className="dashboard">
      <div className="dashboard-glow page-glow" />

      <div className="dashboard-header">
        <div>
          <div className="page-eyebrow">
            <span className="page-eyebrow-dot" />
            Case Files
          </div>
          <h2 className="dashboard-title gradient-text">{t('dashboard.title')}</h2>
          <p className="text-sm text-secondary" style={{ marginTop: 4 }}>
            {loading && t('dashboard.loading')}
          </p>
        </div>
        <div className="dashboard-header-actions">

          <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
            <UploadCloud size={14} /> {t('dashboard.uploadContract')}
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--risk-critical-bg)', color: 'var(--risk-critical)', border: '1px solid var(--risk-critical-border)' }}>
            <FileWarning size={16} />
          </div>
          <div>
            <div className="stat-card-value">{loading ? '–' : criticalCount}</div>
            <div className="stat-card-label">{t('dashboard.criticalRisksCard')}</div>
          </div>
          <ArrowUpRight size={14} className="stat-card-trend" />
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--risk-warning-bg)', color: 'var(--risk-warning)', border: '1px solid var(--risk-warning-border)' }}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <div className="stat-card-value">{loading ? '–' : warningCount}</div>
            <div className="stat-card-label">{t('dashboard.moderateRiskCard')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--ai-glow)', color: 'var(--ai-secondary)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <FilePlus size={16} />
          </div>
          <div>
            <div className="stat-card-value">{loading ? '–' : contracts.length}</div>
            <div className="stat-card-label">{t('dashboard.totalAnalysedCard')}</div>
          </div>
        </div>
      </div>

      
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px', gap: '12px', color: 'var(--text-secondary)' }}>
          <Loader2 size={20} className="animate-spin" />
          <span>{t('dashboard.loadingContracts')}</span>
        </div>
      ) : error ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--risk-critical)' }}>
          {error}
        </div>
      ) : contracts.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', gap: '16px', color: 'var(--text-secondary)' }}>
          <Database size={32} style={{ opacity: 0.4 }} />
          <p style={{ fontSize: 15 }}>{t('dashboard.noContracts')}</p>
        </div>
      ) : (
        <div className="contracts-table-wrapper">
          <table className="contracts-table">
            <thead>
              <tr>
                <th>{t('dashboard.tableDoc')}</th>
                <th>{t('dashboard.tableRiskScore')}</th>
                <th>{t('dashboard.tableRiskLevel')}</th>
                <th>{t('dashboard.tableStatus')}</th>
                <th>{t('dashboard.tableAnalysed')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => {
                const level = riskLevelMap(c.risk_level);
                const score = c.risk_score ?? 0;
                const badge = statusBadge[c.status] ?? { label: c.status, cls: 'badge-warning' };
                return (
                  <tr
                    key={c.id}
                    className="contracts-table-row"
                    onClick={() => navigate(`/app/analysis/${c.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div className="doc-cell">
                        <div className="doc-icon">
                          <FileWarning size={14} />
                        </div>
                        <div>
                          <div className="doc-name">{c.filename}</div>
                          <div className="doc-type text-xs text-tertiary">
                            {c.analyzed_at ? formatDate(c.analyzed_at) : '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="risk-score-cell">
                        <div className="risk-score-bar-track">
                          <div
                            className="risk-score-bar-fill"
                            style={{ width: `${score}%`, background: riskColors[level] }}
                          />
                        </div>
                        <span className="risk-score-num" style={{ color: riskColors[level] }}>
                          {score}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${level}`}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${badge.cls}`}>{badge.label}</span>
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-tertiary text-sm">
                        <Clock size={12} /> {c.analyzed_at ? formatDate(c.analyzed_at) : '—'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); navigate(`/app/analysis/${c.id}`); }}
                      >
                        {t('dashboard.view')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      
      <label className="upload-drop-zone">
        <input type="file" hidden accept=".pdf,.doc,.docx,image/*" onChange={handleFileChange} />
        <UploadCloud size={20} className="upload-zone-icon" />
        <div className="upload-zone-text">
          <span className="text-secondary">{t('dashboard.dropText')}</span>
          <span className="text-ai">{t('dashboard.browseFiles')}</span>
        </div>
        <span className="text-tertiary text-sm">{t('dashboard.fileTypes')}</span>
        <div className="upload-zone-langs">
          <span className={`lang-pill ${language === 'en' ? 'active' : ''}`}>English</span>
          <span className={`lang-pill ${language === 'hi' ? 'active' : ''}`}>हिंदी</span>
        </div>
      </label>
    </div>
  );
};

export default Dashboard;

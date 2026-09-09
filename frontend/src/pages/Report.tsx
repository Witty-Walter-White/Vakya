import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft, Download, ShieldAlert, CheckCircle2, AlertTriangle,
  FileWarning, Scale, MapPin, Gavel, FileText, Loader2
} from 'lucide-react';
import './Report.css';
import { generateReport, API_BASE_URL } from '../api/client';
import { useApp } from '../context/AppContext';

const clauseCategories = [
  { label: 'Payment', pct: 22, color: '#ef4444' },
  { label: 'Termination', pct: 15, color: '#f59e0b' },
  { label: 'Confidentiality', pct: 12, color: '#10b981' },
  { label: 'Liability', pct: 18, color: '#ef4444' },
  { label: 'Jurisdiction', pct: 8, color: '#64748b' },
  { label: 'Other', pct: 25, color: '#a9722f' },
];

const actionItems = [
  {
    severity: 'critical',
    icon: <FileWarning size={18} />,
    title: 'Renegotiate Payment Terms',
    desc: 'Demand Net-30 payment and objective written-dispute criteria. Reference MSME Delayed Payments Act, 2006.',
  },
  {
    severity: 'warning',
    icon: <Scale size={18} />,
    title: 'Extend Termination Notice',
    desc: 'Counter-propose 30-day notice with pro-rata payment for completed work up to termination date.',
  },
  {
    severity: 'missing',
    icon: <MapPin size={18} />,
    title: 'Insert Jurisdiction Clause',
    desc: 'Add the AI-generated clause specifying Indian law and your home city as seat of jurisdiction.',
  },
  {
    severity: 'missing',
    icon: <Gavel size={18} />,
    title: 'Add GST Compliance Clause',
    desc: 'Interstate SaaS supply without a GST clause creates tax liability ambiguity. Add explicit GST responsibility.',
  },
];

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useApp();
  const [isExporting, setIsExporting] = useState(false);

  const analyzedClauses = location.state?.analyzedClauses || [];
  const filename = location.state?.filename || 'Vendor_Agreement_TechCorp.pdf';

  const handleExport = async () => {
    if (!analyzedClauses.length) return;
    
    setIsExporting(true);
    try {
      const criticalCount = analyzedClauses.filter((c: any) => c.risk === 'critical').length;
      const warningCount = analyzedClauses.filter((c: any) => c.risk === 'warning').length;
      
      const summary = { 
        executive_summary: `This report provides an automated AI-driven analysis of ${filename}. A total of ${analyzedClauses.length} clauses were reviewed for commercial risk, legal compliance, and one-sided terms.`,
        overall_risk_assessment: `The document contains ${criticalCount} critical risks and ${warningCount} moderate risks. ${criticalCount > 0 ? "Immediate renegotiation is strongly recommended for the critical clauses before signing." : "The risk profile is generally acceptable, though some moderate clauses could be further optimized."}`,
        key_recommendations: analyzedClauses
          .filter((c: any) => c.risk === 'critical' || c.risk === 'warning')
          .slice(0, 5)
          .map((c: any) => `Renegotiate "${c.title}": ${c.suggestion?.en || 'Review the suggested redline in the detailed analysis.'}`)
      };
      const legacyPayload = analyzedClauses.map((c: any) => ({
        clause_id: c.id,
        text: c.text || c.original || "",
        clause_info: { category: c.title || "Unknown" },
        risk_info: {
          risk_level: c.risk ? c.risk.charAt(0).toUpperCase() + c.risk.slice(1) : "Unknown",
          risk_explanation: c.issue?.en || "No specific issue identified.",
          unfair_one_sided_terms: []
        },
        compliance_info: { compliance_issues: "" },
        negotiation_info: {
          improved_wording: c.rewrite || c.suggestion?.en || "No change needed",
          counter_terms: []
        }
      }));

      const res = await generateReport(legacyPayload, summary);
      
      if (res.report_path) {
        
        const downloadUrl = `${API_BASE_URL}/report/download?path=${encodeURIComponent(res.report_path)}`;
        
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'Analysis_Report.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="report-page">
      
      <div className="report-header">
        <button className="btn-back" onClick={() => navigate(`/app/analysis/${id}`)}>
          <ArrowLeft size={15} /> {t('report.back')}
        </button>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
          {isExporting ? t('report.exporting') : t('report.exportDocx')}
        </button>
      </div>

      <div className="report-body">
        
        <div className="report-title-block">
          <div className="report-brand">
            <ShieldAlert size={20} className="text-ai" />
            <span>Vakya</span>
          </div>
          <h2 className="report-doc-name">{filename}</h2>
          <div className="report-meta">
            <span className="text-tertiary text-sm">{t('report.analyzedMeta')}</span>
            <span className="badge badge-critical report-risk-badge">
              <ShieldAlert size={12} /> {t('report.riskScore')} 72 / 100
            </span>
          </div>
        </div>

        
        <section className="report-section">
          <h4 className="report-section-title">{t('report.execSummary')}</h4>
          <div className="report-summary-card">
            <p>
              <strong className="text-critical">High Risk (72/100)</strong>
              {' '}
              {t('report.execSummaryText1')}
            </p>
            <p style={{ marginTop: 12 }}>
              {t('report.execSummaryText2')}
            </p>
          </div>
        </section>

        
        <div className="report-stat-grid">
          <div className="report-stat report-stat--critical">
            <AlertTriangle size={20} />
            <div className="report-stat-val">2</div>
            <div className="report-stat-label">{t('report.criticalRisks')}</div>
          </div>
          <div className="report-stat report-stat--warning">
            <AlertTriangle size={20} />
            <div className="report-stat-val">1</div>
            <div className="report-stat-label">{t('report.moderateRisks')}</div>
          </div>
          <div className="report-stat report-stat--missing">
            <FileText size={20} />
            <div className="report-stat-val">4</div>
            <div className="report-stat-label">{t('report.missingClauses')}</div>
          </div>
          <div className="report-stat report-stat--safe">
            <CheckCircle2 size={20} />
            <div className="report-stat-val">1</div>
            <div className="report-stat-label">{t('analysis.safe')}</div>
          </div>
        </div>

        
        <section className="report-section">
          <h4 className="report-section-title">{t('report.clauseDist')}</h4>
          <div className="clause-dist-grid">
            {clauseCategories.map(cat => (
              <div key={cat.label} className="clause-dist-row">
                <span className="clause-dist-label text-secondary text-sm">{cat.label}</span>
                <div className="clause-dist-bar-track">
                  <div
                    className="clause-dist-bar-fill"
                    style={{ width: `${cat.pct}%`, background: cat.color }}
                  />
                </div>
                <span className="clause-dist-pct text-tertiary text-sm">{cat.pct}%</span>
              </div>
            ))}
          </div>
        </section>

        
        <section className="report-section">
          <h4 className="report-section-title">{t('report.requiredActions')}</h4>
          <div className="action-list">
            {actionItems.map((item, i) => (
              <div key={i} className={`action-item action-item--${item.severity}`}>
                <div className={`action-icon action-icon--${item.severity}`}>
                  {item.icon}
                </div>
                <div>
                  <div className="action-title">{item.title}</div>
                  <p className="text-sm text-secondary" style={{ marginTop: 4, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
                <span className={`badge badge-${item.severity === 'critical' ? 'critical' : item.severity === 'warning' ? 'warning' : 'missing'}`} style={{ flexShrink: 0 }}>
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </section>

        
        <div className="report-footer">
          <p className="text-tertiary text-sm">
            {t('report.footer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;

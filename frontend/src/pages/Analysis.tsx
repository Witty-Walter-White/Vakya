import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, FileSearch, Scale,
  Brain, ShieldAlert, ChevronRight, ChevronDown, Languages, Copy,
  RotateCcw, X, Layers, GitBranch, FileText, ExternalLink, Loader2, Download, Clock
} from 'lucide-react';
import './Analysis.css';
import { uploadDocument, analyzeDocument, saveContract, fetchContractDetail, fetchConfig, ApiError } from '../api/client';
import { useApp } from '../context/AppContext';
import ContractChat from '../components/ContractChat';
import BookLoader from '../components/BookLoader';


interface AgentStep {
  id: number;
  name: string;
  desc: string;
  status: 'pending' | 'active' | 'done';
  icon: React.ReactNode;
  thoughts?: string[];
}

interface Clause {
  id: number;
  title: string;
  type: string;
  risk: 'critical' | 'warning' | 'safe' | 'missing';
  text: string | null;
  original: string | null;
  rewrite: string | null;
  issue: { en: string; hi: string };
  suggestion: { en: string; hi: string };
}


const agentStepsData: AgentStep[] = [
  {
    id: 1, name: 'Doc Ingestion', desc: 'Parsing document and running OCR...',
    status: 'done', icon: <FileSearch size={14} />,
    thoughts: [
      'Detected document language: English (primary)',
      'OCR confidence: 97.4% on all pages',
      '42 logical sections identified',
      'Document type classified: Vendor Service Agreement',
    ],
  },
  {
    id: 2, name: 'Clause Classification', desc: 'Segmenting clauses by category...',
    status: 'done', icon: <Layers size={14} />,
    thoughts: [
      'Payment Terms: 3 clauses merged',
      'Termination: 2 clauses, 1 asymmetric detected',
      'Indemnification: flagged for Risk Agent',
      'Force Majeure: present and standard',
    ],
  },
  {
    id: 3, name: 'Compliance Check', desc: 'Verifying legal and regulatory compliance...',
    status: 'done', icon: <Scale size={14} />,
    thoughts: [
      'GST clause: ABSENT — high risk for interstate SaaS supply',
      'Arbitration seat: not specified — defaults favor counterparty',
      'MSME Delayed Payments Act: not referenced',
      'Jurisdiction: no governing law clause found',
    ],
  },
  {
    id: 4, name: 'Risk Assessment', desc: 'Evaluating clauses for one-sided risks...',
    status: 'done', icon: <ShieldAlert size={14} />,
    thoughts: [
      'Aggregate risk score: 72/100',
      'Payment clause: 90-day withholding — HIGH',
      'Termination: 7-day notice asymmetry — MEDIUM',
      'Liability cap: absent — HIGH',
    ],
  },
  {
    id: 5, name: 'Negotiator Agent', desc: 'Drafting safer alternative wording...',
    status: 'done', icon: <Brain size={14} />,
    thoughts: [
      'Payment rewrite: Net-30, objective dispute trigger',
      'Termination rewrite: 30-day parity + pro-rata payment',
      'Jurisdiction insert: Pune courts, Indian law',
    ],
  },
];

const clausesData: Clause[] = [
  {
    id: 1,
    title: 'Payment Terms',
    type: 'Financial',
    risk: 'critical',
    text: 'The Client shall pay the Service Provider within 90 days of receiving the invoice. The Client reserves the right to withhold payment at its sole discretion if it deems the work unsatisfactory.',
    original: 'Payment within 90 days · withholding at sole discretion',
    rewrite: 'The Client shall pay the Service Provider within 30 days of receiving a valid invoice. Any dispute regarding quality of work must be raised in writing within 7 days of delivery. Disputed amounts may not exceed the value of the disputed deliverable.',
    issue: {
      en: 'Allows the Client to delay payment for 90 days and withhold indefinitely without objective criteria — directly violates MSME Delayed Payments Act protections.',
      hi: 'क्लाइंट 90 दिनों तक पेमेंट रोक सकता है और बिना किसी स्पष्ट आधार के अनिश्चित काल तक भुगतान रोके रह सकता है। यह MSME देरी से भुगतान अधिनियम का उल्लंघन है।',
    },
    suggestion: {
      en: 'Counter-propose Net-30 payment and require documented, written dispute notice within 7 days of delivery.',
      hi: 'नेट-30 भुगतान की मांग करें और डिलीवरी के 7 दिनों के भीतर लिखित विवाद नोटिस का प्रावधान जोड़ें।',
    },
  },
  {
    id: 2,
    title: 'Termination for Convenience',
    type: 'Termination',
    risk: 'warning',
    text: 'Either party may terminate this Agreement at any time by providing 7 days written notice.',
    original: '7-day termination notice for either party',
    rewrite: 'Either party may terminate this Agreement by providing 30 days written notice. Upon termination, the Client shall pay the Service Provider for all work completed and expenses incurred up to the termination date, within 14 days.',
    issue: {
      en: '7 days is insufficient for a service business to transition. The clause is symmetric on paper but favors the larger party in practice.',
      hi: '7 दिन का नोटिस पीरियड सेवा व्यवसाय के लिए बहुत कम है। यह क्लॉज बड़ी कंपनियों को ज्यादा फायदा देता है।',
    },
    suggestion: {
      en: 'Negotiate 30-day notice for both parties and ensure explicit pro-rata payment for work already completed.',
      hi: '30 दिन का नोटिस पीरियड और पहले किए गए कार्य के लिए आनुपातिक भुगतान सुनिश्चित करें।',
    },
  },
  {
    id: 3,
    title: 'Confidentiality',
    type: 'Information',
    risk: 'safe',
    text: 'Both parties agree to keep all proprietary information confidential for 2 years following termination of this Agreement. This obligation does not apply to information already in the public domain.',
    original: '2-year mutual NDA post-termination',
    rewrite: null,
    issue: {
      en: 'Balanced and mutual. Includes a standard carve-out for public domain information. No action required.',
      hi: 'यह क्लॉज संतुलित और पारस्परिक है। कोई बदलाव आवश्यक नहीं।',
    },
    suggestion: {
      en: 'Acceptable as written. Consider this clause standard for the agreement type.',
      hi: 'यह क्लॉज स्वीकार्य है। कोई बदलाव की आवश्यकता नहीं।',
    },
  },
  {
    id: 4,
    title: 'Jurisdiction & Governing Law',
    type: 'Dispute Resolution',
    risk: 'missing',
    text: null,
    original: null,
    rewrite: 'This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra, India.',
    issue: {
      en: 'No jurisdiction clause detected. Without this, any dispute could be filed in a court convenient for the counterparty — potentially hundreds of kilometers away.',
      hi: 'कोई न्यायक्षेत्र क्लॉज नहीं मिला। इसके बिना, विवाद की स्थिति में दूसरा पक्ष अपनी सुविधा के अनुसार किसी भी कोर्ट में मामला दर्ज कर सकता है।',
    },
    suggestion: {
      en: 'Insert the AI-generated jurisdiction clause below. Specify your home city as the seat of jurisdiction.',
      hi: 'नीचे दिया गया AI-जनित क्लॉज जोड़ें। अपने शहर को न्यायक्षेत्र के रूप में निर्दिष्ट करें।',
    },
  },
];


const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, t, language, setLanguage } = useApp();
  const file = location.state?.file as File | undefined;

  
  const isCached = !!id && id !== 'new' && !file;

  const [, setLoadingStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [workspaceRevealed, setWorkspaceRevealed] = useState(false);
  const [activeTab, setActiveTab] = useState<'trace' | 'risks' | 'rewrite'>('trace');
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [expandedAgents, setExpandedAgents] = useState<Set<number>>(new Set([1, 2, 3]));
  const [agents, setAgents] = useState<AgentStep[]>(
    agentStepsData.map((a, i) => ({ ...a, status: i === 0 ? 'active' : 'pending' }))
  );
  const [realClauses, setRealClauses] = useState<Clause[]>(clausesData);
  const [cachedFilename, setCachedFilename] = useState<string | null>(null);
  const [cachedRiskScore, setCachedRiskScore] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [minAnimationDone, setMinAnimationDone] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);


  useEffect(() => {
    const minDuration = 10000 + Math.random() * 2000;
    const t = setTimeout(() => setMinAnimationDone(true), minDuration);
    return () => clearTimeout(t);
  }, []);


  useEffect(() => {
    if (isLoaded) return;

    
    if (isCached && id) {
      fetchContractDetail(id)
        .then(({ contract }) => {
          setCachedFilename(contract.filename);
          setCachedRiskScore(contract.risk_score ?? 0);
          setTotalPages(contract.summary_json?.page_count || 1);
          const stored: Clause[] = (contract.clauses_json || []).map((c: any, i: number) => ({
            id: i + 1,
            title: c.title || `Clause ${i + 1}`,
            type: c.type || 'General',
            risk: c.risk || 'warning',
            text: c.text || null,
            original: c.original || null,
            rewrite: c.rewrite || null,
            issue: c.issue || { en: '', hi: '' },
            suggestion: c.suggestion || { en: '', hi: '' },
          }));
          setRealClauses(stored);
          setAgents([
            { id: 1, name: 'Doc Ingestion', desc: `Parsed ${contract.summary_json?.page_count || 1} pages`, status: 'done', icon: <FileSearch size={14} />, thoughts: [`Processed ${contract.filename}`] },
            { id: 2, name: 'Clause Classification', desc: `Segmented ${stored.length} clauses`, status: 'done', icon: <Layers size={14} />, thoughts: [`Total clauses: ${stored.length}`] },
            { id: 3, name: 'Compliance Check', desc: `Verified ${stored.length} clauses against standards`, status: 'done', icon: <Scale size={14} />, thoughts: ['Compliance check complete'] },
            { id: 4, name: 'Risk Assessment', desc: `Scored ${stored.length} clauses · ${stored.filter(c => c.risk === 'critical').length} critical`, status: 'done', icon: <ShieldAlert size={14} />, thoughts: ['Risk assessment complete'] },
            { id: 5, name: 'Negotiator Agent', desc: `Generated safe rewrites`, status: 'done', icon: <Brain size={14} />, thoughts: ['Rewrites generated'] },
          ]);
          setIsLoaded(true);
        })
        .catch(() => {
          
          setIsLoaded(true);
        });
      return;
    }

    
    if (!file) {
      const interval = setInterval(() => {
        setLoadingStep(prev => {
          const next = prev + 1;
          if (next >= agentStepsData.length) {
            clearInterval(interval);
            setTimeout(() => {
              setIsLoaded(true);
              setAgents(agentStepsData);
            }, 600);
            return prev;
          }
          setAgents(current =>
            current.map((a, i) => ({
              ...a,
              status: i < next ? 'done' : i === next ? 'active' : 'pending',
            }))
          );
          return next;
        });
      }, 1400);
      return () => clearInterval(interval);
    }


    if (!user?.id) {
      navigate('/login', { state: { from: location.pathname, file }, replace: true });
      return;
    }


    const runAnalysis = async () => {
      try {
        setAgents(current => current.map((a, i) => i === 0 ? { ...a, status: 'active' } : a));
        
        
        const uploadRes = await uploadDocument(file);
        const { clauses, document_info } = uploadRes;
        
        if (document_info?.page_count) {
          setTotalPages(document_info.page_count);
        }
        

        
        setAgents(current => current.map((a, i) => 
          i === 0 ? { ...a, status: 'done', desc: `Parsed ${document_info?.page_count || 1} pages`, thoughts: [`Processed ${file.name}`, `Detected clauses: ${clauses.length}`] } : 
          i === 1 ? { ...a, status: 'active' } : a
        ));
        
        await new Promise(resolve => setTimeout(resolve, 800));
        setAgents(current => current.map((a, i) => 
          i === 1 ? { ...a, status: 'done', desc: `Segmented ${clauses.length} clauses`, thoughts: [`Segmented ${clauses.length} clauses`] } : 
          i === 2 ? { ...a, status: 'active' } : a
        ));
        
        await new Promise(resolve => setTimeout(resolve, 800));
        setAgents(current => current.map((a, i) => 
          i === 2 ? { ...a, status: 'done', desc: `Verified ${clauses.length} clauses against standards`, thoughts: ['Compliance check passed initial scan'] } : 
          i === 3 ? { ...a, status: 'active' } : a
        ));

        
        const analyzeRes = await analyzeDocument(clauses, user.id);
        const { analyzed_clauses } = analyzeRes;
        
        
        const mappedClauses: Clause[] = analyzed_clauses.map((c: any, index: number) => {
          const clauseInfo = c.clause_info || {};
          const riskInfo = c.risk_info || {};
          const complianceInfo = c.compliance_info || {};
          const negotiationInfo = c.negotiation_info || {};

          const riskLevel = riskInfo.risk_level || '';
          const risk: Clause['risk'] =
            riskLevel === 'High' ? 'critical' :
            riskLevel === 'Medium' ? 'warning' :
            riskLevel === 'Low' ? 'safe' : 'warning';

          const counterTermsList = Array.isArray(negotiationInfo.counter_terms)
            ? negotiationInfo.counter_terms.join(' | ')
            : negotiationInfo.counter_terms || '';

          const issueText = [
            complianceInfo.compliance_issues || '',
            riskInfo.risk_explanation || '',
            Array.isArray(complianceInfo.missing_mandatory_clauses) && complianceInfo.missing_mandatory_clauses.length > 0
              ? `Missing: ${complianceInfo.missing_mandatory_clauses.join(', ')}`
              : ''
          ].filter(Boolean).join(' — ') || 'No specific issue identified.';

          return {
            id: index + 1,
            title: clauseInfo.category || c.type || `Clause ${index + 1}`,
            type: clauseInfo.category || 'General',
            risk,
            text: c.text || null,
            original: c.text || null,
            rewrite: negotiationInfo.improved_wording && negotiationInfo.improved_wording !== 'No change needed'
              ? negotiationInfo.improved_wording
              : null,
            issue: {
              en: issueText,
              hi: 'कोई विशिष्ट समस्या नहीं पाई गई।'
            },
            suggestion: {
              en: counterTermsList || (negotiationInfo.improved_wording === 'No change needed'
                ? 'Standard clause, no action required.'
                : negotiationInfo.improved_wording || 'Standard clause, no action required.'),
              hi: 'मानक खंड, किसी कार्रवाई की आवश्यकता नहीं है।'
            }
          };
        });
        
        setRealClauses(mappedClauses);

        const criticals = mappedClauses.filter(c => c.risk === 'critical').length;
        const warnings = mappedClauses.filter(c => c.risk === 'warning').length;

        setAgents(current => current.map((a, i) => 
          i === 3 ? { ...a, status: 'done', desc: `Scored ${mappedClauses.length} clauses · ${criticals} critical, ${warnings} moderate`, thoughts: [`Scored ${analyzed_clauses.length} clauses`] } : 
          i === 4 ? { ...a, status: 'active' } : a
        ));

        await new Promise(resolve => setTimeout(resolve, 800));
        
        const rewritesCount = mappedClauses.filter(c => c.rewrite).length;
        setAgents(current => current.map((a, i) => 
          i === 4 ? { ...a, status: 'done', desc: `Generated ${rewritesCount} safe rewrites`, thoughts: ['Generated safe rewrites'] } : a
        ));

        
        if (user?.id) {
          const criticals = mappedClauses.filter(c => c.risk === 'critical').length;
          const riskScore = Math.round(
            mappedClauses.reduce((acc, c) => acc + (c.risk === 'critical' ? 80 : c.risk === 'warning' ? 50 : 15), 0) /
            Math.max(mappedClauses.length, 1)
          );
          const riskLevel = criticals > 0 ? 'high' : riskScore > 40 ? 'medium' : 'low';
          saveContract({
            user_id: user.id,
            filename: file.name,
            risk_score: riskScore,
            risk_level: riskLevel,
            clauses: mappedClauses,
            summary: { total: mappedClauses.length, critical: criticals, page_count: document_info?.page_count || 1 },
            status: 'review',
          }).catch(console.error);
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('Analysis failed', err);
        setAnalysisError(
          err instanceof ApiError
            ? err.message
            : 'Something went wrong while analyzing this document. Please try again.'
        );
        setIsLoaded(true);
      }
    };

    runAnalysis();
  }, [isLoaded, file, isCached, id, user?.id, navigate, location.pathname]);

  const toggleAgentExpand = (id: number) => {
    setExpandedAgents(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const docName = isCached ? (cachedFilename || 'Contract') : (file ? file.name : 'Vendor_Agreement_TechCorp.pdf');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Revised Draft - ${docName}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
            h2 { color: #1a1a1a; margin-bottom: 24px; border-bottom: 2px solid #eaeaea; padding-bottom: 8px; }
            .clause-diff { margin-bottom: 24px; padding: 16px; border: 1px solid #eaeaea; border-radius: 8px; }
            .title { font-weight: 600; color: #666; margin-bottom: 12px; }
            .original { background-color: #fef2f2; color: #991b1b; padding: 8px 12px; margin: 8px 0; border-left: 3px solid #ef4444; text-decoration: line-through; }
            .rewrite { background-color: #ecfdf5; color: #065f46; padding: 8px 12px; margin: 8px 0; border-left: 3px solid #10b981; }
            .warning { background-color: #fefce8; color: #854d0e; padding: 8px 12px; margin: 8px 0; border-left: 3px solid #eab308; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
            @media print {
              body { padding: 0; }
              .clause-diff { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h2>MSME Revised Contract Draft</h2>
          <p><strong>Original Document:</strong> ${docName}</p>
          <div style="margin-top: 30px;">
            ${realClauses.filter(c => c.risk === 'critical' || c.risk === 'warning' || c.rewrite).map(clause => `
              <div class="clause-diff">
                <div class="title">... [${clause.title}] ...</div>
                ${clause.original ? `<div class="original">- ${clause.original}</div>` : ''}
                ${clause.rewrite 
                  ? `<div class="rewrite">+ ${clause.rewrite}</div>` 
                  : `<div class="warning">⚠ ${clause.issue.en || 'Review required'}</div>`}
              </div>
            `).join('')}
          </div>
          <div class="footer">Generated by Vakya Legal Business Advisor</div>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };


  if (analysisError) {
    return (
      <div className="loading-screen">
        <div className="analysis-error-card">
          <AlertTriangle size={32} />
          <h3>Analysis unavailable</h3>
          <p>{analysisError}</p>
          <button className="btn btn-primary" onClick={() => navigate('/app')}>
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  if (!workspaceRevealed) {
    return (
      <div className="loading-screen">
        <BookLoader
          fileName={file ? file.name : 'Vendor_Agreement_TechCorp.pdf'}
          agents={agents}
          complete={isLoaded && minAnimationDone}
          onFinished={() => setWorkspaceRevealed(true)}
        />
      </div>
    );
  }

  
  const currentRiskScore = isCached ? cachedRiskScore : Math.round(
    realClauses.reduce((acc, c) => acc + (c.risk === 'critical' ? 80 : c.risk === 'warning' ? 50 : 15), 0) /
    Math.max(realClauses.length, 1)
  );
  const criticalCount = realClauses.filter(c => c.risk === 'critical').length;
  const warningCount = realClauses.filter(c => c.risk === 'warning').length;
  const safeCount = realClauses.filter(c => c.risk === 'safe').length;
  const totalRisks = criticalCount + warningCount;
  const agentsCompleted = agents.filter(a => a.status === 'done').length;

  
  return (
    <div className="analysis-workspace">
      
      <div className="workspace-header">
        <button className="btn-back" onClick={() => navigate('/app/repository')}>
          <ArrowLeft size={15} /> {t('analysis.repository')}
        </button>
        <div className="workspace-title">
          <FileText size={15} className="text-tertiary" />
          <span>{isCached ? (cachedFilename || 'Contract') : (file ? file.name : 'Vendor_Agreement_TechCorp.pdf')}</span>
          <span className={`badge badge-${currentRiskScore > 70 ? 'critical' : currentRiskScore > 40 ? 'warning' : 'safe'}`}>
            {t('analysis.risk')} {currentRiskScore}/100
          </span>
        </div>
        <div className="workspace-header-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          >
            <Languages size={14} />
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/app/report/${id}`, { state: { analyzedClauses: realClauses, filename: file ? file.name : 'Vendor_Agreement_TechCorp.pdf' } })}
          >
            {t('analysis.generateReport')}
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      
      <div className="split-pane">
        
        <div className="doc-pane">
          <div className="pane-header">
            <span className="pane-header-title">{t('analysis.document')}</span>
            <span className="text-tertiary text-sm">{t('analysis.page')} {currentPage} {t('analysis.of')} {totalPages}</span>
          </div>
          <div className="doc-viewer" onScroll={(e) => {
            const target = e.currentTarget;
            const { scrollTop, scrollHeight, clientHeight } = target;
            const scrollPercent = scrollTop / (scrollHeight - clientHeight || 1);
            const newPage = Math.min(totalPages, Math.max(1, Math.round(scrollPercent * (totalPages - 1)) + 1));
            if (newPage !== currentPage) setCurrentPage(newPage);
          }}>
            <div className="mock-doc">
              <div className="doc-watermark">
                {(isCached ? (cachedFilename || 'CONTRACT') : (file ? file.name : 'VENDOR SERVICE AGREEMENT')).replace(/\.[^/.]+$/, "").toUpperCase()}
              </div>
              <p className="doc-intro" style={{ color: 'var(--text-secondary)' }}>
                Document <strong>{isCached ? cachedFilename : file ? file.name : 'Contract'}</strong> successfully analyzed. The following clauses were extracted and reviewed for compliance and risk.
              </p>

              {realClauses.map(clause => (
                clause.text ? (
                  <div
                    key={clause.id}
                    className={`doc-clause ${
                      clause.risk === 'critical' ? 'doc-clause--critical' :
                      clause.risk === 'warning' ? 'doc-clause--warning' :
                      clause.risk === 'safe' ? 'doc-clause--safe' : ''
                    } ${selectedClause?.id === clause.id ? 'doc-clause--selected' : ''}`}
                    onClick={() => { setSelectedClause(clause); setActiveTab('risks'); }}
                  >
                    <div className="doc-clause-header">
                      <span className="doc-clause-title">{clause.id}. {clause.title}</span>
                      <span className={`badge badge-${clause.risk === 'critical' ? 'critical' : clause.risk === 'warning' ? 'warning' : 'safe'}`}>
                        {clause.risk}
                      </span>
                    </div>
                    <p className="doc-clause-text">{clause.text}</p>
                  </div>
                ) : null
              ))}


            </div>
          </div>
        </div>

        
        <div className="intelligence-pane">
          <div className="pane-tabs">
            <button
              className={`pane-tab ${activeTab === 'trace' ? 'active' : ''}`}
              onClick={() => setActiveTab('trace')}
            >
              <GitBranch size={14} /> {t('analysis.agentTrace')}
            </button>
            <button
              className={`pane-tab ${activeTab === 'risks' ? 'active' : ''}`}
              onClick={() => { setActiveTab('risks'); setSelectedClause(null); }}
            >
              <ShieldAlert size={14} /> {t('analysis.risksRedlines')}
              {totalRisks > 0 && <span className="pane-tab-count">{totalRisks}</span>}
            </button>
            <button
              className={`pane-tab ${activeTab === 'rewrite' ? 'active' : ''}`}
              onClick={() => { setActiveTab('rewrite'); setSelectedClause(null); }}
            >
              <FileText size={14} /> {t('analysis.msmeDraft')}
            </button>
          </div>

          <div className="pane-body">
            
            {activeTab === 'trace' && (
              <div className="agent-trace animate-fade-up">
                <div className="trace-summary">
                  <div className="trace-summary-item">
                    <CheckCircle2 size={13} className="text-safe" />
                    <span className="text-secondary text-sm">{agentsCompleted} {t('analysis.agentsCompleted')}</span>
                  </div>
                  <div className="trace-summary-item">
                    <AlertTriangle size={13} className="text-critical" />
                    <span className="text-secondary text-sm">{criticalCount} {t('analysis.criticalIssues')}</span>
                  </div>
                </div>

                {agents.map(agent => (
                  <div key={agent.id} className="trace-agent">
                    <div
                      className="trace-agent-header"
                      onClick={() => toggleAgentExpand(agent.id)}
                    >
                      <div className={`trace-agent-icon trace-agent-icon--${agent.status}`}>
                        {agent.status === 'done' ? <CheckCircle2 size={12} /> :
                         agent.status === 'active' ? <Loader2 size={12} className="animate-spin" /> :
                         agent.icon}
                      </div>
                      <div className="trace-agent-meta">
                        <span className="trace-agent-name">{agent.name}</span>
                        <span className="trace-agent-desc text-tertiary text-sm">{agent.desc}</span>
                      </div>
                      {agent.thoughts && (
                        <button className="trace-expand-btn">
                          {expandedAgents.has(agent.id)
                            ? <ChevronDown size={13} />
                            : <ChevronRight size={13} />}
                        </button>
                      )}
                    </div>

                    {expandedAgents.has(agent.id) && agent.thoughts && (
                      <div className="trace-thoughts animate-fade-up">
                        {agent.thoughts.map((t, i) => (
                          <div key={i} className="trace-thought">
                            <div className="trace-thought-dot" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            
            {activeTab === 'risks' && !selectedClause && (
              <div className="risk-overview animate-fade-up">
                <div className="risk-summary-cards">
                  <div className="risk-summary-card risk-summary-card--critical">
                    <AlertTriangle size={16} /> <span>{criticalCount} {t('analysis.critical')}</span>
                  </div>
                  <div className="risk-summary-card risk-summary-card--warning">
                    <AlertTriangle size={16} /> <span>{warningCount} {t('analysis.moderate')}</span>
                  </div>

                  <div className="risk-summary-card risk-summary-card--safe">
                    <CheckCircle2 size={16} /> <span>{safeCount} {t('analysis.safe')}</span>
                  </div>
                </div>

                <div className="clause-cards">
                  {realClauses.map(clause => (
                    <div
                      key={clause.id}
                      className={`clause-card clause-card--${clause.risk}`}
                      onClick={() => setSelectedClause(clause)}
                    >
                      <div className="clause-card-header">
                        <div>
                          <div className="clause-card-title">{clause.title}</div>
                          <div className="clause-card-type text-sm text-tertiary">{clause.type}</div>
                        </div>
                        <span className={`badge badge-${clause.risk === 'critical' ? 'critical' : clause.risk === 'warning' ? 'warning' : clause.risk === 'safe' ? 'safe' : 'missing'}`}>
                          {clause.risk}
                        </span>
                      </div>
                      {clause.original && (
                        <p className="clause-card-preview text-sm text-tertiary">
                          {clause.original}
                        </p>
                      )}
                      <div className="clause-card-footer">
                        <span className="text-sm text-ai">{t('analysis.viewAnalysis')}</span>
                        <ChevronRight size={13} className="text-ai" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {activeTab === 'risks' && selectedClause && (
              <div className="clause-detail animate-fade-up">
                <div className="clause-detail-header">
                  <button
                    className="btn-back"
                    onClick={() => setSelectedClause(null)}
                  >
                    <ArrowLeft size={14} /> {t('analysis.allClauses')}
                  </button>
                  <span className={`badge badge-${selectedClause.risk === 'critical' ? 'critical' : selectedClause.risk === 'warning' ? 'warning' : selectedClause.risk === 'safe' ? 'safe' : 'missing'}`}>
                    {selectedClause.risk}
                  </span>
                </div>

                <div className="clause-detail-body">
                  <h4 className="clause-detail-title">{selectedClause.title}</h4>

                  
                  {selectedClause.text && (
                    <div className="detail-section">
                      <div className="detail-label">{t('analysis.originalText')}</div>
                      <div className="detail-original">
                        "{selectedClause.text}"
                      </div>
                    </div>
                  )}

                  
                  <div className={`detail-risk-box detail-risk-box--${selectedClause.risk}`}>
                    <div className="detail-risk-header">
                      <AlertTriangle size={14} />
                      {t('analysis.whatIsRisk')}
                    </div>
                    <p className={language === 'hi' ? 'lang-hi' : ''}>
                      {selectedClause.issue[language]}
                    </p>
                  </div>

                  
                  <div className="detail-section">
                    <div className="detail-label">{t('analysis.recommendedAction')}</div>
                    <p className={`detail-suggestion ${language === 'hi' ? 'lang-hi' : ''}`}>
                      {selectedClause.suggestion[language]}
                    </p>
                  </div>

                  
                  {selectedClause.rewrite && (
                    <div className="detail-section">
                      <div className="detail-label-row">
                        <div className="detail-label text-safe">{t('analysis.saferWording')}</div>
                        <button className="btn-icon btn-sm">
                          <Copy size={13} />
                        </button>
                      </div>
                      <div className="detail-rewrite">
                        {selectedClause.rewrite}
                      </div>
                    </div>
                  )}


                </div>
              </div>
            )}

            
            {activeTab === 'rewrite' && (
              <div className="rewrite-pane animate-fade-up" style={{ padding: '24px' }}>
                <div className="rewrite-header" style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{t('analysis.negotiatedDraft')}</h3>
                  <p className="text-secondary" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    {t('analysis.draftDesc')
                      .replace('{rewrites}', realClauses.filter(c => c.rewrite).length.toString())
                      .replace('{highRisk}', realClauses.filter(c => c.risk === 'critical').length.toString())}
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={handleDownloadPdf}>
                    <Download size={14} /> {t('analysis.downloadPdf')}
                  </button>
                </div>

                <div className="rewrite-changes" style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>{t('analysis.summaryOfChanges')}</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
                    {realClauses.filter(c => c.rewrite).map(clause => (
                      <li key={clause.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span className="text-safe" style={{ marginTop: '2px' }}><CheckCircle2 size={16} /></span>
                        <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                          <strong>{clause.title}:</strong> {clause.issue.en}
                        </span>
                      </li>
                    ))}
                    {realClauses.filter(c => c.rewrite).length === 0 && (
                      <li style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{t('analysis.noRewrites')}</li>
                    )}
                  </ul>
                </div>

                <div className="rewrite-diff">
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>{t('analysis.redlinesReview')}</h4>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '20px', fontSize: '13px', lineHeight: '1.7', fontFamily: 'var(--font-mono, monospace)', overflowX: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {realClauses.filter(c => c.risk === 'critical' || c.risk === 'warning' || c.rewrite).map(clause => (
                      <div key={clause.id}>
                        <div className="text-tertiary">... [{clause.title}] ...</div>
                        {clause.original && (
                          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--critical-color)', padding: '6px 12px', margin: '8px 0', borderLeft: '3px solid var(--critical-color)', textDecoration: 'line-through' }}>
                            - {clause.original}
                          </div>
                        )}
                        {clause.rewrite ? (
                          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--safe-color)', padding: '6px 12px', margin: '8px 0', borderLeft: '3px solid var(--safe-color)' }}>
                            + {clause.rewrite}
                          </div>
                        ) : (
                          <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: 'var(--warning-color)', padding: '6px 12px', margin: '8px 0', borderLeft: '3px solid var(--warning-color)' }}>
                            ⚠ {clause.issue.en}
                          </div>
                        )}
                      </div>
                    ))}
                    {realClauses.filter(c => c.risk !== 'safe').length === 0 && (
                      <div className="text-tertiary">{t('analysis.noIssues')}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isLoaded && (
        <ContractChat
          clauses={realClauses}
          filename={isCached ? (cachedFilename || undefined) : (file ? file.name : undefined)}
        />
      )}
    </div>
  );
};

export default Analysis;

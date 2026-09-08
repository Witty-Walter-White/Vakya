import { useState, useEffect } from 'react';
import {
  Globe, Moon, Sun, Sliders, Database, Info,
  Download, Trash2, Check, ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchConfig } from '../api/client';
import './Settings.css';

const Settings = () => {
  const { language, setLanguage, theme, toggleTheme, t } = useApp();

  const [riskThreshold, setRiskThreshold] = useState<'low' | 'medium' | 'high'>('medium');
  const [maxClauses, setMaxClauses] = useState(20);
  const [ocrEnabled, setOcrEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [llmModel, setLlmModel] = useState('Loading...');

  useEffect(() => {
    fetchConfig()
      .then(data => setLlmModel(data.ollama_model))
      .catch(() => setLlmModel('Unknown'));
  }, []);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-page">
      <div className="settings-glow page-glow" />

      <div className="settings-header">
        <div className="page-eyebrow">
          <span className="page-eyebrow-dot" />
          Chambers
        </div>
        <h1 className="settings-title gradient-text">{t('settings.title')}</h1>
        <p className="settings-sub">{t('settings.sub')}</p>
      </div>

      <div className="settings-body">

        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-icon-chip settings-icon-chip--indigo">
              <Globe size={16} />
            </span>
            <div>
              <h2>{t('settings.language')}</h2>
              <p>{t('settings.language.desc')}</p>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="lang-options">
              {(['en', 'hi'] as const).map(lang => (
                <button
                  key={lang}
                  id={`lang-${lang}`}
                  className={`lang-option-btn ${language === lang ? 'active' : ''}`}
                  onClick={() => setLanguage(lang)}
                >
                  {language === lang && <Check size={14} className="lang-check" />}
                  <span className="lang-flag">{lang === 'en' ? '🇬🇧' : '🇮🇳'}</span>
                  <div>
                    <span className="lang-name">{lang === 'en' ? 'English' : 'हिंदी'}</span>
                    <span className="lang-sub">{lang === 'en' ? 'English (Default)' : 'Hindi (भारतीय)'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-icon-chip settings-icon-chip--amber">
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </span>
            <div>
              <h2>{t('settings.appearance')}</h2>
              <p>{t('settings.appearance.desc')}</p>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="theme-options">
              {(['dark', 'light'] as const).map(th => (
                <button
                  key={th}
                  id={`theme-${th}`}
                  className={`theme-option-btn ${theme === th ? 'active' : ''}`}
                  onClick={() => th !== theme && toggleTheme()}
                >
                  <div className={`theme-preview ${th}`}>
                    <div className="theme-preview-sidebar" />
                    <div className="theme-preview-content">
                      <div className="theme-preview-bar" />
                      <div className="theme-preview-card" />
                      <div className="theme-preview-card short" />
                    </div>
                  </div>
                  <div className="theme-label">
                    {th === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
                    <span>{th === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}</span>
                    {theme === th && <Check size={13} className="theme-check" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-icon-chip settings-icon-chip--safe">
              <Sliders size={16} />
            </span>
            <div>
              <h2>{t('settings.analysisDefaults')}</h2>
              <p>{t('settings.analysisDefaults.desc')}</p>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="settings-field">
              <label>{t('settings.riskThreshold')}</label>
              <div className="risk-threshold-options">
                {(['low', 'medium', 'high'] as const).map(r => (
                  <button
                    key={r}
                    id={`risk-${r}`}
                    className={`risk-option ${riskThreshold === r ? 'active' : ''} risk-${r}`}
                    onClick={() => setRiskThreshold(r)}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
              <p className="settings-hint">
                {riskThreshold === 'low' && t('settings.riskThreshold.low')}
                {riskThreshold === 'medium' && t('settings.riskThreshold.medium')}
                {riskThreshold === 'high' && t('settings.riskThreshold.high')}
              </p>
            </div>

            <div className="settings-field">
              <label>{t('settings.maxClauses')} — <strong>{maxClauses}</strong></label>
              <input
                id="max-clauses-slider"
                type="range"
                min={5}
                max={50}
                step={5}
                value={maxClauses}
                onChange={e => setMaxClauses(Number(e.target.value))}
                className="settings-range"
              />
              <div className="settings-range-labels">
                <span>5</span><span>50</span>
              </div>
            </div>

            <div className="settings-toggle-row">
              <div>
                <p className="settings-toggle-label">{t('settings.ocrEnabled')}</p>
                <p className="settings-toggle-sub">{t('settings.ocrEnabled.desc')}</p>
              </div>
              <button
                id="ocr-toggle"
                className={`settings-toggle ${ocrEnabled ? 'on' : ''}`}
                onClick={() => setOcrEnabled(o => !o)}
                aria-label="OCR toggle"
              >
                <span className="settings-toggle-knob" />
              </button>
            </div>
          </div>
        </section>

        
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-icon-chip settings-icon-chip--critical">
              <Database size={16} />
            </span>
            <div>
              <h2>{t('settings.dataPrivacy')}</h2>
              <p>{t('settings.dataPrivacy.desc')}</p>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="settings-action-row">
              <div>
                <p className="settings-action-label">{t('settings.exportData')}</p>
                <p className="settings-action-sub">{t('settings.exportData.desc')}</p>
              </div>
              <button id="export-data-btn" className="settings-action-btn">
                <Download size={13} /> {t('common.export')}
              </button>
            </div>
            <div className="settings-divider" />
            <div className="settings-action-row">
              <div>
                <p className="settings-action-label">{t('settings.clearHistory')}</p>
                <p className="settings-action-sub">{t('settings.clearHistory.desc')}</p>
              </div>
              <button id="clear-history-btn" className="settings-action-btn danger">
                <Trash2 size={13} /> {t('common.clear')}
              </button>
            </div>
          </div>
        </section>


      </div>

      <div className="settings-footer">
        <button id="save-settings-btn" className="settings-save-btn" onClick={showSaved}>
          {saved ? <><Check size={14} /> {language === 'hi' ? 'सहेजा गया!' : 'Saved!'}</> : t('settings.saveSettings')}
        </button>
      </div>
    </div>
  );
};

export default Settings;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { upsertUser, fetchProfile, updateProfile } from '../api/client';
export type Language = 'en' | 'hi';
export type Theme = 'dark' | 'light';
interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  plan: 'free' | 'pro';
  phone?: string;
  email_alerts?: boolean;
  weekly_digest?: boolean;
  risk_alerts?: boolean;
}
interface AppContextType {
  
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    
    'nav.upload': 'Upload',
    'nav.repository': 'Repository',
    'nav.templates': 'Templates',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.signout': 'Sign Out',
    'auth.signinGoogle': 'Continue with Google',
    'auth.signinEmail': 'Sign in with Email',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.welcome': 'Welcome back',
    'auth.tagline': 'AI-powered contract intelligence for Indian MSMEs',
    'auth.signInToContinue': 'Sign in to continue',
    
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.displayName': 'Display Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone Number',
    'profile.account': 'Account',
    'profile.plan': 'Plan',
    'profile.security': 'Security',
    'profile.changePassword': 'Change Password',
    'profile.currentPassword': 'Current Password',
    'profile.newPassword': 'New Password',
    'profile.confirmPassword': 'Confirm New Password',
    'profile.notifications': 'Notifications',
    'profile.emailAlerts': 'Email alerts for risk flags',
    'profile.weeklyDigest': 'Weekly contract digest',
    'profile.dangerZone': 'Danger Zone',
    'profile.deleteAccount': 'Delete Account',
    'profile.saveChanges': 'Save Changes',
    'profile.contractsAnalyzed': 'Contracts Analyzed',
    'profile.clausesFlagged': 'Clauses Flagged',
    'profile.reportsGenerated': 'Reports Generated',
    
    'dashboard.title': 'Contract Repository',
    'dashboard.loading': 'Loading…',
    'dashboard.contracts': 'contracts',
    'dashboard.contract': 'contract',
    'dashboard.pendingReview': 'pending review',
    'dashboard.criticalRisks': 'critical risks',
    'dashboard.criticalRisk': 'critical risk',
    'dashboard.riskReport': 'Risk Report',
    'dashboard.uploadContract': 'Upload Contract',
    'dashboard.criticalRisksCard': 'Critical Risks',
    'dashboard.moderateRiskCard': 'Moderate Risk',
    'dashboard.clearedCard': 'Cleared',
    'dashboard.totalAnalysedCard': 'Total Analysed',
    'dashboard.loadingContracts': 'Loading your contracts…',
    'dashboard.noContracts': 'No contracts analysed yet. Upload one to get started.',
    'dashboard.tableDoc': 'Document',
    'dashboard.tableRiskScore': 'Risk Score',
    'dashboard.tableRiskLevel': 'Risk Level',
    'dashboard.tableStatus': 'Status',
    'dashboard.tableAnalysed': 'Analysed',
    'dashboard.view': 'View →',
    'dashboard.dropText': 'Drop a contract here or ',
    'dashboard.browseFiles': 'browse files',
    'dashboard.fileTypes': 'PDF, DOCX, or scanned image · Max 50MB',
    
    'layout.searchPlaceholder': 'Search contracts, clauses, counterparties...',
    
    'analysis.processing': 'Processing Contract',
    'analysis.estimatedTime': 'Estimated Time to Analyze:',
    'analysis.repository': 'Repository',
    'analysis.generateReport': 'Generate Report',
    'analysis.document': 'Document',
    'analysis.page': 'Page',
    'analysis.of': 'of',
    'analysis.agentTrace': 'Agent Trace',
    'analysis.risksRedlines': 'Risk & Redlines',
    'analysis.msmeDraft': 'MSME Draft',
    'analysis.agentsCompleted': 'agents completed',
    'analysis.criticalIssues': 'critical issues',
    'analysis.originalText': 'Original Text',
    'analysis.msmeRewrite': 'MSME Rewrite',
    'analysis.issue': 'Issue',
    'analysis.suggestion': 'Suggestion',
    'analysis.accept': 'Accept',
    'analysis.reject': 'Reject',
    'analysis.cached': 'Cached',
    'analysis.risk': 'Risk',
    'analysis.missing': 'Missing',
    'analysis.missingClause': 'Missing: Jurisdiction & Governing Law clause',
    'analysis.critical': 'Critical',
    'analysis.moderate': 'Moderate',
    'analysis.safe': 'Safe',
    'analysis.allClauses': 'All clauses',
    'analysis.whatIsRisk': 'What is the risk?',
    'analysis.recommendedAction': 'Recommended Action',
    'analysis.saferWording': 'Safer Wording',
    'analysis.remix': 'Remix',
    'analysis.flagForLawyer': 'Flag for Lawyer',
    'analysis.acceptRewrite': 'Accept Rewrite',
    'analysis.negotiatedDraft': 'Negotiated MSME Draft',
    'analysis.draftDesc': 'This AI-generated draft resolves {rewrites} critical issues and highlights {highRisk} high-risk clauses to protect your MSME rights.',
    'analysis.downloadPdf': 'Download Revised PDF',
    'analysis.summaryOfChanges': 'Summary of Changes Made',
    'analysis.noRewrites': 'No rewrites were generated for this document.',
    'analysis.redlinesReview': 'Redlines Review',
    'analysis.noIssues': 'No issues detected — all clauses appear safe.',
    'analysis.viewAnalysis': 'View analysis',
    
    'report.back': 'Back to Analysis',
    'report.exporting': 'Exporting...',
    'report.exportDocx': 'Export DOCX',
    'report.analyzedMeta': 'Analyzed Jun 3, 2026 · Counterparty: TechCorp Solutions Pvt. Ltd.',
    'report.riskScore': 'Risk Score:',
    'report.execSummary': 'Executive Summary',
    'report.execSummaryText1': 'This contract poses a High Risk (72/100) to your business. Two clauses create direct financial exposure: the payment terms allow the Client to withhold payments indefinitely, and the termination notice of 7 days is insufficient to protect your pipeline. The contract also lacks two legally critical protections — a jurisdiction clause and a GST compliance clause — both essential for Indian MSME contexts.',
    'report.execSummaryText2': 'We recommend negotiating clauses 1 and 2 before signing, and inserting the AI-generated jurisdiction and GST clauses as conditions for agreement.',
    'report.criticalRisks': 'Critical Risks',
    'report.moderateRisks': 'Moderate Risks',
    'report.missingClauses': 'Missing Clauses',
    'report.clauseDist': 'Clause Distribution',
    'report.requiredActions': 'Required Actions Before Signing',
    'report.footer': 'Generated by Vakya on Jun 3, 2026. This report provides legal information, not legal advice. Consult a qualified legal professional for binding decisions.',
    
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.darkMode': 'Dark Mode',
    'settings.lightMode': 'Light Mode',
    'settings.analysisDefaults': 'Analysis Defaults',
    'settings.riskThreshold': 'Default Risk Threshold',
    'settings.maxClauses': 'Max Clauses to Analyze',
    'settings.ocrEnabled': 'Enable OCR for Scanned PDFs',
    'settings.dataPrivacy': 'Data & Privacy',
    'settings.exportData': 'Export My Data',
    'settings.clearHistory': 'Clear Analysis History',
    'settings.about': 'About',
    'settings.version': 'App Version',
    'settings.changelog': 'View Changelog',
    'settings.saveSettings': 'Save Settings',
    
    'settings.sub': 'Manage your preferences and application settings.',
    'settings.language.desc': 'Choose the language for the entire application interface.',
    'settings.appearance.desc': 'Switch between dark and light mode.',
    'settings.analysisDefaults.desc': 'Configure how Vakya analyses your contracts by default.',
    'settings.ocrEnabled.desc': 'Automatically detect and process image-based PDFs.',
    'settings.dataPrivacy.desc': 'Manage your stored data and privacy options.',
    'settings.exportData.desc': 'Download all your contracts and reports as a ZIP file.',
    'settings.clearHistory.desc': 'Remove all past analyses and cached results.',
    'settings.about.desc': 'Application details and update information.',
    'settings.riskThreshold.low': 'Flag every clause with any potential issue (more alerts).',
    'settings.riskThreshold.medium': 'Flag medium and high risk clauses only (recommended).',
    'settings.riskThreshold.high': 'Only flag critical risks (fewer, higher-priority alerts).',
    'settings.build': 'Build',
    'settings.llmModel': 'LLM Model',
    
    'profile.personalInfo.desc': 'Update your public display name and contact details.',
    'profile.security.desc': 'Change your password and manage active sessions.',
    'profile.notifications.desc': 'Choose which updates you want to receive.',
    'profile.dangerZone.desc': 'Irreversible actions that affect your account.',
    'profile.email.readonly': 'Email cannot be changed after signup.',
    'profile.accountType': 'Account Type',
    'profile.currentSession': 'Current session',
    'profile.currentSession.desc': 'This device · Active now',
    'profile.riskAlerts': 'Instant risk alerts via email',
    'profile.signOutAll': 'Sign Out All',
    'profile.signOutAll.desc': 'This will end all active sessions immediately.',
    'profile.deleteAccount.desc': 'This action is irreversible and will delete all your data.',
    'profile.deleteConfirm': 'Delete account?',
    'profile.deleteConfirm.desc': 'This will permanently delete all your contracts, reports, and account data. This cannot be undone.',
    
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.freePlan': 'Free Plan',
    'common.proPlan': 'Pro Plan',
    'common.export': 'Export',
    'common.clear': 'Clear',
    'common.active': 'Active',
  },
  hi: {
    
    'nav.upload': 'अपलोड',
    'nav.repository': 'रिपोजिटरी',
    'nav.templates': 'टेम्पलेट',
    'nav.settings': 'सेटिंग्स',
    'nav.profile': 'प्रोफ़ाइल',
    
    'auth.signin': 'साइन इन करें',
    'auth.signup': 'साइन अप करें',
    'auth.signout': 'साइन आउट',
    'auth.signinGoogle': 'Google से जारी रखें',
    'auth.signinEmail': 'ईमेल से साइन इन करें',
    'auth.email': 'ईमेल पता',
    'auth.password': 'पासवर्ड',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.hasAccount': 'पहले से खाता है?',
    'auth.welcome': 'वापस स्वागत है',
    'auth.tagline': 'भारतीय MSMEs के लिए AI-संचालित अनुबंध विश्लेषण',
    'auth.signInToContinue': 'जारी रखने के लिए साइन इन करें',
    
    'profile.title': 'प्रोफ़ाइल',
    'profile.personalInfo': 'व्यक्तिगत जानकारी',
    'profile.displayName': 'प्रदर्शन नाम',
    'profile.email': 'ईमेल',
    'profile.phone': 'फोन नंबर',
    'profile.account': 'खाता',
    'profile.plan': 'प्लान',
    'profile.security': 'सुरक्षा',
    'profile.changePassword': 'पासवर्ड बदलें',
    'profile.currentPassword': 'वर्तमान पासवर्ड',
    'profile.newPassword': 'नया पासवर्ड',
    'profile.confirmPassword': 'नया पासवर्ड पुष्टि करें',
    'profile.notifications': 'सूचनाएं',
    'profile.emailAlerts': 'जोखिम के लिए ईमेल अलर्ट',
    'profile.weeklyDigest': 'साप्ताहिक अनुबंध सारांश',
    'profile.dangerZone': 'खतरनाक क्षेत्र',
    'profile.deleteAccount': 'खाता हटाएं',
    'profile.saveChanges': 'बदलाव सहेजें',
    'profile.contractsAnalyzed': 'विश्लेषित अनुबंध',
    'profile.clausesFlagged': 'चिह्नित खंड',
    'profile.reportsGenerated': 'उत्पन्न रिपोर्ट',
    
    'dashboard.title': 'अनुबंध रिपोजिटरी',
    'dashboard.loading': 'लोड हो रहा है…',
    'dashboard.contracts': 'अनुबंध',
    'dashboard.contract': 'अनुबंध',
    'dashboard.pendingReview': 'समीक्षा लंबित',
    'dashboard.criticalRisks': 'गंभीर जोखिम',
    'dashboard.criticalRisk': 'गंभीर जोखिम',
    'dashboard.riskReport': 'जोखिम रिपोर्ट',
    'dashboard.uploadContract': 'अनुबंध अपलोड करें',
    'dashboard.criticalRisksCard': 'गंभीर जोखिम',
    'dashboard.moderateRiskCard': 'मध्यम जोखिम',
    'dashboard.clearedCard': 'सुरक्षित',
    'dashboard.totalAnalysedCard': 'कुल विश्लेषित',
    'dashboard.loadingContracts': 'आपके अनुबंध लोड हो रहे हैं…',
    'dashboard.noContracts': 'अभी तक कोई अनुबंध विश्लेषित नहीं हुआ। शुरू करने के लिए एक अपलोड करें।',
    'dashboard.tableDoc': 'दस्तावेज़',
    'dashboard.tableRiskScore': 'जोखिम स्कोर',
    'dashboard.tableRiskLevel': 'जोखिम स्तर',
    'dashboard.tableStatus': 'स्थिति',
    'dashboard.tableAnalysed': 'विश्लेषित',
    'dashboard.view': 'देखें →',
    'dashboard.dropText': 'अनुबंध यहाँ छोड़ें या ',
    'dashboard.browseFiles': 'फ़ाइलें ब्राउज़ करें',
    'dashboard.fileTypes': 'PDF, DOCX, या स्कैन की गई छवि · अधिकतम 50MB',
    
    'layout.searchPlaceholder': 'अनुबंध, खंड, प्रतिपक्ष खोजें...',
    
    'analysis.processing': 'अनुबंध संसाधित हो रहा है',
    'analysis.estimatedTime': 'विश्लेषण का अनुमानित समय:',
    'analysis.repository': 'रिपोजिटरी',
    'analysis.generateReport': 'रिपोर्ट बनाएँ',
    'analysis.document': 'दस्तावेज़',
    'analysis.page': 'पृष्ठ',
    'analysis.of': 'में से',
    'analysis.agentTrace': 'एजेंट ट्रेस',
    'analysis.risksRedlines': 'जोखिम और रेडलाइन',
    'analysis.msmeDraft': 'MSME ड्राफ्ट',
    'analysis.agentsCompleted': 'एजेंट पूरे हुए',
    'analysis.criticalIssues': 'गंभीर समस्याएं',
    'analysis.originalText': 'मूल पाठ',
    'analysis.msmeRewrite': 'MSME पुनर्लेखन',
    'analysis.issue': 'समस्या',
    'analysis.suggestion': 'सुझाव',
    'analysis.accept': 'स्वीकार करें',
    'analysis.reject': 'अस्वीकार करें',
    'analysis.cached': 'कैश्ड',
    'analysis.risk': 'जोखिम',
    'analysis.missing': 'गायब',
    'analysis.missingClause': 'गायब: अधिकार क्षेत्र और शासी कानून खंड',
    'analysis.critical': 'गंभीर',
    'analysis.moderate': 'मध्यम',
    'analysis.safe': 'सुरक्षित',
    'analysis.allClauses': 'सभी खंड',
    'analysis.whatIsRisk': 'जोखिम क्या है?',
    'analysis.recommendedAction': 'अनुशंसित कार्रवाई',
    'analysis.saferWording': 'सुरक्षित शब्दावली',
    'analysis.remix': 'रीमिक्स',
    'analysis.flagForLawyer': 'वकील के लिए चिह्नित करें',
    'analysis.acceptRewrite': 'पुनर्लेखन स्वीकार करें',
    'analysis.negotiatedDraft': 'समझौता वार्ता MSME ड्राफ्ट',
    'analysis.draftDesc': 'यह AI-जनित ड्राफ्ट आपके MSME अधिकारों की रक्षा के लिए {rewrites} गंभीर समस्याओं को हल करता है और {highRisk} उच्च जोखिम वाले खंडों को उजागर करता है।',
    'analysis.downloadPdf': 'संशोधित PDF डाउनलोड करें',
    'analysis.summaryOfChanges': 'किए गए बदलावों का सारांश',
    'analysis.noRewrites': 'इस दस्तावेज़ के लिए कोई पुनर्लेखन उत्पन्न नहीं किया गया।',
    'analysis.redlinesReview': 'रेडलाइन समीक्षा',
    'analysis.noIssues': 'कोई समस्या नहीं मिली — सभी खंड सुरक्षित प्रतीत होते हैं।',
    'analysis.viewAnalysis': 'विश्लेषण देखें',
    
    'report.back': 'विश्लेषण पर वापस जाएँ',
    'report.exporting': 'निर्यात किया जा रहा है...',
    'report.exportDocx': 'DOCX निर्यात करें',
    'report.analyzedMeta': 'विश्लेषित 3 जून, 2026 · प्रतिपक्ष: टेककॉर्प सॉल्यूशंस प्राइवेट लिमिटेड',
    'report.riskScore': 'जोखिम स्कोर:',
    'report.execSummary': 'कार्यकारी सारांश',
    'report.execSummaryText1': 'यह अनुबंध आपके व्यवसाय के लिए उच्च जोखिम (72/100) पैदा करता है। दो खंड सीधे वित्तीय जोखिम पैदा करते हैं: भुगतान की शर्तें क्लाइंट को अनिश्चित काल तक भुगतान रोकने की अनुमति देती हैं, और 7 दिनों की समाप्ति सूचना आपकी पाइपलाइन की सुरक्षा के लिए अपर्याप्त है। अनुबंध में दो कानूनी रूप से महत्वपूर्ण सुरक्षा का भी अभाव है - एक क्षेत्राधिकार खंड और एक जीएसटी अनुपालन खंड - दोनों भारतीय MSME संदर्भों के लिए आवश्यक हैं।',
    'report.execSummaryText2': 'हम हस्ताक्षर करने से पहले खंड 1 और 2 पर बातचीत करने, और समझौते की शर्तों के रूप में AI-जनित क्षेत्राधिकार और GST खंड सम्मिलित करने की सलाह देते हैं।',
    'report.criticalRisks': 'गंभीर जोखिम',
    'report.moderateRisks': 'मध्यम जोखिम',
    'report.missingClauses': 'गायब खंड',
    'report.clauseDist': 'खंड वितरण',
    'report.requiredActions': 'हस्ताक्षर करने से पहले आवश्यक कार्य',
    'report.footer': 'वाक्य द्वारा 3 जून, 2026 को निर्मित। यह रिपोर्ट कानूनी जानकारी प्रदान करती है, कानूनी सलाह नहीं। बाध्यकारी निर्णयों के लिए योग्य कानूनी पेशेवर से परामर्श करें।',
    
    'settings.title': 'सेटिंग्स',
    'settings.language': 'भाषा',
    'settings.appearance': 'रूप-रंग',
    'settings.theme': 'थीम',
    'settings.darkMode': 'डार्क मोड',
    'settings.lightMode': 'लाइट मोड',
    'settings.analysisDefaults': 'विश्लेषण डिफ़ॉल्ट',
    'settings.riskThreshold': 'डिफ़ॉल्ट जोखिम सीमा',
    'settings.maxClauses': 'अधिकतम विश्लेषण खंड',
    'settings.ocrEnabled': 'स्कैन किए PDF के लिए OCR सक्षम करें',
    'settings.dataPrivacy': 'डेटा और गोपनीयता',
    'settings.exportData': 'मेरा डेटा निर्यात करें',
    'settings.clearHistory': 'विश्लेषण इतिहास साफ़ करें',
    'settings.about': 'जानकारी',
    'settings.version': 'ऐप संस्करण',
    'settings.changelog': 'परिवर्तन लॉग देखें',
    'settings.saveSettings': 'सेटिंग्स सहेजें',
    
    'settings.sub': 'अपनी प्राथमिकताएं और एप्लिकेशन सेटिंग्स प्रबंधित करें।',
    'settings.language.desc': 'पूरे एप्लिकेशन इंटरफेस के लिए भाषा चुनें।',
    'settings.appearance.desc': 'डार्क और लाइट मोड के बीच स्विच करें।',
    'settings.analysisDefaults.desc': 'Vakya डिफ़ॉल्ट रूप से आपके अनुबंधों का विश्लेषण कैसे करे, इसे कॉन्फ़िगर करें।',
    'settings.ocrEnabled.desc': 'इमेज-आधारित PDF को स्वचालित रूप से पहचानें और प्रोसेस करें।',
    'settings.dataPrivacy.desc': 'अपना संग्रहीत डेटा और गोपनीयता विकल्प प्रबंधित करें।',
    'settings.exportData.desc': 'अपने सभी अनुबंध और रिपोर्ट ZIP फ़ाइल के रूप में डाउनलोड करें।',
    'settings.clearHistory.desc': 'सभी पिछले विश्लेषण और कैश्ड परिणाम हटाएं।',
    'settings.about.desc': 'एप्लिकेशन विवरण और अपडेट जानकारी।',
    'settings.riskThreshold.low': 'किसी भी संभावित समस्या वाले हर खंड को चिह्नित करें (अधिक अलर्ट)।',
    'settings.riskThreshold.medium': 'केवल मध्यम और उच्च जोखिम वाले खंडों को चिह्नित करें (अनुशंसित)।',
    'settings.riskThreshold.high': 'केवल गंभीर जोखिमों को चिह्नित करें (कम, उच्च-प्राथमिकता अलर्ट)।',
    'settings.build': 'बिल्ड',
    'settings.llmModel': 'LLM मॉडल',
    
    'profile.personalInfo.desc': 'अपना सार्वजनिक प्रदर्शन नाम और संपर्क विवरण अपडेट करें।',
    'profile.security.desc': 'अपना पासवर्ड बदलें और सक्रिय सत्र प्रबंधित करें।',
    'profile.notifications.desc': 'चुनें कि आप कौन से अपडेट प्राप्त करना चाहते हैं।',
    'profile.dangerZone.desc': 'अपरिवर्तनीय क्रियाएं जो आपके खाते को प्रभावित करती हैं।',
    'profile.email.readonly': 'साइनअप के बाद ईमेल नहीं बदला जा सकता।',
    'profile.accountType': 'खाता प्रकार',
    'profile.currentSession': 'वर्तमान सत्र',
    'profile.currentSession.desc': 'यह डिवाइस · अभी सक्रिय',
    'profile.riskAlerts': 'ईमेल द्वारा तत्काल जोखिम अलर्ट',
    'profile.signOutAll': 'सभी से साइन आउट करें',
    'profile.signOutAll.desc': 'यह सभी सक्रिय सत्र तुरंत समाप्त कर देगा।',
    'profile.deleteAccount.desc': 'यह क्रिया अपरिवर्तनीय है और आपका सारा डेटा हटा देगी।',
    'profile.deleteConfirm': 'खाता हटाएं?',
    'profile.deleteConfirm.desc': 'यह आपके सभी अनुबंध, रिपोर्ट और खाता डेटा स्थायी रूप से हटा देगा। यह पूर्ववत नहीं किया जा सकता।',
    
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.confirm': 'पुष्टि करें',
    'common.delete': 'हटाएं',
    'common.freePlan': 'फ्री प्लान',
    'common.proPlan': 'प्रो प्लान',
    'common.export': 'निर्यात करें',
    'common.clear': 'साफ़ करें',
    'common.active': 'सक्रिय',
  },
};
const AppContext = createContext<AppContextType | null>(null);
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('vakya_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('vakya_lang') as Language) || 'en';
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('vakya_theme') as Theme) || 'dark';
  });
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vakya_theme', theme);
  }, [theme]);
  
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('vakya_lang', language);
  }, [language]);
  
  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id)
      .then(({ user: dbUser }) => {
        const merged: User = {
          ...user,
          name: dbUser.name || user.name,
          phone: dbUser.phone || '',
          email_alerts: dbUser.email_alerts ?? true,
          weekly_digest: dbUser.weekly_digest ?? false,
          risk_alerts: dbUser.risk_alerts ?? true,
          plan: (dbUser.plan as 'free' | 'pro') || user.plan,
          photo: dbUser.photo || user.photo,
        };
        setUser(merged);
        localStorage.setItem('vakya_user', JSON.stringify(merged));
      })
      .catch(() => { 
        
        upsertUser({
          id: user.id,
          email: user.email,
          name: user.name,
          photo: user.photo,
          plan: user.plan,
        }).catch(console.error);
      });
  
  }, []);

  const login = async (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('vakya_user', JSON.stringify(newUser));

    try {
      const { user: dbUser } = await upsertUser({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        photo: newUser.photo,
        plan: newUser.plan,
      });
      const merged: User = {
        ...newUser,
        phone: dbUser.phone || '',
        email_alerts: dbUser.email_alerts ?? true,
        weekly_digest: dbUser.weekly_digest ?? false,
        risk_alerts: dbUser.risk_alerts ?? true,
      };
      setUser(merged);
      localStorage.setItem('vakya_user', JSON.stringify(merged));
    } catch (err) {
      console.error(err);
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('vakya_user');
  };
  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('vakya_user', JSON.stringify(updated));
    
    updateProfile(user.id, {
      name: updates.name,
      phone: updates.phone,
      email_alerts: updates.email_alerts,
      weekly_digest: updates.weekly_digest,
      risk_alerts: updates.risk_alerts,
    }).catch(console.error);
  };
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  const setTheme = (t: Theme) => {
    setThemeState(t);
  };
  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };
  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };
  return (
    <AppContext.Provider value={{
      user, isLoggedIn: !!user, login, logout, updateUser,
      language, setLanguage, t,
      theme, setTheme, toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
};
export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

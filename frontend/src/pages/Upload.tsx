import { useState, Fragment } from 'react';
import { UploadCloud, FileType, FileText, FileSearch, Scale, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Upload.css';

const pipelineSteps = [
  { label: 'Ingest', icon: <FileSearch size={17} /> },
  { label: 'Classify', icon: <FileType size={17} /> },
  { label: 'Compliance', icon: <Scale size={17} /> },
  { label: 'Risk Score', icon: <ShieldAlert size={17} /> },
  { label: 'Redline', icon: <FileText size={17} /> },
];

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      navigate('/app/analysis/new', { state: { file: e.dataTransfer.files[0] } });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      navigate('/app/analysis/new', { state: { file: e.target.files[0] } });
    }
  };

  return (
    <div className="upload-page">
      <div className="page-glow" />

      <div className="upload-header">
        <div className="page-eyebrow">
          <span className="page-eyebrow-dot" />
          AI Contract Intelligence
        </div>
        <h1>Start Your <span className="gradient-text">Analysis</span></h1>
        <p>Upload a contract to let the Sentinel agents detect hidden risks.</p>
      </div>

      <div
        className={`upload-dropzone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-glow" />
        <div className="upload-icon-wrap">
          <UploadCloud size={32} />
        </div>
        <h3>Drag & Drop your contract here</h3>
        <p>Supports PDF, DOCX, and Scanned Images (up to 50MB)</p>

        <div className="upload-divider">
          <span>OR</span>
        </div>

        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
          Browse Files
          <input
            type="file"
            hidden
            accept=".pdf,.doc,.docx,image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <div className="upload-pipeline">
        <span className="upload-pipeline-label">What happens next</span>
        <div className="pipeline-row">
          {pipelineSteps.map((step, i) => (
            <Fragment key={step.label}>
              <div className="pipeline-node">
                <div className="pipeline-node-icon">{step.icon}</div>
                <span className="pipeline-node-label">{step.label}</span>
              </div>
              {i < pipelineSteps.length - 1 && <div className="pipeline-connector" />}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="upload-features">
        <div className="uf-card">
          <span className="section-number">01</span>
          <div className="uf-text">
            <h4>Smart OCR Included</h4>
            <span>Automatically extracts text from poor quality scans.</span>
          </div>
        </div>
        <div className="uf-card">
          <span className="section-number">02</span>
          <div className="uf-text">
            <h4>Bilingual Support</h4>
            <span>Process contracts in both English and Hindi seamlessly.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;

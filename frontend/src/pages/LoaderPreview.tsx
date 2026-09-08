import { useEffect, useState } from 'react';
import BookLoader from '../components/BookLoader';

const PREVIEW_AGENTS = [
  { id: 1, name: 'Doc Ingestion', status: 'done' as const },
  { id: 2, name: 'Clause Classification', status: 'done' as const },
  { id: 3, name: 'Compliance Check', status: 'active' as const },
  { id: 4, name: 'Risk Assessment', status: 'pending' as const },
  { id: 5, name: 'Negotiator Agent', status: 'pending' as const },
];

const LoaderPreview = () => {
  const [key, setKey] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setComplete(false);
    const t = setTimeout(() => setComplete(true), 1200);
    return () => clearTimeout(t);
  }, [key]);

  return (
    <div className="loading-screen">
      <BookLoader
        key={key}
        fileName="Vendor_Agreement_TechCorp.pdf"
        agents={PREVIEW_AGENTS}
        complete={complete}
        onFinished={() => setKey(k => k + 1)}
      />
    </div>
  );
};

export default LoaderPreview;

import { useEffect, useRef, useState } from 'react';
import './BookLoader.css';
import vakyaLogo from '../images/logo_nobg.png';
import quillPen from '../images/quill-pen.png';
import doveWingLeft from '../images/dove-wing-left.png';
import doveWingRight from '../images/dove-wing-right.png';

interface AgentLike {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'done';
}

interface BookLoaderProps {
  fileName: string;
  agents: AgentLike[];
  complete: boolean;
  onFinished: () => void;
}

type Phase = 'closed' | 'opening' | 'open' | 'closing' | 'flying';

const READING_LINES = [
  'Reading the clauses...',
  'Sorting the parchment...',
  'Cross-referencing precedent...',
  'Weighing the risks...',
  'Consulting the codices...',
  "Drafting counsel's reply...",
];

const LINE_DURATION_MS = 3000;
const MIN_OPEN_MS = 5000;

const BookLoader = ({ fileName, agents: _agents, complete, onFinished }: BookLoaderProps) => {
  const [phase, setPhase] = useState<Phase>('closed');
  const [typed, setTyped] = useState('');
  const typedLineRef = useRef('');
  const [lineIndex, setLineIndex] = useState(0);

  const currentLine = phase === 'open' || phase === 'closing' || phase === 'flying'
    ? READING_LINES[lineIndex % READING_LINES.length]
    : 'Opening the ledger...';

  useEffect(() => {
    const openTimer = setTimeout(() => setPhase('opening'), 350);
    return () => clearTimeout(openTimer);
  }, []);

  useEffect(() => {
    if (phase !== 'opening') return;
    const t = setTimeout(() => setPhase('open'), 900);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'open') return;
    const id = setInterval(() => {
      setLineIndex(i => (i + 1) % READING_LINES.length);
    }, LINE_DURATION_MS);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'open' && phase !== 'closing' && phase !== 'flying') return;
    if (typedLineRef.current === currentLine) return;
    typedLineRef.current = currentLine;
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(currentLine.slice(0, i));
      if (i >= currentLine.length) clearInterval(id);
    }, 34);
    return () => clearInterval(id);
  }, [currentLine, phase]);

  const phaseRef = useRef<Phase>(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const onFinishedRef = useRef(onFinished);
  useEffect(() => { onFinishedRef.current = onFinished; }, [onFinished]);

  const openedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (phase === 'open') openedAtRef.current = Date.now();
  }, [phase]);

  const closeStartedRef = useRef(false);

  useEffect(() => {
    if (!complete || closeStartedRef.current) return;
    let cancelled = false;

    const tryStartClosing = () => {
      if (cancelled || closeStartedRef.current) return;
      if (phaseRef.current !== 'open') {
        setTimeout(tryStartClosing, 100);
        return;
      }
      const elapsed = openedAtRef.current ? Date.now() - openedAtRef.current : 0;
      const remaining = MIN_OPEN_MS - elapsed;
      if (remaining > 0) {
        setTimeout(tryStartClosing, remaining);
        return;
      }
      closeStartedRef.current = true;
      setPhase('closing');
      setTimeout(() => setPhase('flying'), 950);
      setTimeout(() => onFinishedRef.current(), 950 + 4600);
    };

    tryStartClosing();
    return () => { cancelled = true; };
  }, [complete]);

  return (
    <div className={`book-scene book-scene--${phase}`}>
      <div className="book-wrapper">
        <img className="book-wing book-wing--left" src={doveWingLeft} alt="" />
        <img className="book-wing book-wing--right" src={doveWingRight} alt="" />

        <div className="book-perspective">
          <div className={`book-flip book-flip--${phase}`}>

            <div className="book-face book-face--front">
              <div className="cover-frame">
                <img className="cover-logo" src={vakyaLogo} alt="Vakya" />
              </div>
            </div>

            <div className="book-face book-face--back">
              <div className="book-spine-shadow" />
              <div className="page page--left">
                <div className="page-heading">Uploaded Bond</div>
                <div className="page-rules">
                  <p className="page-line">
                    {typed}
                    <span className="pen-nib" aria-hidden="true">
                      <img className="pen-nib-img" src={quillPen} alt="" />
                    </span>
                  </p>
                </div>
              </div>
              <div className="page page--right" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLoader;

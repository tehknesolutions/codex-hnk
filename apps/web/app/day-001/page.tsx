import type { Metadata } from 'next';
import { Day001ImmersiveExperience } from './Day001ImmersiveExperience';
import { KetherOriginRelicLayer } from './KetherOriginRelicLayer';
import { WebAtriumBoundary, WebDay001RuntimeProvider } from './WebDay001Runtime';
import artStyles from './day001-art-pass-v2.module.css';
import transitionStyles from './day001-transitions-v1.module.css';

export const metadata: Metadata = {
  title: 'Dia 001 · Kether · HNK Codex',
  description: 'Experiência educacional-iniciática imersiva do Dia 001 de Kether no HNK Codex Digital.',
};

export default function Day001Page() {
  return (
    <div className={`${artStyles.artPass} ${transitionStyles.transitions}`}>
      <WebDay001RuntimeProvider>
        <WebAtriumBoundary>
          <Day001ImmersiveExperience />
          <KetherOriginRelicLayer />
        </WebAtriumBoundary>
      </WebDay001RuntimeProvider>
    </div>
  );
}

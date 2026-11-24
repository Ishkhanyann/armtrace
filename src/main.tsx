import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/noto-sans-armenian/armenian-400.css';
import '@fontsource/noto-sans-armenian/armenian-500.css';
import '@fontsource/noto-sans-armenian/armenian-600.css';
import '@fontsource/noto-sans-armenian/armenian-700.css';
import App from './App';
import { AppProvider } from './store';
import './styles.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="boot">
        <h1>ArmTrace</h1>
        <p>Էջը չհաջողվեց բացել։ Վերաբեռնեք այն՝ կրկին փորձելու համար։</p>
        <button className="button primary" onClick={() => location.reload()}>
          Վերաբեռնել
        </button>
        <button
          className="button secondary"
          onClick={() => {
            localStorage.removeItem('armtrace-demo-v1');
            location.hash = '/overview';
            location.reload();
          }}
        >
          Վերականգնել ցուցադրական տվյալները
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

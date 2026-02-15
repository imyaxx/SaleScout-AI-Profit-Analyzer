import ProfitAnalyzerPage from '@/pages/ProfitAnalyzerPage/ProfitAnalyzerPage';
import LanguageMenu from '@/shared/ui/LanguageMenu/LanguageMenu';
import s from './App.module.css';

export default function App() {
  return (
    <div className={s.root}>
      <nav className={s.nav}>
        <div className={s.navInner}>
          <div className={s.logoWrap}>
            <div className={s.logoIcon}>
              <span className={s.logoLetter}>S</span>
            </div>
            <span className={s.logoText}>SaleScout</span>
          </div>

          <div id="nav-progress-slot" className={s.progressSlot} />

          <div data-lang-wrap className={s.langWrap}>
            <LanguageMenu />
          </div>
        </div>
      </nav>

      <main>
        <ProfitAnalyzerPage />
      </main>
    </div>
  );
}

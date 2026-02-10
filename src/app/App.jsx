import AiProfitAnalyzerPage from '@/pages/AiProfitAnalyzerPage';
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

          <div className={s.langWrap}>
            <LanguageMenu />
          </div>
        </div>
      </nav>

      <main>
        <AiProfitAnalyzerPage />
      </main>
    </div>
  );
}

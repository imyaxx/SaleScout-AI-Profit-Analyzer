import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import s from './LanguageMenu.module.css';

const LANGUAGES = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KZ' },
  { code: 'en', label: 'EN' },
];

export default function LanguageMenu() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const current = LANGUAGES.find((lang) => lang.code === i18n.language) ?? LANGUAGES[0];

  useEffect(() => {
    if (!isOpen) return;

    const handlePointer = (event) => {
      if (!menuRef.current || !buttonRef.current) return;
      if (menuRef.current.contains(event.target) || buttonRef.current.contains(event.target)) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const items = menuRef.current?.querySelectorAll('button');
    const activeIndex = LANGUAGES.findIndex((lang) => lang.code === i18n.language);
    const focusTarget = items?.[Math.max(activeIndex, 0)];
    focusTarget?.focus();
  }, [isOpen, i18n.language]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleSelect = (code) => {
    if (code !== i18n.language) {
      i18n.changeLanguage(code);
    }
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div className={s.wrap}>
      <button
        ref={buttonRef}
        type="button"
        className={cn(s.button, isOpen && s.buttonOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={handleToggle}
      >
        <Globe size={16} className={s.icon} aria-hidden="true" />
        <span className={s.label}>{current.label}</span>
        <ChevronDown size={16} className={cn(s.chevron, isOpen && s.chevronOpen)} aria-hidden="true" />
      </button>

      {isOpen && (
        <div ref={menuRef} id={menuId} role="menu" className={s.menu}>
          {LANGUAGES.map((lang) => {
            const isActive = lang.code === i18n.language;
            return (
              <button
                key={lang.code}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                className={cn(s.menuItem, isActive && s.menuItemActive)}
                onClick={() => handleSelect(lang.code)}
              >
                <span>{lang.label}</span>
                <Check size={14} className={cn(s.menuCheck, isActive && s.menuCheckActive)} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

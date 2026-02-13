import { useState } from 'react';
import { Search, Store, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FormField, { inputClassName } from '@/shared/ui/FormField/FormField';
import fieldStyles from '@/shared/ui/FormField/FormField.module.css';
import s from './StepInput.module.css';

export default function StepInput({ initialUrl, initialShop, onBack, onNext }) {
  const { t } = useTranslation();
  const [url, setUrl] = useState(initialUrl);
  const [shop, setShop] = useState(initialShop);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!url || !url.includes('kaspi.kz')) {
      nextErrors.url = 'input.errors.url';
    }
    if (!shop || shop.trim().length < 2) {
      nextErrors.shop = 'input.errors.shop';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onNext(url.trim(), shop);
  };

  return (
    <form onSubmit={handleSubmit} className={s.root}>
      <div className={s.headerRow}>
        <div>
          <h2 className={s.title}>{t('input.title')}</h2>
          <p className={s.subtitle}>{t('input.subtitle')}</p>
        </div>
        <button type="button" onClick={onBack} className={s.btnBackDesktop}>
          <ArrowLeft size={16} />
          {t('input.back')}
        </button>
      </div>

      <div className={s.grid}>
        <FormField
          label={t('input.productLabel')}
          icon={<Search className={fieldStyles.icon} size={18} />}
          error={errors.url ? t(errors.url) : null}
        >
          <input
            type="text"
            placeholder={t('input.productPlaceholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputClassName(!!errors.url)}
          />
        </FormField>

        <FormField
          label={t('input.shopLabel')}
          icon={<Store className={fieldStyles.icon} size={18} />}
          error={errors.shop ? t(errors.shop) : null}
        >
          <input
            type="text"
            placeholder={t('input.shopPlaceholder')}
            value={shop}
            onChange={(e) => setShop(e.target.value)}
            className={inputClassName(!!errors.shop)}
          />
        </FormField>
      </div>

      <div className={s.footer}>
        <button type="button" onClick={onBack} className={s.btnBackMobile}>
          <ArrowLeft size={16} />
          {t('input.back')}
        </button>
        <button type="submit" className={s.btnSubmit}>
          {t('input.continue')}
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}

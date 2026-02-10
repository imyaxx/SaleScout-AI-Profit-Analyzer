import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Store, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FormField, { inputClassName } from '@/shared/ui/FormField';
import fieldStyles from '@/shared/ui/FormField/FormField.module.css';
import { cn } from '@/shared/lib/utils';
import s from './StepLeadForm.module.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizePhoneDigits = (value) => {
  const digits = value.replace(/\D/g, '');
  const rest = digits.startsWith('7') ? digits.slice(1) : digits;
  return rest.slice(0, 10);
};

const formatPhone = (digits) => `+7${digits}`;

const animations = {
  successFadeIn: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  },
  formFadeIn: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  },
};

export default function StepLeadForm({
  values,
  onChange,
  onBack,
  onSubmit,
  isSubmitting,
  error,
  success,
  onRestart,
}) {
  const { t, i18n } = useTranslation();
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => {
    const next = {};
    if (!values.name || values.name.trim().length < 2) {
      next.name = t('lead.errors.name');
    }
    const digits = normalizePhoneDigits(values.phone || '');
    if (digits.length !== 10) {
      next.phone = t('lead.errors.phone');
    }
    if (!values.email || !emailRegex.test(values.email.trim())) {
      next.email = t('lead.errors.email');
    }
    if (!values.shopName || values.shopName.trim().length < 2) {
      next.shopName = t('lead.errors.shop');
    }
    if (!values.description || values.description.trim().length < 2) {
      next.description = t('lead.errors.description');
    }
    return next;
  }, [values, i18n.language, t]);

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({ name: true, phone: true, email: true, shopName: true, description: true });
    if (!isValid) return;

    const digits = normalizePhoneDigits(values.phone || '');
    onSubmit({
      name: values.name.trim(),
      phone: formatPhone(digits),
      email: values.email.trim(),
      shopName: values.shopName.trim(),
      description: values.description.trim(),
    });
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  if (success) {
    return (
      <motion.div {...animations.successFadeIn} className={s.successRoot}>
        <div className={s.successIcon}>
          <CheckCircle2 size={28} />
        </div>
        <h2 className={s.successTitle}>{t('lead.successTitle')}</h2>
        <p className={s.successBody}>{t('lead.successBody')}</p>
        <button onClick={onRestart} className={s.successBtn}>
          {t('lead.newAnalysis')}
        </button>
      </motion.div>
    );
  }

  const phoneDigits = normalizePhoneDigits(values.phone || '');

  return (
    <motion.form onSubmit={handleSubmit} {...animations.formFadeIn} className={s.formRoot}>
      <div className={s.headerRow}>
        <div>
          <h2 className={s.title}>{t('lead.title')}</h2>
          <p className={s.subtitle}>{t('lead.subtitle')}</p>
        </div>
        <button type="button" onClick={onBack} className={s.btnBackDesktop}>
          <ArrowLeft size={16} />
          {t('lead.back')}
        </button>
      </div>

      <div className={s.grid}>
        <FormField
          label={t('lead.fields.name')}
          icon={<User className={fieldStyles.icon} size={18} />}
          error={touched.name ? errors.name : null}
        >
          <input
            type="text"
            value={values.name}
            onChange={(e) => {
              onChange({ name: e.target.value });
              setTouched((prev) => ({ ...prev, name: true }));
            }}
            onBlur={() => handleBlur('name')}
            placeholder={t('lead.placeholders.name')}
            className={inputClassName(!!(touched.name && errors.name))}
          />
        </FormField>

        <FormField
          label={t('lead.fields.phone')}
          icon={<Phone className={fieldStyles.icon} size={18} />}
          error={touched.phone ? errors.phone : null}
        >
          <input
            type="tel"
            value={formatPhone(phoneDigits)}
            onChange={(e) => {
              const digits = normalizePhoneDigits(e.target.value);
              onChange({ phone: formatPhone(digits) });
              setTouched((prev) => ({ ...prev, phone: true }));
            }}
            onBlur={() => handleBlur('phone')}
            placeholder={t('lead.placeholders.phone')}
            className={inputClassName(!!(touched.phone && errors.phone))}
          />
        </FormField>

        <FormField
          label={t('lead.fields.email')}
          icon={<Mail className={fieldStyles.icon} size={18} />}
          error={touched.email ? errors.email : null}
        >
          <input
            type="email"
            value={values.email}
            onChange={(e) => {
              onChange({ email: e.target.value });
              setTouched((prev) => ({ ...prev, email: true }));
            }}
            onBlur={() => handleBlur('email')}
            placeholder={t('lead.placeholders.email')}
            className={inputClassName(!!(touched.email && errors.email))}
          />
        </FormField>

        <FormField
          label={t('lead.fields.shop')}
          icon={<Store className={fieldStyles.icon} size={18} />}
          error={touched.shopName ? errors.shopName : null}
        >
          <input
            type="text"
            value={values.shopName}
            onChange={(e) => {
              onChange({ shopName: e.target.value });
              setTouched((prev) => ({ ...prev, shopName: true }));
            }}
            onBlur={() => handleBlur('shopName')}
            placeholder={t('lead.placeholders.shop')}
            className={inputClassName(!!(touched.shopName && errors.shopName))}
          />
        </FormField>
      </div>

      <div className={s.textareaWrap}>
        <FormField
          label={t('lead.fields.description')}
          icon={<FileText className={fieldStyles.iconTextarea} size={18} />}
          error={touched.description ? errors.description : null}
        >
          <textarea
            rows={2}
            value={values.description}
            onChange={(e) => {
              onChange({ description: e.target.value });
              setTouched((prev) => ({ ...prev, description: true }));
            }}
            onBlur={() => handleBlur('description')}
            placeholder={t('lead.placeholders.description')}
            className={cn(
              inputClassName(!!(touched.description && errors.description)),
              s.textareaField,
            )}
          />
        </FormField>
      </div>

      {error && <p className={s.serverError}>{error}</p>}

      <div className={s.footer}>
        <button type="button" onClick={onBack} className={s.btnBackMobile}>
          <ArrowLeft size={16} />
          {t('lead.back')}
        </button>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={cn(s.btnSubmit, (!isValid || isSubmitting) && s.btnSubmitDisabled)}
        >
          {isSubmitting ? t('lead.submitting') : t('lead.submit')}
        </button>
      </div>
    </motion.form>
  );
}

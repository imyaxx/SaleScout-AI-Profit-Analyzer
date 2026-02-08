import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      steps: {
        welcome: 'Приветствие',
        data: 'Данные',
        analysis: 'Анализ',
        lead: 'Заявка'
      },
      welcome: {
        badge: 'AI Анализ SaleScout',
        title: 'Давайте проанализируем прибыль вашего магазина',
        subtitle: 'Узнайте за 30 секунд, как выйти в ТОП-1 на Kaspi',
        cta: 'Начать анализ',
        card: {
          tag: 'Короткий путь к ТОП-1',
          time: '~30 сек',
          currentPosition: 'Текущая позиция',
          priceToTop: 'Цена до ТОП-1',
          ai: 'Рекомендации AI',
          aiDesc: 'Оптимизируйте цену и описание — рост продаж до 15%'
        }
      },
      input: {
        title: 'Введите данные',
        subtitle: 'Оба поля обязательны для точного анализа.',
        back: 'Назад',
        productLabel: 'Ссылка на товар',
        productPlaceholder: 'https://kaspi.kz/shop/p/...',
        shopLabel: 'Название магазина',
        shopPlaceholder: 'Ваш магазин на Kaspi',
        continue: 'Продолжить',
        errors: {
          url: 'Ссылка должна вести на kaspi.kz',
          shop: 'Введите название магазина (мин. 2 символа)'
        }
      },
      confirm: {
        title: 'Подтверждение анализа',
        subtitle: 'Проверьте данные перед запуском.',
        product: 'Товар',
        shop: 'Магазин',
        back: 'Назад',
        confirm: 'Подтвердить'
      },
      analysis: {
        title: 'Результат анализа по товару',
        date: '/ {{date}}',
        cta: 'Перейти к заявке',
        error: 'Ошибка анализа',
        unknownSeller: 'Неизвестный продавец',
        profitChart: {
          kicker: 'Прогноз прибыли на 30 дней',
          title: 'Рост продаж с интерактивной стратегией',
          current: 'Текущая стратегия',
          withSalescout: 'С SaleScout',
          day: 'День {{day}}',
          badges: [
            'График адаптируется под изменения цены в реальном времени',
            'Сценарий учитывает динамику Kaspi'
          ]
        },
        fomo: {
          kicker: 'Потенциал упущенной выгоды',
          title: 'Если бы вы начали 7 дней назад,',
          subtitle: 'вы бы заработали дополнительно:'
        },
        simulator: {
          kicker: 'Симулятор цены',
          title: 'А если снизить цену?',
          drop: 'Снижение цены',
          newPrice: 'Новая цена',
          decrease: 'Снижение',
          increase: 'Рост',
          noChange: 'Без изменений',
          relative: 'относительно текущей цены',
          position: 'Позиция',
          top1: 'Вы в ТОП-1',
          toTop1: 'До ТОП-1: {{price}}',
          profit: 'Прогноз прибыли',
          model: 'Модель учитывает спрос и положение в выдаче при изменении цены',
          leader: 'Лидер рынка сейчас: {{price}}',
          leaderTitle: 'Лидер рынка',
          leaderPriceLabel: 'Текущая цена лидера'
        },
        ranking: {
          kicker: 'Позиция на Kaspi',
          title: 'Ваш магазин с SaleScout',
          yourShop: 'Ваш магазин',
          reviews: 'отзывов',
          select: 'Выбрать'
        }
      },
      lead: {
        title: 'Оставьте заявку',
        subtitle: 'Получите персональный аудит и рекомендации от экспертов.',
        back: 'Назад',
        fields: {
          name: 'Имя',
          phone: 'Телефон',
          email: 'Email',
          shop: 'Название магазина Kaspi',
          description: 'Описание задачи'
        },
        placeholders: {
          name: 'Ваше имя',
          phone: '+7XXXXXXXXXX',
          email: 'you@email.com',
          shop: 'Название вашего магазина',
          description: 'Кратко опишите, что вы хотите улучшить'
        },
        errors: {
          name: 'Введите имя (мин. 2 символа)',
          phone: 'Введите номер в формате +7XXXXXXXXXX',
          email: 'Введите корректный email',
          shop: 'Введите название магазина (мин. 2 символа)',
          description: 'Опишите задачу (минимум 2 символа)'
        },
        submit: 'Отправить заявку',
        submitting: 'Отправляем...',
        successTitle: 'Заявка отправлена, мы свяжемся с вами',
        successBody: 'Наш менеджер подготовит персональный аудит и свяжется с вами в ближайшее время.',
        newAnalysis: 'Новый анализ'
      },
      errors: {
        genericTitle: 'Упс, что-то пошло не так',
        retry: 'Попробовать снова',
        analysisRender: 'Ошибка отображения анализа',
        analyzeFailed: 'Не удалось выполнить анализ',
        leadFailed: 'Не удалось отправить заявку'
      },
      footer: {
        text: '© 2026 SaleScout — Экосистема для селлеров №1. Все права защищены.'
      }
    }
  },
  kk: {
    translation: {
      steps: {
        welcome: 'Қош келдіңіз',
        data: 'Деректер',
        analysis: 'Талдау',
        lead: 'Өтінім'
      },
      welcome: {
        badge: 'SaleScout AI талдауы',
        title: 'Дүкеніңіздің пайдасын талдайық',
        subtitle: '30 секунд ішінде Kaspi-де ТОП-1-ге қалай шығуға болатынын біліңіз',
        cta: 'Талдауды бастау',
        card: {
          tag: 'ТОП-1-ге қысқа жол',
          time: '~30 сек',
          currentPosition: 'Қазіргі орын',
          priceToTop: 'ТОП-1-ге дейінгі баға',
          ai: 'AI ұсынымдары',
          aiDesc: 'Бағаны және сипаттаманы оңтайландырыңыз — сатылым 15%-ға дейін өседі'
        }
      },
      input: {
        title: 'Деректерді енгізіңіз',
        subtitle: 'Дәл талдау үшін екі өріс те міндетті.',
        back: 'Артқа',
        productLabel: 'Тауарға сілтеме',
        productPlaceholder: 'https://kaspi.kz/shop/p/...',
        shopLabel: 'Дүкен атауы',
        shopPlaceholder: 'Kaspi-дегі дүкеніңіз',
        continue: 'Жалғастыру',
        errors: {
          url: 'Сілтеме kaspi.kz-ке апаруы керек',
          shop: 'Дүкен атауын енгізіңіз (кемі 2 таңба)'
        }
      },
      confirm: {
        title: 'Талдауды растау',
        subtitle: 'Іске қоспас бұрын деректерді тексеріңіз.',
        product: 'Тауар',
        shop: 'Дүкен',
        back: 'Артқа',
        confirm: 'Растау'
      },
      analysis: {
        title: 'Тауар бойынша талдау нәтижесі',
        date: '/ {{date}}',
        cta: 'Өтінімге өту',
        error: 'Талдау қатесі',
        unknownSeller: 'Белгісіз сатушы',
        profitChart: {
          kicker: '30 күндік пайда болжамы',
          title: 'Интерактивті стратегиямен сатылым өсімі',
          current: 'Ағымдағы стратегия',
          withSalescout: 'SaleScout-пен',
          day: '{{day}}-күн',
          badges: [
            'График баға өзгерістеріне нақты уақытта бейімделеді',
            'Сценарий Kaspi динамикасын ескереді'
          ]
        },
        fomo: {
          kicker: 'Жоғалған пайда әлеуеті',
          title: 'Егер сіз 7 күн бұрын бастасаңыз,',
          subtitle: 'қосымша табыс табар едіңіз:'
        },
        simulator: {
          kicker: 'Баға симуляторы',
          title: 'Бағаны түсірсек ше?',
          drop: 'Бағаны төмендету',
          newPrice: 'Жаңа баға',
          decrease: 'Төмендеу',
          increase: 'Өсу',
          noChange: 'Өзгеріссіз',
          relative: 'ағымдағы бағамен салыстырғанда',
          position: 'Орын',
          top1: 'Сіз ТОП-1-де',
          toTop1: 'ТОП-1-ге дейін: {{price}}',
          profit: 'Пайда болжамы',
          model: 'Баға өзгергенде модель сұраныс пен тізімдегі орынды ескереді',
          leader: 'Қазір нарық көшбасшысының бағасы: {{price}}',
          leaderTitle: 'Нарық көшбасшысы',
          leaderPriceLabel: 'Көшбасшының ағымдағы бағасы'
        },
        ranking: {
          kicker: 'Kaspi-дегі орын',
          title: 'SaleScout-пен сіздің дүкеніңіз',
          yourShop: 'Сіздің дүкеніңіз',
          reviews: 'пікір',
          select: 'Таңдау'
        }
      },
      lead: {
        title: 'Өтінім қалдырыңыз',
        subtitle: 'Жеке аудит және сарапшылардың ұсынымдарын алыңыз.',
        back: 'Артқа',
        fields: {
          name: 'Аты',
          phone: 'Телефон',
          email: 'Email',
          shop: 'Kaspi дүкен атауы',
          description: 'Мәселе сипаттамасы'
        },
        placeholders: {
          name: 'Атыңыз',
          phone: '+7XXXXXXXXXX',
          email: 'you@email.com',
          shop: 'Дүкеніңіздің атауы',
          description: 'Нені жақсартқыңыз келетінін қысқаша жазыңыз'
        },
        errors: {
          name: 'Атыңызды енгізіңіз (кемі 2 таңба)',
          phone: 'Нөмірді +7XXXXXXXXXX форматында енгізіңіз',
          email: 'Дұрыс email енгізіңіз',
          shop: 'Дүкен атауын енгізіңіз (кемі 2 таңба)',
          description: 'Мәселені сипаттаңыз (кемі 2 таңба)'
        },
        submit: 'Өтінімді жіберу',
        submitting: 'Жіберілуде...',
        successTitle: 'Өтінім жіберілді, біз сізбен байланысамыз',
        successBody: 'Менеджеріміз жеке аудит дайындап, жақын уақытта сізбен байланысады.',
        newAnalysis: 'Жаңа талдау'
      },
      errors: {
        genericTitle: 'Ой, бірдеңе дұрыс болмады',
        retry: 'Қайта көріңіз',
        analysisRender: 'Талдауды көрсету қатесі',
        analyzeFailed: 'Талдауды орындау мүмкін болмады',
        leadFailed: 'Өтінімді жіберу мүмкін болмады'
      },
      footer: {
        text: '© 2026 SaleScout — сатушыларға арналған №1 экожүйе. Барлық құқықтар қорғалған.'
      }
    }
  },
  en: {
    translation: {
      steps: {
        welcome: 'Welcome',
        data: 'Data',
        analysis: 'Analysis',
        lead: 'Request'
      },
      welcome: {
        badge: 'SaleScout AI Analysis',
        title: 'Let’s analyze your store’s profit',
        subtitle: 'See in 30 seconds how to reach Top-1 on Kaspi',
        cta: 'Start analysis',
        card: {
          tag: 'Fast track to Top-1',
          time: '~30 sec',
          currentPosition: 'Current position',
          priceToTop: 'Price to Top-1',
          ai: 'AI recommendations',
          aiDesc: 'Optimize price and description — sales up to 15%'
        }
      },
      input: {
        title: 'Enter your data',
        subtitle: 'Both fields are required for accurate analysis.',
        back: 'Back',
        productLabel: 'Product link',
        productPlaceholder: 'https://kaspi.kz/shop/p/...',
        shopLabel: 'Store name',
        shopPlaceholder: 'Your Kaspi store',
        continue: 'Continue',
        errors: {
          url: 'The link must point to kaspi.kz',
          shop: 'Enter a store name (min. 2 characters)'
        }
      },
      confirm: {
        title: 'Confirm analysis',
        subtitle: 'Check the details before starting.',
        product: 'Product',
        shop: 'Store',
        back: 'Back',
        confirm: 'Confirm'
      },
      analysis: {
        title: 'Product analysis result',
        date: '/ {{date}}',
        cta: 'Proceed to request',
        error: 'Analysis error',
        unknownSeller: 'Unknown seller',
        profitChart: {
          kicker: '30-day profit forecast',
          title: 'Sales growth with an interactive strategy',
          current: 'Current strategy',
          withSalescout: 'With SaleScout',
          day: 'Day {{day}}',
          badges: [
            'The chart adapts to price changes in real time',
            'The scenario accounts for Kaspi dynamics'
          ]
        },
        fomo: {
          kicker: 'Missed profit potential',
          title: 'If you had started 7 days ago,',
          subtitle: 'you would have earned extra:'
        },
        simulator: {
          kicker: 'Price simulator',
          title: 'What if you lower the price?',
          drop: 'Price drop',
          newPrice: 'New price',
          decrease: 'Decrease',
          increase: 'Increase',
          noChange: 'No change',
          relative: 'relative to current price',
          position: 'Position',
          top1: "You're in Top-1",
          toTop1: 'To Top-1: {{price}}',
          profit: 'Profit forecast',
          model: 'The model accounts for demand and ranking position when price changes',
          leader: 'Market leader price now: {{price}}',
          leaderTitle: 'Market Leader',
          leaderPriceLabel: 'Current leader price'
        },
        ranking: {
          kicker: 'Kaspi position',
          title: 'Your store with SaleScout',
          yourShop: 'Your store',
          reviews: 'reviews',
          select: 'Select'
        }
      },
      lead: {
        title: 'Leave a request',
        subtitle: 'Get a personalized audit and expert recommendations.',
        back: 'Back',
        fields: {
          name: 'Name',
          phone: 'Phone',
          email: 'Email',
          shop: 'Kaspi store name',
          description: 'Task description'
        },
        placeholders: {
          name: 'Your name',
          phone: '+7XXXXXXXXXX',
          email: 'you@email.com',
          shop: 'Your store name',
          description: 'Briefly describe what you want to improve'
        },
        errors: {
          name: 'Enter your name (min. 2 characters)',
          phone: 'Enter a number in +7XXXXXXXXXX format',
          email: 'Enter a valid email',
          shop: 'Enter a store name (min. 2 characters)',
          description: 'Describe the task (min. 2 characters)'
        },
        submit: 'Submit request',
        submitting: 'Sending...',
        successTitle: "Request sent, we'll contact you",
        successBody: 'Our manager will prepare a personalized audit and contact you shortly.',
        newAnalysis: 'New analysis'
      },
      errors: {
        genericTitle: 'Oops, something went wrong',
        retry: 'Try again',
        analysisRender: 'Analysis rendering error',
        analyzeFailed: 'Failed to run analysis',
        leadFailed: 'Failed to submit request'
      },
      footer: {
        text: '© 2026 SaleScout — #1 ecosystem for sellers. All rights reserved.'
      }
    }
  }
} as const;

const supportedLanguages = ['ru', 'kk', 'en'] as const;
const storageKey = 'salescout-lang';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'ru';
  const saved = window.localStorage.getItem(storageKey);
  if (saved && supportedLanguages.includes(saved as (typeof supportedLanguages)[number])) {
    return saved;
  }
  return 'ru';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'ru',
  supportedLngs: [...supportedLanguages],
  interpolation: {
    escapeValue: false
  }
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
}

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, lng);
  }
});

export const languageOptions = supportedLanguages;
export default i18n;

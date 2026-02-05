import React, { useState } from 'react';
import { Search, Store, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StepInputProps {
  initialUrl: string;
  initialShop: string;
  onBack: () => void;
  onNext: (url: string, shop: string) => void;
}

const StepInput: React.FC<StepInputProps> = ({ initialUrl, initialShop, onBack, onNext }) => {
  const [url, setUrl] = useState(initialUrl);
  const [shop, setShop] = useState(initialShop);
  const [errors, setErrors] = useState<{ url?: string; shop?: string }>({});

  const validate = () => {
    const nextErrors: { url?: string; shop?: string } = {};
    if (!url || !url.includes('kaspi.kz')) {
      nextErrors.url = 'Ссылка должна вести на kaspi.kz';
    }
    if (!shop || shop.trim().length < 2) {
      nextErrors.shop = 'Введите название магазина (мин. 2 символа)';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onNext(url.trim(), shop);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Введите данные</h2>
          <p className="text-gray-500 mt-1">Оба поля обязательны для точного анализа.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="hidden sm:inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Назад
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">Ссылка на товар</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="https://kaspi.kz/shop/p/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={cn(
                'w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-2xl focus:bg-white transition-all outline-none',
                errors.url
                  ? 'border-red-300 ring-2 ring-red-50'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
              )}
            />
          </div>
          {errors.url && <p className="text-xs text-red-500 ml-1">{errors.url}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">Название магазина</label>
          <div className="relative">
            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Ваш магазин на Kaspi"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              className={cn(
                'w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-2xl focus:bg-white transition-all outline-none',
                errors.shop
                  ? 'border-red-300 ring-2 ring-red-50'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
              )}
            />
          </div>
          {errors.shop && <p className="text-xs text-red-500 ml-1">{errors.shop}</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
        <button
          type="button"
          onClick={onBack}
          className="sm:hidden w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Назад
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
        >
          Продолжить
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
};

export default StepInput;

import { useRouter } from 'next/router';
import ptBR from '../locales/pt-BR.json';
import en from '../locales/en.json';

type LocaleDict = Record<string, any>;

const dictionaries: Record<string, LocaleDict> = {
  'pt-BR': ptBR,
  'en': en,
};

export const useTranslation = () => {
  const router = useRouter();
  const { locale, defaultLocale } = router;
  
  const currentLocale = locale || defaultLocale || 'pt-BR';
  const dict = dictionaries[currentLocale] || dictionaries['pt-BR'];

  const t = (keyString: string, fallback?: string): string => {
    const keys = keyString.split('.');
    let value: any = dict;

    for (const key of keys) {
      if (value === undefined || value === null) break;
      value = value[key];
    }

    if (value === undefined || value === null || typeof value !== 'string') {
      return fallback || keyString;
    }

    return value;
  };

  return { t, locale: currentLocale };
};

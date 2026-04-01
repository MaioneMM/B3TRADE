import { useRouter } from 'next/router';

const LanguageSwitcher = () => {
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;

  const changeLanguage = (nextLocale: string) => {
    router.push({ pathname, query }, asPath, { locale: nextLocale });
  };

  return (
    <div style={{ display: 'flex', gap: '4px', marginLeft: '15px', alignItems: 'center' }}>
      <button 
        onClick={() => changeLanguage('pt-BR')} 
        style={{ 
          background: locale === 'pt-BR' ? '#26a69a' : 'transparent', 
          border: '1px solid #444', 
          color: '#fff', 
          borderRadius: '4px', 
          padding: '2px 6px', 
          fontSize: '0.75rem', 
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontWeight: locale === 'pt-BR' ? 'bold' : 'normal'
        }}
      >
        BR
      </button>
      <button 
        onClick={() => changeLanguage('en')} 
        style={{ 
          background: locale === 'en' ? '#26a69a' : 'transparent', 
          border: '1px solid #444', 
          color: '#fff', 
          borderRadius: '4px', 
          padding: '2px 6px', 
          fontSize: '0.75rem', 
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontWeight: locale === 'en' ? 'bold' : 'normal'
        }}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;

import { useTranslation } from 'react-i18next';
// '@mui
import { enUS, deDE } from '@mui/material/locale';

// ----------------------------------------------------------------------

const LANGS = [
  {
    label: 'Spanish',
    value: 'es',
    systemValue: deDE,

    icon: '/icons/ic_flag_es.svg',
  },
  {
    label: 'English',
    value: 'en',
    systemValue: enUS,
    icon: '/icons/ic_flag_en.svg',
  },
];

export default function useLocales() {
  const { i18n, t: translate } = useTranslation();
  const langStorage = localStorage.getItem('i18nextLng');
  const currentLang = LANGS.find((_lang) => _lang.value === langStorage) || LANGS[1];

  const handleChangeLanguage = (newlang) => {
    i18n.changeLanguage(newlang);
  };

  return {
    onChangeLang: handleChangeLanguage,
    translate,
    currentLang,
    allLang: LANGS,
  };
}

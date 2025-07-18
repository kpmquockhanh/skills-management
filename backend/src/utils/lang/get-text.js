import en from './en.js';

export default (lang, key) => {
  switch (lang) {
    case 'en':
      return en[key];
    default:
      return en[key];
  }
};

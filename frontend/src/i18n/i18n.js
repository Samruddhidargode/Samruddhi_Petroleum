import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      loginTitle: "Samruddhi Petroleum - DSM Login",
      startShift: "Start New Shift"
    }
  },
  mr: {
    translation: {
      loginTitle: "समृद्धी पेट्रोलियम - डीएसएम लॉगिन",
      startShift: "नवीन शिफ्ट सुरू करा"
    }
  },
  hi: {
    translation: {
      loginTitle: "समृद्धि पेट्रोलियम - डीएसएम लॉगिन",
      startShift: "नई शिफ्ट शुरू करें"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;

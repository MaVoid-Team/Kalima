import React from 'react';
import { useTranslation } from 'react-i18next';

const ThemeSwitcher = () => {
const {i18n,t} = useTranslation();
  return (
    <div className="dropdown dropdown-end" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
        {t("theme")}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 512 512">
          <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
        </svg>
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52 max-h-96 overflow-y-auto pr-4">
        {[
          "light", "dark", "cupcake", "bumblebee", "emerald",
          "corporate", "synthwave", "retro", "cyberpunk", "valentine",
          "halloween", "garden", "forest", "aqua", "lofi",
          "pastel", "fantasy", "wireframe", "black", "luxury",
          "dracula", "cmyk", "autumn", "business", "acid",
          "lemonade", "night", "coffee", "winter"
        ].map((theme) => (
          <li key={theme} className="py-1">
            <button
              data-set-theme={theme}
              className="btn btn-sm btn-block btn-ghost justify-start"
              onClick={() => document.documentElement.setAttribute('data-theme', theme)}
            >
              {theme}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThemeSwitcher;
import { useContext } from 'react';
import { SiteSettingsContext } from '../context/SiteSettingsContext.jsx';

export const useSiteSettings = () => useContext(SiteSettingsContext);

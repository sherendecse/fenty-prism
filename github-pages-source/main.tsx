import {createRoot} from 'react-dom/client';
import Home from './app/page';
import {LanguageProvider} from './app/i18n';
import './app/globals.css';
createRoot(document.getElementById('root')!).render(<LanguageProvider><Home/></LanguageProvider>);

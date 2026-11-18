import React from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider} from '@/theme/ThemeContext';
import {DaanLedgerProvider} from '@/contexts/DaanLedgerContext';
import DaanEntryScreen from '@/screens/DaanEntryScreen';
import {PreviewLanguage} from './platform';
createRoot(document.getElementById('root')!).render(<PreviewLanguage><ThemeProvider><DaanLedgerProvider><DaanEntryScreen route={{params:{}} as never} navigation={{goBack:()=>{document.body.dataset.saved='true';}} as never}/></DaanLedgerProvider></ThemeProvider></PreviewLanguage>);

import './i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { TooltipProvider } from '@onlook/ui/tooltip';
import AppBar from './components/AppBar';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@onlook/ui/toaster';
import Routes from './routes';
import '@fontsource-variable/inter';

function App() {
    // fetch('https://httpbin.org/get')
    // .then(response => response.json())
    // .then(data => console.log('测试请求成功:', data))
    // .catch(error => console.error('请求失败:', error));
    return (
        <I18nextProvider i18n={i18n}>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <TooltipProvider>
                    <AppBar />
                    <Routes />
                    <Toaster />
                </TooltipProvider>
            </ThemeProvider>
        </I18nextProvider>
    );
}

export default App;

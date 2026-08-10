import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './toast.jsx';
import { I18nProvider } from './i18n.jsx';
import Nav from './components/Nav.jsx';
import Home from './pages/Home.jsx';
import Lesson from './pages/Lesson.jsx';
import Vocab from './pages/Vocab.jsx';
import Grammar from './pages/Grammar.jsx';

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lesson/:id" element={<Lesson />} />
          <Route path="/vocab" element={<Vocab />} />
          <Route path="/grammar" element={<Grammar />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </I18nProvider>
  );
}

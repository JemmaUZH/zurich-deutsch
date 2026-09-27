import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './toast.jsx';
import { I18nProvider } from './i18n.jsx';
import Nav from './components/Nav.jsx';
import Home from './pages/Home.jsx';
import Lesson from './pages/Lesson.jsx';
import Vocab from './pages/Vocab.jsx';
import Grammar from './pages/Grammar.jsx';
import Mission from './pages/Mission.jsx';
import FindingProducts from './pages/FindingProducts.jsx';
import ModuleLesson from './pages/ModuleLesson.jsx';

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
          <Route path="/mission/flughafen-zoo" element={<Mission />} />
          <Route path="/module-1/finding-products" element={<FindingProducts />} />
          <Route path="/module-1/aktion-price-tags" element={<ModuleLesson />} />
          <Route path="/module-1/checkout" element={<ModuleLesson />} />
          <Route path="/module-1/cumulus-supercard" element={<ModuleLesson />} />
          <Route path="/module-1/fruit-bags-receipts" element={<ModuleLesson />} />
          <Route path="/module-1/mission" element={<ModuleLesson />} />
          <Route path="/module-1/discounts-aktion" element={<Navigate to="/module-1/aktion-price-tags" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </I18nProvider>
  );
}

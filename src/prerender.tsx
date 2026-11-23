import { renderToString } from 'react-dom/server';
import App from './App';
import GuidePage from './GuidePage';
import { guideFor } from './config/guides';
export { pages } from './config/pages';
export { guides } from './config/guides';
export const renderPage = (path: string) => renderToString(guideFor(path) ? <GuidePage /> : <App path={path} />);

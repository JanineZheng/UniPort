import { renderToString } from 'react-dom/server';
import App from './App';
export { pages } from './config/pages';
export const renderPage = (path: string) => renderToString(<App path={path} />);

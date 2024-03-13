import './style.css';
import { logger } from './logger.js';
import { defaultHooks } from '@wordpress/hooks';
import { set } from 'lodash-es';

if (window.wp?.hooks === undefined) {
    set(window, 'wp.hooks', defaultHooks);
}

logger('Loading...');

(async () => {
    while (!document.querySelector('#app')?.__vue__) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    while (!document.querySelector('#app #iframe')?.contentDocument.querySelector('#breakdance_canvas')) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger('Loading modules...');

    // TODO: dynamic import the features based on the enabled modules
    await import('./modules/plain-classses/main.js');
    await import('./modules/ko-fi/main.js');

    logger('Modules loaded!');
})();
/**
 * @module ko-fi
 * @package Yabe Movebender
 * @since 1.0.1
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Add a Ko-fi button to the Breakdance panel.
 */

import { logger } from '../../logger.js';
import './style.scss';
import toolbar_item from './toolbar-item.html?raw';

const nextSiblingSelector = '.topbar-section.undo-redo-top-bar-section';

const coffee = localStorage.getItem('yabe-movebender-ko-fi') ?? -1;

if (coffee === -1 || (coffee !== 'done' && coffee !== 'never' && new Date() > new Date(coffee))) {
    // create element from html string
    const koFiButtonHtml = document.createRange().createContextualFragment(`${toolbar_item}`);

    // add the button to the move toolbar as the first item
    const moveToolbar = document.querySelector(nextSiblingSelector).previousElementSibling;
    moveToolbar.insertBefore(koFiButtonHtml, moveToolbar.firstChild);

    document.getElementById('movebender-ko-fi').addEventListener('click', (el) => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        localStorage.setItem('yabe-movebender-ko-fi', date);
        window.open('https://ko-fi.com/Q5Q75XSF7', '_blank');
        document.getElementById('movebender-ko-fi').remove();
    });
}

logger('Module loaded!', { module: 'ko-fi' });

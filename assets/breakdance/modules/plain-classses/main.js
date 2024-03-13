/**
 * @module plain-classes 
 * @package Yabe Movebender
 * @since 1.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Add plain classes to the element panel.
 */

import './style.scss';

import { logger } from '../../logger.js';

import { nextTick, ref, watch } from 'vue';
import autosize from 'autosize';
import Tribute from 'tributejs';

import { debounce, set } from 'lodash-es';

import HighlightInTextarea from './highlight-in-textarea';
import { bdeV, bdeIframe, bdeIframeV } from '../../constant.js';

window.bdeV = bdeV;
window.bdeIframeV = bdeIframeV;

const textInput = document.createElement('textarea');
textInput.classList.add('movebender-plc-input');
const textInputContainer = document.createElement('div');
textInputContainer.classList.add('movebender-plc-input-container');

textInputContainer.appendChild(textInput);

textInput.setAttribute('rows', '1');
textInput.setAttribute('spellcheck', 'false');

const visibleElementPanel = ref(false); // 0 = hidden, > 0 = visible
const activeElementId = ref(null);

let hit = null; // highlight any text except spaces and new lines

autosize(textInput);

let autocompleteItems = [];

wp.hooks.addAction('movebender-autocomplete-items-refresh', 'movebender', () => {
    // wp hook filters. {value, color?, fontWeight?, namespace?}[]
    autocompleteItems = wp.hooks.applyFilters('movebender-autocomplete-items', [], textInput.value);
});

wp.hooks.doAction('movebender-autocomplete-items-refresh');

const tribute = new Tribute({
    containerClass: 'movebender-tribute-container',

    autocompleteMode: true,

    // Limits the number of items in the menu
    menuItemLimit: 30,

    noMatchTemplate: '',

    values: async function (text, cb) {
        const filters = await wp.hooks.applyFilters('movebender-autocomplete-items-query', autocompleteItems, text);
        cb(filters);
    },

    lookup: 'value',

    itemClass: 'class-item',

    // template
    menuItemTemplate: function (item) {
        let customStyle = '';

        if (item.original.color !== undefined) {
            customStyle += `background-color: ${item.original.color};`;
        }

        if (item.original.fontWeight !== undefined) {
            customStyle += `font-weight: ${item.original.fontWeight};`;
        }

        return `
            <span class="class-name" data-tribute-class-name="${item.original.value}">${item.string}</span>
            <span class="class-hint" style="${customStyle}"></span>
        `;
    },
});

tribute.setMenuContainer = function (el) {
    this.menuContainer = el;
};

const tributeEventCallbackOrigFn = tribute.events.callbacks;

tribute.events.callbacks = function () {
    return {
        ...tributeEventCallbackOrigFn.call(this),
        up: (e, el) => {
            // navigate up ul
            if (this.tribute.isActive && this.tribute.current.filteredItems) {
                e.preventDefault();
                e.stopPropagation();
                let count = this.tribute.current.filteredItems.length,
                    selected = this.tribute.menuSelected;

                if (count > selected && selected > 0) {
                    this.tribute.menuSelected--;
                    this.setActiveLi();
                } else if (selected === 0) {
                    this.tribute.menuSelected = count - 1;
                    this.setActiveLi();
                    this.tribute.menu.scrollTop = this.tribute.menu.scrollHeight;
                }
                previewTributeEventCallbackUpDown();
            }
        },
        down: (e, el) => {
            // navigate down ul
            if (this.tribute.isActive && this.tribute.current.filteredItems) {
                e.preventDefault();
                e.stopPropagation();
                let count = this.tribute.current.filteredItems.length - 1,
                    selected = this.tribute.menuSelected;

                if (count > selected) {
                    this.tribute.menuSelected++;
                    this.setActiveLi();
                } else if (count === selected) {
                    this.tribute.menuSelected = 0;
                    this.setActiveLi();
                    this.tribute.menu.scrollTop = 0;
                }
                previewTributeEventCallbackUpDown();
            }
        },
    };
};

tribute.attach(textInput);

bdeV.$store.subscribeAction((action, state) => {
    if (action.type === 'ui/activateElement') {
        activeElementId.value = action.payload;
    }

    if (action.type === 'ui/setLeftSidebarState') {
        visibleElementPanel.value = action.payload === 'elementproperties' ? true : false;
    }
});

watch([activeElementId, visibleElementPanel], (newVal, oldVal) => {
    if (newVal[0] !== oldVal[0]) {
        nextTick(() => {
            classDownstream();
            onTextInputChanges();
        });
    }

    if (newVal[0] && newVal[1]) {
        nextTick(() => {
            const panelElementClassesEl = document.querySelector('.breakdance-element-properties-panel .vscroll-scroll .vscroll-scroll');
            if (panelElementClassesEl.querySelector('.movebender-plc-input') === null) {
                panelElementClassesEl.insertBefore(textInputContainer, panelElementClassesEl.firstChild);
            }
        });
    }
});

hit = new HighlightInTextarea(textInput, {
    highlight: [
        {
            highlight: /(?<=\s|^)(?:(?!\s).)+(?=\s|$)/g,
            className: 'word',
        },
        {
            highlight: /(?<=\s)\s/g,
            className: 'multispace',
            blank: true,
        },
    ],
});

async function classDownstream() {
    textInput.value = bdeV.$store.getters['ui/activeElement'].data.properties?.settings?.advanced?.classes?.join(' ') || '';
}

// Stupid way to check if the path is exist
async function checkUpstreamPath() {
    if (bdeV.$store.getters['ui/activeElement'].data?.properties?.settings?.advanced?.classes) {
        return true;
    }

    const tab = document.querySelector('.properties-panel-tab.breakdance-tab.breakdance-tab--id-settings');
    tab.click();

    let subtab = document.querySelector('#settings .properties-panel-accordion.conditional-control-display-visible>div');
    while (subtab === null) {
        subtab = document.querySelector('#settings .properties-panel-accordion.conditional-control-display-visible>div');
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (!subtab.parentElement.classList.contains('expanded')) {
        subtab.click();
    }

    let inp = document.querySelector('#breakdance-class-input-search input[placeholder=".my-cool-class"]');

    while (inp === null) {
        inp = document.querySelector('#breakdance-class-input-search input[placeholder=".my-cool-class"]');
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    // focus the input
    inp.focus();

    // type the value to the input like a human
    const text = 'movebender';
    inp.value = text;
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 100));

    const btn = document.querySelector('#breakdance-class-input-search>button');
    btn.click();

    return true;

}

// delay to 50ms
const debouncedClassUpstream = debounce(classUpstream, 50);

async function classUpstream() {
    if (! await checkUpstreamPath()) {
        logger('Upstream path not found!', { module: 'plain-classes', type: 'error' });
        return;
    }

    // bring back the focus to the input
    textInput.focus();

    set(
        bdeV.$store.getters['ui/activeElement'].data, 'properties.settings.advanced.classes',
        textInput.value.trim().split(' ').filter((c) => c.trim() !== '') || []
    );

    // TODO: register class as global selectors.
};

textInput.addEventListener('input', function (e) {
    debouncedClassUpstream();
});

function onTextInputChanges() {
    nextTick(() => {
        try {
            hit.handleInput();
        } catch (error) { }
        autosize.update(textInput);
        // tribute.setMenuContainer(document.querySelector('div.hit-container'));
        tribute.hideMenu();
    });
};

const observerAutocomplete = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
                const className = node.querySelector('.class-name').dataset.tributeClassName;

                node.addEventListener('mouseenter', (e) => {
                    previewAddClass(className);
                });

                node.addEventListener('mouseleave', (e) => {
                    previewResetClass();

                });

                node.addEventListener('click', (e) => {
                    previewResetClass();
                    previewAddClass(className);
                });
            });
        }
    });
});

let menuAutocompleteItemeEl = null;

textInput.addEventListener('tribute-active-true', function (e) {
    if (menuAutocompleteItemeEl === null) {
        menuAutocompleteItemeEl = document.querySelector('.movebender-tribute-container>ul');
    }
    nextTick(() => {
        if (menuAutocompleteItemeEl) {
            observerAutocomplete.observe(menuAutocompleteItemeEl, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        }
    });
});

function previewAddClass(className) {
    const activeEl = bdeIframeV.$store.getters['ui/activeElement'].id;
    const elementNode = bdeIframe.querySelector(`[data-node-id="${activeEl}"]`);
    // add class to the element
    elementNode.classList.add(className);

    // store the class name to the data-tribute-class-name attribute
    elementNode.dataset.tributeClassName = className;
}

function previewResetClass() {
    resetTributeClass();
}

function previewTributeEventCallbackUpDown() {
    let li = tribute.menu.querySelector('li.highlight>span.class-name');

    previewResetClass();
    previewAddClass(li.dataset.tributeClassName);
}

function resetTributeClass() {
    const activeEl = bdeIframeV.$store.getters['ui/activeElement'].id;
    const elementNode = bdeIframe.querySelector(`[data-node-id="${activeEl}"]`);
    if (elementNode.dataset.tributeClassName) {
        elementNode.classList.remove(elementNode.dataset.tributeClassName);
        elementNode.dataset.tributeClassName = '';
    }
}

logger('Module loaded!', { module: 'plain-classes' });
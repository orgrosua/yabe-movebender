// export const brx = document.querySelector('.brx-body');
// export const brxGlobalProp = document.querySelector('.brx-body').__vue_app__.config.globalProperties;
// export const brxIframe = document.getElementById('move-builder-iframe');
// export const brxIframeGlobalProp = brxIframe.contentDocument.querySelector('.brx-body').__vue_app__.config.globalProperties;

export const bde = document.querySelector('#app');
export const bdeV = bde.__vue__;
export const bdeIframe = document.querySelector('#app #iframe')?.contentDocument.querySelector('#breakdance_canvas');
export const bdeIframeV = bdeIframe.__vue__;
import { type DirectiveBinding, createApp, h } from 'vue';
import FullscreenImage from '../component/FullscreenImage.vue';
import { type FullscreenImageProps } from '../types';
export interface HtmlElementWithMethod extends HTMLElement {
  openFullscreenImage: () => any
}

export const vFullscreenImagePlugin = {
  mounted(el: HtmlElementWithMethod, binding: DirectiveBinding<FullscreenImageProps>) {
    const openFullscreenImage = () => {
      const app = createApp({
        render() {
          return h(FullscreenImage, { ...binding.value, onClose: () => closeFullscreenImage(app, container) });
        },
      });
      const container = document.createElement('div');
      const anchorElement = document.querySelector(binding.value?.anchor || 'body')
      if (anchorElement) {
        anchorElement.appendChild(container);
        app.mount(container);
      }

    };

    const closeFullscreenImage = (app: any, container: HTMLElement) => {
      // Cleanup and close the modal
      app.unmount();
      container.remove();
    };

    // Add cursor:pointer; style to the element
    el.style.cursor = 'pointer';

    el.addEventListener('click', openFullscreenImage);

    // Store the openFullscreenImage function in a variable accessible during beforeUnmount
    el['openFullscreenImage'] = openFullscreenImage;
  },

  beforeUnmount(el: HtmlElementWithMethod) {
    // Remove the event listener using the stored function reference
    el.removeEventListener('click', el['openFullscreenImage']);
  },
};

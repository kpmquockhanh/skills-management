import type { App } from "vue";
import { vFullscreenImagePlugin } from "./directives/v-fullscreen-image";
export type { FullscreenImageProps } from './types';

export function fullscreenImagePlugin(app: App) {  
  app.directive('fullscreen-image', vFullscreenImagePlugin)
}
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/stores/*' {
  const store: any
  export default store
}

declare module '@/components/*' {
  const component: any
  export default component
}

declare module '@/views/*' {
  const component: any
  export default component
}

declare module '@/types/*' {
  const types: any
  export default types
}

declare module '@/utils/*' {
  const utils: any
  export default utils
} 
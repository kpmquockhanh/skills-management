export const getSrc = (src: string|null|undefined, preview?: boolean) => {
  if (!src) return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  if (preview) {
    return `${import.meta.env.VITE_CDN_PREVIEW_URL}/${src}`
  }
  return `${import.meta.env.VITE_CDN_URL}/${src}`
}

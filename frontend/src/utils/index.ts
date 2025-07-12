export const getSrc = (src: string, preview?: boolean) => {
  if (preview) {
    return `${import.meta.env.VITE_CDN_PREVIEW_URL}/${src}`
  }
  return `${import.meta.env.VITE_CDN_URL}/${src}`
}

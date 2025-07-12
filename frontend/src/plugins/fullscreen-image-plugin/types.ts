export interface FullscreenImageProps {
  imageUrl: string;
  anchor?: string;
  animation?: 'fade' | 'blur' | 'none';
  imageAlt?: string;
  withDownload?: boolean;
  withClose?: boolean;
  withFocusOnClose?: boolean;
  withCloseOnEscape?: boolean;
  closeOnClikOutside?: boolean;
  maxHeight?: string;
  maxWidth?: string;
  backdropColor?: string;
  details?: {
    description?: string;
    itemId?: string;
    createdAt?: string;
    createdBy?: {
      name?: string;
      photoUrl?: string;
    };
    public?: boolean;
  }
}


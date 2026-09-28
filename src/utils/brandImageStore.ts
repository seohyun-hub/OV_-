// Brand Image Store for user-managed Oak Valley / Park Roche branding assets
const HERO_IMAGE_KEY = 'oakvalley_brand_hero_image';
const LOGIN_IMAGE_KEY = 'oakvalley_brand_login_image';
export const BRAND_IMAGE_EVENT = 'oakvalley_brand_images_updated';

export interface BrandImages {
  heroImage: string | null;
  loginImage: string | null;
}

export const getBrandImages = (): BrandImages => {
  try {
    return {
      heroImage: localStorage.getItem(HERO_IMAGE_KEY) || null,
      loginImage: localStorage.getItem(LOGIN_IMAGE_KEY) || null,
    };
  } catch {
    return { heroImage: null, loginImage: null };
  }
};

export const setBrandHeroImage = (dataUrl: string | null): void => {
  try {
    if (dataUrl) {
      localStorage.setItem(HERO_IMAGE_KEY, dataUrl);
    } else {
      localStorage.removeItem(HERO_IMAGE_KEY);
    }
    window.dispatchEvent(new Event(BRAND_IMAGE_EVENT));
  } catch (e) {
    console.error('Failed to save brand hero image:', e);
  }
};

export const setBrandLoginImage = (dataUrl: string | null): void => {
  try {
    if (dataUrl) {
      localStorage.setItem(LOGIN_IMAGE_KEY, dataUrl);
    } else {
      localStorage.removeItem(LOGIN_IMAGE_KEY);
    }
    window.dispatchEvent(new Event(BRAND_IMAGE_EVENT));
  } catch (e) {
    console.error('Failed to save brand login image:', e);
  }
};

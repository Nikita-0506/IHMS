// Avatar State & LocalStorage Manager for Doctors and Patients

const STORAGE_KEY = 'ihms_custom_avatars_v2';

export function getCustomAvatars() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to parse custom avatars:', e);
    return {};
  }
}

export function getAvatarFor(key, defaultUrl) {
  if (!key) return defaultUrl;
  const avatars = getCustomAvatars();
  return avatars[key] || defaultUrl;
}

export function saveAvatarFor(key, dataUrl) {
  if (!key) return;
  const avatars = getCustomAvatars();
  avatars[key] = dataUrl;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(avatars));
    // Dispatch custom event for real-time synchronization across all components
    window.dispatchEvent(new CustomEvent('ihms_avatar_updated', { detail: { key, dataUrl } }));
  } catch (e) {
    console.error('Failed to save avatar to localStorage:', e);
  }
}

export function subscribeAvatarUpdates(callback) {
  const handler = (e) => {
    if (e.detail && callback) {
      callback(e.detail.key, e.detail.dataUrl);
    }
  };
  window.addEventListener('ihms_avatar_updated', handler);
  return () => window.removeEventListener('ihms_avatar_updated', handler);
}

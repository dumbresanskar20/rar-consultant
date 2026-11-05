const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = (
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '8b67ad90-469d-40af-b193-a644112dc3db'
).trim();

export function getConsentTimestampIST(date = new Date()) {
  const formatted = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
  return `${formatted} IST`;
}

export async function submitEnquiry(values) {
  if (!ACCESS_KEY) {
    console.warn(
      'RAR Consultant contact form is not configured: set VITE_WEB3FORMS_ACCESS_KEY before launch.',
    );
    return { success: false, reason: 'missing-key' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  const formData = new FormData();
  formData.append('access_key', ACCESS_KEY);
  formData.append('subject', `New Enquiry from ${values.fullName} – ${values.service} | RAR Consultant Website`);
  formData.append('from_name', 'RAR Consultant Website');
  formData.append('name', values.fullName);
  formData.append('email', values.email);
  formData.append('mobile', values.mobile);
  formData.append('service', values.service);
  formData.append('message', values.message);
  formData.append('consent', 'Yes');
  formData.append('consent_timestamp_ist', getConsentTimestampIST());
  formData.append('consent_version', 'v1.0');

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.success === true) {
      return { success: true };
    }
    console.error('Web3Forms response status:', response.status, data);
    return { success: false, reason: data.message || 'provider' };
  } catch (error) {
    console.error('Submission error:', error);
    if (error?.name === 'AbortError') return { success: false, reason: 'timeout' };
    return { success: false, reason: 'network' };
  } finally {
    clearTimeout(timeout);
  }
}

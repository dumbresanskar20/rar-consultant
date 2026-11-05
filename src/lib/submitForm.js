const ENDPOINT = '/api/contact';

export async function submitEnquiry(values) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  const payload = {
    fullName: values.fullName,
    email: values.email,
    mobile: values.mobile,
    service: values.service,
    message: values.message,
    consent: values.consent ? 'Yes' : 'No',
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && data.success === true) {
      return { success: true };
    }

    console.error('Contact API error response:', response.status, data);
    return {
      success: false,
      reason: data.reason || data.message || 'provider',
    };
  } catch (error) {
    console.error('Submission request exception:', error);
    if (error?.name === 'AbortError') return { success: false, reason: 'timeout' };
    return { success: false, reason: 'network' };
  } finally {
    clearTimeout(timeout);
  }
}

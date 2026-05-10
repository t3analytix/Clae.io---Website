module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || 'raghav.rao@t3analytix.com';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'CLAE Contact <onboarding@resend.dev>';

  if (!apiKey) {
    return res.status(500).json({ error: 'Email service is not configured' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject: 'New CLAE contact form submission',
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        '',
        message
      ].join('\n')
    })
  });

  if (!resendResponse.ok) {
    return res.status(502).json({ error: 'Email provider rejected the message' });
  }

  return res.status(200).json({ ok: true });
};

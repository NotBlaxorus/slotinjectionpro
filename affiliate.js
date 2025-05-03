const API = 'https://dev.slotinjection.com';  // e.g. https://api.slotinjectionpro.com
const loginForm = document.getElementById('login-form');
const dashboard = document.getElementById('dashboard');
const errorP = document.getElementById('login-error');

const paypalForm         = document.getElementById('paypal-email-form');
const paypalCard         = document.getElementById('paypal-email-card');
const paypalDisplay      = document.getElementById('paypal-email-display');
const paypalError        = document.getElementById('paypal-error');
const paypalInput        = document.getElementById('paypal-email-input');
const paypalConfirmInput = document.getElementById('paypal-email-confirm-input');
const savePaypalBtn      = document.getElementById('btn-save-paypal');
const changePaypalBtn    = document.getElementById('btn-change-paypal');

document.getElementById('btn-login').onclick = async () => {
  errorP.textContent = '';
  const email = document.getElementById('email').value;
  const pw = document.getElementById('password').value;
  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email, password: pw})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error||res.statusText);
    localStorage.setItem('access_token', data.access_token);
    showDashboard(true);
  } catch (e) {
    errorP.textContent = e.message;
  }
};

document.getElementById('btn-logout').onclick = () => {
  localStorage.removeItem('access_token');
  dashboard.classList.add('hidden');
  loginForm.classList.remove('hidden');
};

async function showDashboard(loginFlow = false) {
  const token = localStorage.getItem('access_token');
  const opts = { headers: { Authorization: `Bearer ${token}` } };

  // Check affiliate status on dashboard load
  const profileRes = await fetch(`${API}/affiliate/profile`, opts);
  if (!profileRes.ok) {
    if (loginFlow) {
      alert('You are not an affiliate.');
    }
    dashboard.classList.add('hidden');
    loginForm.classList.remove('hidden');
    return;
  }
  const profile = await profileRes.json();

  // Now show dashboard
  loginForm.classList.add('hidden');
  dashboard.classList.remove('hidden');

  // Populate profile data
  document.getElementById('affiliate-name-text').textContent = profile.name;
  document.getElementById('affiliate-code').textContent = profile.code;
  document.getElementById('affiliate-commission').textContent = profile.commission_pct;

  // Summary
  let res = await fetch(`${API}/affiliate/summary`, opts);
  let sum = await res.json();
  document.getElementById('earned').textContent = (sum.earned_cents/100).toFixed(2);
  document.getElementById('paid').textContent = (sum.paid_cents/100).toFixed(2);
  document.getElementById('owed').textContent = (sum.owed_cents/100).toFixed(2);

  // Payouts
  res = await fetch(`${API}/affiliate/payouts`, opts);
  let payoutsData = await res.json();
  const ul = document.getElementById('payout-list');
  const noPayoutsEl = document.getElementById('no-payouts');
  ul.innerHTML = '';
  // Handle either array or object with .payouts
  const payoutsArr = Array.isArray(payoutsData) ? payoutsData : (payoutsData.payouts || []);
  if (payoutsArr.length === 0) {
    noPayoutsEl.classList.remove('hidden');
  } else {
    noPayoutsEl.classList.add('hidden');
    payoutsArr.forEach(p => {
      const li = document.createElement('li');
      const date = new Date(p.paid_at).toLocaleDateString();
      const amount = (p.amount_cents !== undefined
        ? p.amount_cents / 100
        : (p.amount || 0));
      li.textContent = `${date}: $${amount.toFixed(2)}`;
      ul.appendChild(li);
    });
  }

  // PayPal email logic
  const paypalRes  = await fetch(`${API}/affiliate/paypal-email`, opts);
  const paypalJson = paypalRes.ok ? await paypalRes.json() : {};
  const existing = paypalJson.paypalEmail;
  if (existing) {
    paypalDisplay.textContent = existing;
    paypalCard.classList.remove('hidden');
    paypalForm.classList.add('hidden');
  } else {
    paypalForm.classList.remove('hidden');
    paypalCard.classList.add('hidden');
  }
}

// On load, if we already have a token, skip to dashboard
if (localStorage.getItem('access_token')) {
  showDashboard(false);
}

savePaypalBtn.onclick = async () => {
  paypalError.textContent = '';
  const email = paypalInput.value.trim();
  const confirmEmail = paypalConfirmInput.value.trim();
  if (!email || !confirmEmail) {
    paypalError.textContent = 'Please enter and confirm your PayPal email.';
    return;
  }
  if (email !== confirmEmail) {
    paypalError.textContent = 'Emails do not match.';
    return;
  }
  try {
    const res = await fetch(`${API}/affiliate/paypal-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ paypalEmail: email })
    });
    if (!res.ok) throw new Error('Could not save PayPal email.');
    paypalDisplay.textContent = email;
    paypalForm.classList.add('hidden');
    paypalCard.classList.remove('hidden');
  } catch (e) {
    paypalError.textContent = e.message;
  }
};

changePaypalBtn.onclick = () => {
  // Request Email Change: functionality to be implemented later
};
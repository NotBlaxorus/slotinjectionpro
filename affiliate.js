const API = 'https://dev.slotinjection.com';  // e.g. https://api.slotinjectionpro.com
const loginForm = document.getElementById('login-form');
const dashboard = document.getElementById('dashboard');
const errorP = document.getElementById('login-error');

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
    showDashboard();
  } catch (e) {
    errorP.textContent = e.message;
  }
};

document.getElementById('btn-logout').onclick = () => {
  localStorage.removeItem('access_token');
  dashboard.classList.add('hidden');
  loginForm.classList.remove('hidden');
};

async function showDashboard() {
  loginForm.classList.add('hidden');
  dashboard.classList.remove('hidden');
  const token = localStorage.getItem('access_token');
  const opts = {headers:{Authorization:`Bearer ${token}`}};

  // Profile
  let res = await fetch(`${API}/affiliate/profile`, opts);
  if (!res.ok) return alert('Not an affiliate');
  let profile = await res.json();
  document.getElementById('affiliate-name').textContent = profile.name;
  document.getElementById('affiliate-code').textContent = profile.code;
  document.getElementById('affiliate-commission').textContent = profile.commission_pct;

  // Summary
  res = await fetch(`${API}/affiliate/summary`, opts);
  let sum = await res.json();
  document.getElementById('earned').textContent = (sum.earned_cents/100).toFixed(2);
  document.getElementById('paid').textContent = (sum.paid_cents/100).toFixed(2);
  document.getElementById('owed').textContent = (sum.owed_cents/100).toFixed(2);

  // Payouts
  res = await fetch(`${API}/affiliate/payouts`, opts);
  let hist = await res.json();
  const ul = document.getElementById('payout-list');
  ul.innerHTML = '';
  hist.payouts.forEach(p => {
    let li = document.createElement('li');
    let date = new Date(p.paid_at).toLocaleDateString();
    li.textContent = `${date}: $${(p.amount_cents/100).toFixed(2)}`;
    ul.appendChild(li);
  });
}

// On load, if we already have a token, skip to dashboard
if (localStorage.getItem('access_token')) {
  showDashboard();
}
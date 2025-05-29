// affiliate_dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    // Not logged in; redirect to login
    window.location.href = 'log_in.html';
    return;
  }

  try {
    // Fetch dashboard data
    const response = await fetch(
      'https://slotinjectionpro-backend.onrender.com/affiliate/dashboard',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to load dashboard data');
    }
    const data = await response.json();

    // Populate Affiliate Info
    const info = data.affiliate;
    document.getElementById('affiliate-code').textContent = info.code;
    document.getElementById('affiliate-name').textContent = info.name;
    document.getElementById('affiliate-commission').textContent = info.commissionPct + '%';
    // Optionally display payment details if present
    if (info.paypalEmail) {
      document.getElementById('affiliate-paypal').textContent = info.paypalEmail;
    }
    if (info.bankName) {
      document.getElementById('affiliate-bank').textContent = `${info.bankName} • ${info.accountNumber} • ${info.routingNumber}`;
      document.getElementById('affiliate-country').textContent = info.country;
    }

    // Populate Latest Referrals
    const txContainer = document.getElementById('transactions-list');
    data.transactions.forEach(tx => {
      const row = document.createElement('div');
      row.className = 'transaction-row';
      row.innerHTML = `
        <span>${new Date(tx.purchase_date).toLocaleDateString()}</span>
        <span>${tx.user_id}</span>
        <span>${tx.plan_identifier}</span>
        <span>$${(tx.plan_price_cents/100).toFixed(2)}</span>
        <span>$${(tx.commission_cents/100).toFixed(2)}</span>
        <span>${tx.status}</span>
      `;
      txContainer.appendChild(row);
    });

    // Populate Payout History
    const poContainer = document.getElementById('payouts-list');
    data.payouts.forEach(po => {
      const row = document.createElement('div');
      row.className = 'payout-row';
      row.innerHTML = `
        <span>${new Date(po.paid_at).toLocaleDateString()}</span>
        <span>$${(po.amount_cents/100).toFixed(2)}</span>
        <span>${po.payout_method || '—'}</span>
      `;
      poContainer.appendChild(row);
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    alert('Unable to load your affiliate dashboard. Please log in again.');
    window.location.href = 'log_in.html';
  }
});

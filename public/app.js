// State Variables
let appData = {
  rooms: [],
  settings: {
    buildingName: 'कारेगाव रेंटल, पुणे',
    ownerUpi: '9876543210@ybl',
    rate: 10
  }
};

let currentTenantRoomNumber = 1;
let currentActiveFilter = 'all';
let isAdminUnlocked = sessionStorage.getItem('admin_unlocked') === 'true';
let currentEditingRoomNumber = 1;
let currentReceiptRoom = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  // Check URL params for room number e.g. ?room=6
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = parseInt(urlParams.get('room'));
  if (roomParam && roomParam >= 1 && roomParam <= 17) {
    currentTenantRoomNumber = roomParam;
  }

  // Check view param e.g. ?view=admin
  const viewParam = urlParams.get('view');
  if (viewParam === 'admin') {
    switchView('admin');
  }

  fetchData();
});

// Toast Notifications
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  toastMsg.textContent = message;
  if (isError) {
    toastIcon.className = 'fa-solid fa-circle-exclamation text-rose-400 text-lg';
  } else {
    toastIcon.className = 'fa-solid fa-circle-check text-emerald-400 text-lg';
  }

  toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
  }, 3500);
}

// Fetch all Data from Backend
async function fetchData() {
  try {
    const res = await fetch('/api/rooms');
    const data = await res.json();
    if (data.success) {
      appData.rooms = data.rooms;
      if (data.settings) {
        appData.settings = data.settings;
        document.getElementById('headerBuildingTitle').textContent = data.settings.buildingName || 'कारेगाव रेंटल रूम्स, पुणे';
      }
      populateTenantRoomSelector();
      loadTenantRoom(currentTenantRoomNumber);
      if (isAdminUnlocked) {
        renderAdminDashboard();
        fetchStats();
      }
    }
  } catch (err) {
    console.error('Error fetching data:', err);
    showToast('सर्व्हरशी संपर्क होऊ शकला नाही', true);
  }
}

// Fetch Stats for Admin
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.success && data.stats) {
      const s = data.stats;
      document.getElementById('statTotalRooms').textContent = s.totalRooms;
      document.getElementById('statOccupiedRooms').textContent = s.occupiedRooms;
      document.getElementById('statVacantRooms').textContent = `${s.vacantRooms} रिकाम्या`;
      document.getElementById('statTotalRent').textContent = `₹${s.totalRent.toLocaleString('en-IN')}`;
      document.getElementById('statTotalLightBill').textContent = `₹${s.totalLightBill.toLocaleString('en-IN')}`;
      document.getElementById('statTotalCollected').textContent = `₹${s.totalCollected.toLocaleString('en-IN')}`;
      document.getElementById('statTotalDues').textContent = `₹${s.totalDues.toLocaleString('en-IN')}`;
      document.getElementById('statPendingVerifPill').textContent = `${s.pendingVerificationCount} व्हेरिफिकेशन बाकी`;
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

// Switch between Tenant and Admin Views
function switchView(view) {
  const tenantView = document.getElementById('tenantView');
  const adminView = document.getElementById('adminView');
  const navTenantBtn = document.getElementById('navTenantBtn');
  const navAdminBtn = document.getElementById('navAdminBtn');

  if (view === 'tenant') {
    tenantView.classList.remove('hidden');
    adminView.classList.add('hidden');
    navTenantBtn.className = 'px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 bg-white text-blue-900 shadow';
    navAdminBtn.className = 'px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 text-blue-100 hover:text-white';
    loadTenantRoom(currentTenantRoomNumber);
  } else {
    tenantView.classList.add('hidden');
    adminView.classList.remove('hidden');
    navAdminBtn.className = 'px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 bg-white text-blue-900 shadow';
    navTenantBtn.className = 'px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 text-blue-100 hover:text-white';

    if (isAdminUnlocked) {
      document.getElementById('adminPinGate').classList.add('hidden');
      document.getElementById('adminDashboard').classList.remove('hidden');
      renderAdminDashboard();
      fetchStats();
    } else {
      document.getElementById('adminPinGate').classList.remove('hidden');
      document.getElementById('adminDashboard').classList.add('hidden');
    }
  }
}

// Unlock Admin
async function unlockAdmin() {
  const pin = document.getElementById('adminPinInput').value.trim();
  if (!pin) {
    showToast('कृपया PIN टाका', true);
    return;
  }

  try {
    const res = await fetch('/api/admin/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    if (data.success) {
      isAdminUnlocked = true;
      sessionStorage.setItem('admin_unlocked', 'true');
      document.getElementById('adminPinGate').classList.add('hidden');
      document.getElementById('adminDashboard').classList.remove('hidden');
      renderAdminDashboard();
      fetchStats();
      showToast('Admin लॉगिन यशस्वी!');
    } else {
      showToast(data.message || 'चुकीचा PIN आहे!', true);
    }
  } catch (err) {
    console.error('Error verifying PIN:', err);
    showToast('पिन व्हेरिफाय करताना त्रुटी आली', true);
  }
}

// Populate Tenant Room Selector Dropdown
function populateTenantRoomSelector() {
  const select = document.getElementById('tenantRoomSelect');
  select.innerHTML = '';
  appData.rooms.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.roomNumber;
    const typeLabel = r.type === 'Double' ? 'डबल रूम' : 'सिंगल रूम';
    const tenantName = r.tenant ? ` (${r.tenant.name.split(' ')[0]})` : ' (रिकामी)';
    opt.textContent = `रूम नं. ${r.roomNumber} - ${typeLabel}${tenantName}`;
    if (r.roomNumber === currentTenantRoomNumber) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

// Load Selected Room for Tenant Portal
function loadTenantRoom(roomNo) {
  roomNo = parseInt(roomNo);
  currentTenantRoomNumber = roomNo;
  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;

  // Header badges
  document.getElementById('tenantRoomBadge').textContent = `रूम नं. ${room.roomNumber}`;
  const isDouble = room.type === 'Double';
  document.getElementById('tenantRoomTypeBadge').textContent = isDouble ? 'डबल रूम (४ पैकी १)' : 'सिंगल रूम';
  document.getElementById('tenantRoomTypeBadge').className = isDouble 
    ? 'bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-md' 
    : 'bg-blue-800/80 text-blue-100 text-xs px-2.5 py-1 rounded-md font-medium';

  // Tenant Details
  if (room.tenant) {
    document.getElementById('tenantNameDisplay').textContent = `भाडेकरू: ${room.tenant.name}`;
    document.getElementById('tenantPhoneDisplay').innerHTML = `<i class="fa-solid fa-phone"></i> ${room.tenant.phone}`;
  } else {
    document.getElementById('tenantNameDisplay').textContent = 'ही रूम सध्या रिकामी आहे';
    document.getElementById('tenantPhoneDisplay').innerHTML = '<i class="fa-solid fa-info-circle"></i> नवीन भाडेकरू नोंदणीसाठी मालकांशी संपर्क साधा';
  }

  document.getElementById('tenantMonthDisplay').textContent = room.billing?.month || 'चालू महिना';
  document.getElementById('tenantRentAmount').textContent = `₹${(room.rentAmount || 0).toLocaleString('en-IN')}`;
  document.getElementById('tenantPastReading').textContent = room.meter?.pastReading ?? 0;
  document.getElementById('tenantCurrentReading').textContent = room.meter?.currentReading ?? 0;
  
  const units = room.billing?.unitsConsumed || 0;
  document.getElementById('tenantUnitsConsumed').textContent = `${units} Units`;
  document.getElementById('tenantLightBillAmount').textContent = `₹${(room.billing?.lightBillAmount || 0).toLocaleString('en-IN')}`;
  
  const prevDues = room.billing?.previousDues || 0;
  document.getElementById('tenantPreviousDues').textContent = `₹${prevDues.toLocaleString('en-IN')}`;
  
  const total = room.billing?.totalPayable || 0;
  document.getElementById('tenantTotalPayable').textContent = `₹${total.toLocaleString('en-IN')}`;
  document.getElementById('tenantSubmitAmount').value = total;

  // Render Status Banner & Action Boxes
  const statusBanner = document.getElementById('tenantStatusBanner');
  const formBox = document.getElementById('tenantPaymentFormContainer');
  const receiptBtnBox = document.getElementById('tenantReceiptBtnBox');
  const status = room.payment?.status || 'pending';

  if (status === 'verified') {
    statusBanner.className = 'p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 space-y-1';
    statusBanner.innerHTML = `
      <div class="flex items-center gap-2 font-black text-sm text-emerald-700">
        <i class="fa-solid fa-circle-check text-base"></i> Payment Successful! (पेमेंट मंजूर झाले आहे)
      </div>
      <p class="text-xs text-emerald-800">
        तुमचे ₹${(room.payment.details?.amount || total).toLocaleString('en-IN')} चे पेमेंट मालकांनी व्हेरिफाय केले आहे. पावती खाली उपलब्ध आहे.
      </p>
      <div class="text-[11px] font-mono text-emerald-700 mt-1">
        पावती क्र.: <b>${room.payment.details?.receiptNumber || 'RCP-VERIFIED'}</b> • UTR: ${room.payment.details?.utrNumber || 'N/A'}
      </div>
    `;
    formBox.classList.add('hidden');
    receiptBtnBox.classList.remove('hidden');
  } else if (status === 'submitted') {
    statusBanner.className = 'p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-950 space-y-1';
    statusBanner.innerHTML = `
      <div class="flex items-center gap-2 font-black text-sm text-amber-800">
        <i class="fa-solid fa-clock-rotate-left text-base animate-spin"></i> व्हेरिफिकेशन चालू आहे (Verification in Progress)
      </div>
      <p class="text-xs text-amber-900">
        तुम्ही सबमिट केलेला UTR नंबर: <span class="font-mono font-bold">${room.payment.details?.utrNumber || '--'}</span>. मालक पडताळणी करून लवकरच 'Successful' मार्क करतील.
      </p>
    `;
    formBox.classList.remove('hidden');
    receiptBtnBox.classList.add('hidden');
  } else {
    // Pending
    statusBanner.className = 'p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-950 space-y-1';
    statusBanner.innerHTML = `
      <div class="flex items-center gap-2 font-black text-sm text-rose-700">
        <i class="fa-solid fa-triangle-exclamation text-base"></i> पेमेंट बाकी आहे (Pending Payment)
      </div>
      <p class="text-xs text-rose-800">
        कृपया उजवीकडील UPI QR कोड स्कॅन करून किंवा 'Pay Now' वर क्लिक करून एकूण ₹${total.toLocaleString('en-IN')} भरा आणि UTR नंबर टाका.
      </p>
    `;
    formBox.classList.remove('hidden');
    receiptBtnBox.classList.add('hidden');
  }

  // Generate Dynamic QR Code
  generateUpiQrCode(room, total);
}

// Generate Dynamic UPI QR Code
function generateUpiQrCode(room, amount) {
  const upiId = appData.settings.ownerUpi || '9876543210@ybl';
  document.getElementById('displayUpiId').textContent = upiId;

  // UPI String format standard:
  // upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
  const building = encodeURIComponent('Karegaon Rentals Pune');
  const note = encodeURIComponent(`Room ${room.roomNumber} Rent and Light Bill`);
  const upiUrl = `upi://pay?pa=${upiId}&pn=${building}&am=${amount}&cu=INR&tn=${note}`;

  // Set Direct Mobile Intent Link
  const intentBtn = document.getElementById('upiIntentBtn');
  intentBtn.href = upiUrl;

  // Render QR Code in Canvas
  const qrContainer = document.getElementById('qrcodeCanvas');
  qrContainer.innerHTML = '';

  if (window.QRCode) {
    try {
      new QRCode(qrContainer, {
        text: upiUrl,
        width: 180,
        height: 180,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      console.warn('QRCode JS error, using fallback image', e);
      renderQrFallback(qrContainer, upiUrl);
    }
  } else {
    renderQrFallback(qrContainer, upiUrl);
  }
}

function renderQrFallback(container, text) {
  const imgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}`;
  container.innerHTML = `<img src="${imgUrl}" alt="UPI QR Code" class="w-44 h-44 object-contain rounded-lg">`;
}

// Tenant Submits Payment UTR
async function submitTenantPayment() {
  const roomNo = currentTenantRoomNumber;
  const amount = document.getElementById('tenantSubmitAmount').value.trim();
  const utrNumber = document.getElementById('tenantSubmitUtr').value.trim();
  const notes = document.getElementById('tenantSubmitNotes').value.trim();

  if (!utrNumber) {
    showToast('कृपया UTR किंवा ट्रान्झॅक्शन नंबर टाका', true);
    return;
  }

  try {
    const res = await fetch(`/api/rooms/${roomNo}/payment/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, utrNumber, notes })
    });
    const data = await res.json();
    if (data.success) {
      showToast('पेमेंट व्हेरिफिकेशनसाठी पाठवले आहे! धन्यवाद.');
      document.getElementById('tenantSubmitUtr').value = '';
      fetchData();
    } else {
      showToast(data.message || 'पेमेंट सबमिट करताना त्रुटी आली', true);
    }
  } catch (err) {
    console.error('Error submitting payment:', err);
    showToast('सर्व्हरशी संपर्क होऊ शकला नाही', true);
  }
}

// Render Admin Dashboard 17 Rooms Grid
function renderAdminDashboard() {
  const grid = document.getElementById('roomsGrid');
  grid.innerHTML = '';

  let filteredRooms = appData.rooms;
  if (currentActiveFilter === 'double') {
    filteredRooms = appData.rooms.filter(r => r.type === 'Double');
  } else if (currentActiveFilter === 'single') {
    filteredRooms = appData.rooms.filter(r => r.type === 'Single');
  } else if (currentActiveFilter === 'verification') {
    filteredRooms = appData.rooms.filter(r => r.payment?.status === 'submitted');
  }

  if (filteredRooms.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
        <i class="fa-solid fa-filter text-3xl mb-2 text-slate-300"></i>
        <p class="font-bold">या फिल्टरमध्ये कोणतीही रूम आढळली नाही</p>
      </div>
    `;
    return;
  }

  filteredRooms.forEach(room => {
    const isDouble = room.type === 'Double';
    const isOccupied = room.status === 'occupied';
    const status = room.payment?.status || 'pending';
    const totalAmount = room.billing?.totalPayable || 0;
    const units = room.billing?.unitsConsumed || 0;
    const lightBill = room.billing?.lightBillAmount || 0;

    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between';

    // Header styling
    let statusHeaderBadge = '';
    if (status === 'verified') {
      statusHeaderBadge = `<span class="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Paid</span>`;
    } else if (status === 'submitted') {
      statusHeaderBadge = `<span class="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse"><i class="fa-solid fa-clock"></i> Verify करा</span>`;
    } else {
      statusHeaderBadge = `<span class="bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><i class="fa-solid fa-circle-xmark"></i> बाकी</span>`;
    }

    card.innerHTML = `
      <div>
        <!-- Room Card Top -->
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div class="flex items-center gap-2">
            <span class="w-9 h-9 rounded-xl ${isDouble ? 'bg-amber-400 text-slate-950 font-black' : 'bg-blue-600 text-white font-bold'} flex items-center justify-center text-base shadow-sm">
              ${room.roomNumber}
            </span>
            <div>
              <span class="text-xs font-bold text-slate-800 block">रूम नं. ${room.roomNumber}</span>
              <span class="text-[10px] font-bold ${isDouble ? 'text-amber-700' : 'text-blue-600'}">
                ${isDouble ? '⭐ डबल रूम (₹5000)' : 'सिंगल रूम (₹3000)'}
              </span>
            </div>
          </div>
          <div>${statusHeaderBadge}</div>
        </div>

        <!-- Room Body Details -->
        <div class="p-4 space-y-3">
          <!-- Tenant Info -->
          <div class="flex items-center justify-between text-xs">
            <div>
              <span class="text-slate-400 text-[10px] block">भाडेकरू:</span>
              <span class="font-bold text-slate-900">${isOccupied ? room.tenant.name : '<span class="text-slate-400 italic">रिकामी रूम</span>'}</span>
            </div>
            <div class="text-right">
              <span class="text-slate-400 text-[10px] block">मोबाईल:</span>
              <span class="font-mono text-slate-700">${isOccupied ? room.tenant.phone : '--'}</span>
            </div>
          </div>

          <!-- Meter Readings Grid -->
          <div class="bg-slate-50 rounded-xl p-2.5 border border-slate-200 grid grid-cols-3 gap-1 text-center text-xs">
            <div>
              <span class="text-[10px] text-slate-400 block">मागील</span>
              <span class="font-mono font-bold text-slate-700">${room.meter?.pastReading ?? 0}</span>
            </div>
            <div class="border-x border-slate-200">
              <span class="text-[10px] text-slate-400 block">चालू</span>
              <span class="font-mono font-bold text-blue-700">${room.meter?.currentReading ?? 0}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">लाईट बिल</span>
              <span class="font-mono font-bold text-amber-700">₹${lightBill} (${units}u)</span>
            </div>
          </div>

          <!-- Financial Breakdown -->
          <div class="text-xs space-y-1 pt-1">
            <div class="flex justify-between text-slate-600">
              <span>मासिक भाडे:</span>
              <span class="font-semibold text-slate-800">₹${(room.rentAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>मागील बाकी (Pahili Baki):</span>
              <span class="font-semibold text-rose-600">₹${(room.billing?.previousDues || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-between text-sm font-black text-blue-900 border-t pt-1.5">
              <span>एकूण येणे रक्कम:</span>
              <span class="font-mono">₹${totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <!-- Pending Verification Box if Tenant submitted -->
          ${status === 'submitted' ? `
            <div class="bg-amber-50 p-2.5 rounded-xl border border-amber-300 text-xs space-y-2 mt-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-amber-900">UTR: <span class="font-mono">${room.payment.details?.utrNumber || '--'}</span></span>
                <span class="text-[10px] font-bold text-amber-700">₹${room.payment.details?.amount || totalAmount}</span>
              </div>
              <div class="flex gap-1.5">
                <button onclick="verifyPayment(${room.roomNumber}, 'approve')" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-xs shadow flex items-center justify-center gap-1">
                  <i class="fa-solid fa-check"></i> Approve (मंजूर)
                </button>
                <button onclick="verifyPayment(${room.roomNumber}, 'reject')" class="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-2 rounded-lg text-xs shadow flex items-center justify-center gap-1">
                  <i class="fa-solid fa-xmark"></i> Reject
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Action Buttons Footer -->
      <div class="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-4 gap-1.5 text-center">
        <button onclick="openMeterModal(${room.roomNumber})" title="मीटर रिडिंग बदला" class="py-1.5 px-2 bg-white hover:bg-amber-50 hover:text-amber-800 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition">
          <i class="fa-solid fa-bolt text-amber-500"></i> मीटर
        </button>
        <button onclick="openTenantEditModal(${room.roomNumber})" title="भाडेकरू माहिती बदला" class="py-1.5 px-2 bg-white hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition">
          <i class="fa-solid fa-user text-blue-600"></i> भाडेकरू
        </button>
        <button onclick="shareWhatsAppBill(${room.roomNumber})" title="व्हॉट्सॲपवर बिल पाठवा" class="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition">
          <i class="fa-brands fa-whatsapp text-emerald-600"></i> बिल
        </button>
        <button onclick="openReceiptModal(${room.roomNumber})" title="पावती बघा" class="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition">
          <i class="fa-solid fa-receipt text-indigo-600"></i> पावती
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Filter Rooms Handler
function filterRooms(filter) {
  currentActiveFilter = filter;
  document.querySelectorAll('.roomFilterBtn').forEach(btn => {
    if (btn.dataset.filter === filter) {
      btn.className = 'roomFilterBtn active px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-700 text-white';
    } else {
      btn.className = 'roomFilterBtn px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200';
    }
  });
  renderAdminDashboard();
}

// Open Meter Modal
function openMeterModal(roomNo) {
  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;
  currentEditingRoomNumber = roomNo;

  document.getElementById('meterModalRoomNo').textContent = room.roomNumber;
  document.getElementById('modalPastReading').value = room.meter?.pastReading ?? 0;
  document.getElementById('modalCurrentReading').value = room.meter?.currentReading ?? room.meter?.pastReading ?? 0;
  document.getElementById('modalReadingDate').value = room.meter?.lastReadingDate || new Date().toISOString().split('T')[0];

  calculateModalLightBill();
  document.getElementById('meterModal').classList.remove('hidden');
}

// Live Calculate Light Bill inside Modal
function calculateModalLightBill() {
  const past = parseFloat(document.getElementById('modalPastReading').value) || 0;
  const current = parseFloat(document.getElementById('modalCurrentReading').value) || 0;
  const rate = appData.settings.rate || 10;

  const units = Math.max(0, current - past);
  const bill = units * rate;

  document.getElementById('modalCalcUnits').textContent = `${units} Units`;
  document.getElementById('modalCalcBill').textContent = `₹${bill.toLocaleString('en-IN')}`;
}

// Save Meter Reading
async function saveRoomMeter() {
  const roomNo = currentEditingRoomNumber;
  const currentReading = document.getElementById('modalCurrentReading').value;
  const readingDate = document.getElementById('modalReadingDate').value;

  if (currentReading === '') {
    showToast('कृपया चालू रिडिंग टाका', true);
    return;
  }

  try {
    const res = await fetch(`/api/rooms/${roomNo}/meter`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentReading, readingDate })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message);
      closeModal('meterModal');
      fetchData();
    } else {
      showToast(data.message, true);
    }
  } catch (err) {
    console.error('Error saving meter reading:', err);
    showToast('सर्व्हर एरर', true);
  }
}

// Open Tenant Edit Modal
function openTenantEditModal(roomNo) {
  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;
  currentEditingRoomNumber = roomNo;

  document.getElementById('tenantEditRoomNo').textContent = room.roomNumber;
  document.getElementById('editTenantName').value = room.tenant?.name || '';
  document.getElementById('editTenantPhone').value = room.tenant?.phone || '';
  document.getElementById('editTenantRent').value = room.rentAmount || (room.type === 'Double' ? 5000 : 3000);
  document.getElementById('editTenantDeposit').value = room.tenant?.deposit || '';
  document.getElementById('editTenantJoinDate').value = room.tenant?.joinDate || new Date().toISOString().split('T')[0];
  document.getElementById('editTenantAadhaar').value = room.tenant?.aadhaar || '';

  document.getElementById('tenantEditModal').classList.remove('hidden');
}

// Save Tenant Details
async function saveTenantDetails() {
  const roomNo = currentEditingRoomNumber;
  const name = document.getElementById('editTenantName').value.trim();
  const phone = document.getElementById('editTenantPhone').value.trim();
  const rentAmount = document.getElementById('editTenantRent').value;
  const deposit = document.getElementById('editTenantDeposit').value;
  const joinDate = document.getElementById('editTenantJoinDate').value;
  const aadhaar = document.getElementById('editTenantAadhaar').value;

  if (!name) {
    showToast('कृपया भाडेकरूचे नाव टाका', true);
    return;
  }

  try {
    const res = await fetch(`/api/rooms/${roomNo}/tenant`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, rentAmount, deposit, joinDate, aadhaar })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message);
      closeModal('tenantEditModal');
      fetchData();
    } else {
      showToast(data.message, true);
    }
  } catch (err) {
    console.error('Error saving tenant details:', err);
    showToast('सर्व्हर एरर', true);
  }
}

// Vacate Room
async function vacateRoom() {
  if (!confirm(`तुम्हाला खात्री आहे का की रूम नं. ${currentEditingRoomNumber} रिकामी करायची आहे?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/rooms/${currentEditingRoomNumber}/tenant`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'vacate' })
    });
    const data = await res.json();
    if (data.success) {
      showToast('रूम रिकामी करण्यात आली!');
      closeModal('tenantEditModal');
      fetchData();
    }
  } catch (err) {
    console.error('Error vacating room:', err);
  }
}

// Admin Verifies Payment (Approve / Reject)
async function verifyPayment(roomNo, action) {
  const confirmMsg = action === 'approve' 
    ? `रूम नं. ${roomNo} चे पेमेंट मंजूर (Approve) करायचे का? स्टेटस Success होईल आणि पावती तयार होईल.` 
    : `रूम नं. ${roomNo} चे पेमेंट नाकारायचे (Reject) का?`;

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`/api/rooms/${roomNo}/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message);
      fetchData();
    } else {
      showToast(data.message, true);
    }
  } catch (err) {
    console.error('Error verifying payment:', err);
    showToast('सर्व्हर एरर', true);
  }
}

// Open Batch Meter Modal
function openBatchMeterModal() {
  const tbody = document.getElementById('batchMeterTableBody');
  tbody.innerHTML = '';

  appData.rooms.forEach(room => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b';
    const isDouble = room.type === 'Double';
    const tenantName = room.tenant ? room.tenant.name.split(' ')[0] : '<span class="text-slate-400 italic">रिकामी</span>';

    tr.innerHTML = `
      <td class="p-2.5 font-bold font-mono">रूम ${room.roomNumber}</td>
      <td class="p-2.5 text-[11px] font-semibold ${isDouble ? 'text-amber-700' : 'text-blue-700'}">${isDouble ? 'डबल' : 'सिंगल'}</td>
      <td class="p-2.5">${tenantName}</td>
      <td class="p-2.5 font-mono text-slate-500">${room.meter?.pastReading ?? 0}</td>
      <td class="p-2.5">
        <input type="number" data-room="${room.roomNumber}" data-past="${room.meter?.pastReading ?? 0}" value="${room.meter?.currentReading ?? ''}" oninput="updateBatchRow(this)" class="batchMeterInput w-24 bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-xs focus:ring-1 focus:ring-blue-500">
      </td>
      <td class="p-2.5 font-mono font-bold text-amber-700" id="batchBill-${room.roomNumber}">
        ₹${room.billing?.lightBillAmount || 0}
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('batchMeterModal').classList.remove('hidden');
}

function updateBatchRow(input) {
  const roomNo = input.dataset.room;
  const past = parseFloat(input.dataset.past) || 0;
  const current = parseFloat(input.value) || past;
  const rate = appData.settings.rate || 10;
  const units = Math.max(0, current - past);
  const bill = units * rate;
  document.getElementById(`batchBill-${roomNo}`).textContent = `₹${bill}`;
}

// Save Batch Meter Readings
async function saveBatchMeterReadings() {
  const inputs = document.querySelectorAll('.batchMeterInput');
  const readings = [];

  inputs.forEach(inp => {
    readings.push({
      roomNumber: parseInt(inp.dataset.room),
      currentReading: inp.value
    });
  });

  try {
    const res = await fetch('/api/rooms-batch-meter', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readings })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message);
      closeModal('batchMeterModal');
      fetchData();
    }
  } catch (err) {
    console.error('Error saving batch meter readings:', err);
    showToast('सर्व्हर एरर', true);
  }
}

// Open Receipt Modal
function openReceiptModal(roomNo) {
  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;
  currentReceiptRoom = room;

  const total = room.payment?.status === 'verified' && room.payment.details?.amount
    ? room.payment.details.amount
    : (room.billing?.totalPayable || 0);

  document.getElementById('rcptBuildingName').textContent = appData.settings.buildingName || 'कारेगाव रेंटल, पुणे';
  document.getElementById('rcptNumber').textContent = room.payment?.details?.receiptNumber || `RCP-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(room.roomNumber).padStart(3,'0')}`;
  document.getElementById('rcptDate').textContent = new Date().toLocaleDateString('mr-IN');
  document.getElementById('rcptTenantName').textContent = room.tenant?.name || 'भाडेकरू';
  document.getElementById('rcptRoomNo').textContent = `रूम नं. ${room.roomNumber} (${room.type === 'Double' ? 'डबल रूम' : 'सिंगल रूम'})`;
  document.getElementById('rcptRent').textContent = `₹${(room.rentAmount || 0).toLocaleString('en-IN')}`;
  document.getElementById('rcptUnits').textContent = room.billing?.unitsConsumed || 0;
  document.getElementById('rcptLightBill').textContent = `₹${(room.billing?.lightBillAmount || 0).toLocaleString('en-IN')}`;
  document.getElementById('rcptPastReading').textContent = room.meter?.pastReading ?? 0;
  document.getElementById('rcptCurrReading').textContent = room.meter?.currentReading ?? 0;
  document.getElementById('rcptPrevDues').textContent = `₹${(room.billing?.previousDues || 0).toLocaleString('en-IN')}`;
  document.getElementById('rcptTotalPaid').textContent = `₹${total.toLocaleString('en-IN')}`;
  document.getElementById('rcptUtr').textContent = room.payment?.details?.utrNumber || 'N/A';

  document.getElementById('receiptModal').classList.remove('hidden');
}

// Share Receipt on WhatsApp
function shareReceiptWhatsApp() {
  if (!currentReceiptRoom) return;
  const room = currentReceiptRoom;
  const tenantPhone = room.tenant?.phone ? room.tenant.phone.replace(/[^0-9]/g, '') : '';
  const total = room.payment?.status === 'verified' && room.payment.details?.amount
    ? room.payment.details.amount
    : (room.billing?.totalPayable || 0);

  const message = `*${appData.settings.buildingName || 'कारेगाव रेंटल, पुणे'} - अधिकृत भरणा पावती*\n\n` +
    `पावती क्र: ${room.payment?.details?.receiptNumber || 'RCP'}\n` +
    `भाडेकरू: ${room.tenant?.name || ''}\n` +
    `रूम: नं. ${room.roomNumber} (${room.type === 'Double' ? 'डबल' : 'सिंगल'})\n` +
    `तारीख: ${new Date().toLocaleDateString('mr-IN')}\n\n` +
    `*तपशील:*\n` +
    `• खोली भाडे: ₹${room.rentAmount}\n` +
    `• लाईट बिल: ₹${room.billing?.lightBillAmount} (${room.billing?.unitsConsumed} units @ ₹${appData.settings.rate || 10}/u)\n` +
    `  (मागील रिडिंग: ${room.meter?.pastReading} | चालू रिडिंग: ${room.meter?.currentReading})\n` +
    `• मागील बाकी: ₹${room.billing?.previousDues}\n` +
    `---------------------------\n` +
    `*एकूण जमा रक्कम: ₹${total}*\n` +
    `UTR: ${room.payment?.details?.utrNumber || 'N/A'}\n` +
    `स्टेटस: *Payment Verified & Approved ✅*\n\n` +
    `धन्यवाद! 🙏`;

  const waUrl = tenantPhone 
    ? `https://wa.me/91${tenantPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(waUrl, '_blank');
}

// Share Monthly Bill on WhatsApp to Tenant
function shareWhatsAppBill(roomNo) {
  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room || !room.tenant) {
    showToast('या रूममध्ये भाडेकरू नोंदवलेला नाही', true);
    return;
  }

  const tenantPhone = room.tenant.phone ? room.tenant.phone.replace(/[^0-9]/g, '') : '';
  const total = room.billing?.totalPayable || 0;

  const message = `*${appData.settings.buildingName || 'कारेगाव रेंटल, पुणे'} - मासिक बिल*\n\n` +
    `नमस्कार ${room.tenant.name},\n` +
    `तुमचे चालू महिन्याचे भाडे व लाईट बिलाचा तपशील खालीलप्रमाणे:\n\n` +
    `🏠 *रूम नं: ${room.roomNumber}* (${room.type === 'Double' ? 'डबल रूम' : 'सिंगल रूम'})\n` +
    `💵 *१. खोली भाडे:* ₹${room.rentAmount}\n` +
    `⚡ *२. लाईट बिल:* ₹${room.billing?.lightBillAmount}\n` +
    `   • मागील रिडिंग: ${room.meter?.pastReading}\n` +
    `   • चालू रिडिंग: ${room.meter?.currentReading}\n` +
    `   • वापरलेले युनिट्स: ${room.billing?.unitsConsumed} units (@ ₹${appData.settings.rate || 10}/unit)\n` +
    `⏳ *३. पहिली बाकी (थकबाकी):* ₹${room.billing?.previousDues}\n` +
    `----------------------------------\n` +
    `💰 *एकूण भरायची रक्कम: ₹${total}*\n\n` +
    `📲 *UPI ID:* ${appData.settings.ownerUpi || '9876543210@ybl'}\n` +
    `पेमेंट केल्यानंतर कृपया UTR नंबर ॲपमध्ये नोंदवा किंवा येथे मेसेज करा.\n\n` +
    `धन्यवाद! 🙏`;

  const waUrl = tenantPhone 
    ? `https://wa.me/91${tenantPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(waUrl, '_blank');
}

// Settings Modal
async function openSettingsModal() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      document.getElementById('settingBuildingName').value = data.settings.buildingName || '';
      document.getElementById('settingOwnerUpi').value = data.settings.ownerUpi || '';
      document.getElementById('settingSingleRent').value = data.settings.singleRoomRent || 3000;
      document.getElementById('settingDoubleRent').value = data.settings.doubleRoomRent || 5000;
      document.getElementById('settingRatePerUnit').value = data.settings.electricityRatePerUnit || 10;
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
  }
  document.getElementById('settingsModal').classList.remove('hidden');
}

// Save Settings
async function saveSettings() {
  const pin = prompt('बदल सेव्ह करण्यासाठी तुमचा चालू Admin PIN टाका:');
  if (!pin) return;

  const buildingName = document.getElementById('settingBuildingName').value.trim();
  const ownerUpi = document.getElementById('settingOwnerUpi').value.trim();
  const singleRoomRent = document.getElementById('settingSingleRent').value;
  const doubleRoomRent = document.getElementById('settingDoubleRent').value;
  const electricityRatePerUnit = document.getElementById('settingRatePerUnit').value;
  const newPin = document.getElementById('settingNewPin').value.trim();

  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin,
        newPin,
        buildingName,
        ownerUpi,
        singleRoomRent,
        doubleRoomRent,
        electricityRatePerUnit
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message);
      closeModal('settingsModal');
      fetchData();
    } else {
      showToast(data.message, true);
    }
  } catch (err) {
    console.error('Error saving settings:', err);
    showToast('सर्व्हर एरर', true);
  }
}

// History Modal
async function openHistoryModal() {
  try {
    const res = await fetch('/api/history');
    const data = await res.json();
    const container = document.getElementById('historyListContainer');
    container.innerHTML = '';

    if (data.success && data.history && data.history.length > 0) {
      data.history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1';
        div.innerHTML = `
          <div class="flex items-center justify-between font-bold text-slate-800">
            <span>रूम नं. ${item.roomNumber} - ${item.tenantName}</span>
            <span class="text-emerald-700 font-mono text-sm">₹${(item.amount || 0).toLocaleString('en-IN')}</span>
          </div>
          <div class="flex justify-between text-slate-500 text-[11px]">
            <span>पावती क्र.: <span class="font-mono font-semibold">${item.receiptNumber || 'N/A'}</span></span>
            <span>तारीख: ${new Date(item.verifiedAt).toLocaleDateString('mr-IN')}</span>
          </div>
          <div class="text-[11px] text-slate-600">
            भाडे: ₹${item.rentAmount} | लाईट बिल: ₹${item.lightBillAmount} | UTR: <span class="font-mono">${item.utrNumber}</span>
          </div>
        `;
        container.appendChild(div);
      });
    } else {
      container.innerHTML = '<p class="text-center text-slate-400 py-6">कोणताही इतिहास सापडला नाही.</p>';
    }
    document.getElementById('historyModal').classList.remove('hidden');
  } catch (err) {
    console.error('Error fetching history:', err);
  }
}

// Close Modal Helper
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

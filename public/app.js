// Constants & Default Setup
const STORAGE_KEY = 'karegaon_rental_store_v2';
const DOUBLE_ROOMS = [1, 6, 11, 15];

// Default Data Initializer
function generateDefaultData() {
  const rooms = [];
  for (let i = 1; i <= 17; i++) {
    const isDouble = DOUBLE_ROOMS.includes(i);
    const rentAmount = isDouble ? 5000 : 3000;
    
    let tenant = null;
    let pastReading = 100;
    let currentReading = 100;
    let previousDues = 0;
    let paymentStatus = 'pending';
    let paymentDetails = null;

    if (i === 1) {
      tenant = {
        name: 'सचिन जाधव (Sachin Jadhav)',
        phone: '9822012345',
        aadhaar: '1234-5678-9012',
        deposit: 10000,
        joinDate: '2026-08-01'
      };
      pastReading = 420;
      currentReading = 475;
      previousDues = 500;
      paymentStatus = 'submitted';
      paymentDetails = {
        amount: 6050,
        utrNumber: 'UPI432198765432',
        submittedAt: '2026-11-15T18:30:00.000Z',
        notes: 'GPay ने भरले'
      };
    } else if (i === 2) {
      tenant = {
        name: 'अमित पाटील (Amit Patil)',
        phone: '9890112233',
        aadhaar: '2345-6789-0123',
        deposit: 6000,
        joinDate: '2026-09-10'
      };
      pastReading = 210;
      currentReading = 245;
      previousDues = 0;
      paymentStatus = 'verified';
      paymentDetails = {
        amount: 3350,
        utrNumber: 'PHONEPE987654321',
        submittedAt: '2026-11-14T11:00:00.000Z',
        verifiedAt: '2026-11-14T12:00:00.000Z',
        receiptNumber: 'RCP-202611-002',
        notes: 'Verified via PhonePe'
      };
    } else if (i === 6) {
      tenant = {
        name: 'राहुल शिंदे (Rahul Shinde)',
        phone: '9765432109',
        aadhaar: '3456-7890-1234',
        deposit: 10000,
        joinDate: '2026-07-15'
      };
      pastReading = 580;
      currentReading = 625;
      previousDues = 0;
      paymentStatus = 'verified';
      paymentDetails = {
        amount: 5450,
        utrNumber: 'GPAY9988776655',
        submittedAt: '2026-11-16T09:39:23.662Z',
        verifiedAt: '2026-11-16T09:39:32.232Z',
        receiptNumber: 'RCP-202611-006',
        notes: 'Google Pay'
      };
    }

    const units = Math.max(0, currentReading - pastReading);
    const lightBill = units * 10;
    const totalPayable = paymentStatus === 'verified' ? 0 : (rentAmount + lightBill + previousDues);

    rooms.push({
      roomNumber: i,
      type: isDouble ? 'Double' : 'Single',
      typeMarathi: isDouble ? 'डबल रूम' : 'सिंगल रूम',
      rentAmount: rentAmount,
      status: tenant ? 'occupied' : 'vacant',
      tenant: tenant,
      meter: {
        pastReading: pastReading,
        currentReading: currentReading,
        lastReadingDate: '2026-11-10'
      },
      billing: {
        unitsConsumed: units,
        lightBillAmount: lightBill,
        previousDues: previousDues,
        currentRent: rentAmount,
        totalPayable: totalPayable,
        month: 'नोव्हेंबर २०२६ (November 2026)'
      },
      payment: {
        status: paymentStatus,
        details: paymentDetails
      }
    });
  }

  return {
    settings: {
      buildingName: 'कारेगाव रेंटल, पुणे (Karegaon Rental, Pune)',
      address: 'कारेगाव, रांजणगाव एमआयडीसी रोड, शिरूर, पुणे - ४१२२०९',
      ownerName: 'मालक (Owner)',
      ownerPhone: '9876543210',
      ownerUpi: '9876543210@ybl',
      singleRoomRent: 3000,
      doubleRoomRent: 5000,
      electricityRatePerUnit: 10,
      adminPin: '1234'
    },
    rooms: rooms,
    paymentHistory: [
      {
        id: 'hist-1',
        roomNumber: 2,
        tenantName: 'अमित पाटील',
        month: 'नोव्हेंबर २०२६',
        amount: 3350,
        rentAmount: 3000,
        lightBillAmount: 350,
        previousDues: 0,
        utrNumber: 'PHONEPE987654321',
        receiptNumber: 'RCP-202611-002',
        verifiedAt: '2026-11-14T12:00:00.000Z'
      },
      {
        id: 'hist-2',
        roomNumber: 6,
        tenantName: 'राहुल शिंदे',
        month: 'नोव्हेंबर २०२६',
        amount: 5450,
        rentAmount: 5000,
        lightBillAmount: 450,
        previousDues: 0,
        utrNumber: 'GPAY9988776655',
        receiptNumber: 'RCP-202611-006',
        verifiedAt: '2026-11-16T09:39:32.232Z'
      }
    ]
  };
}

// Load and Save Local Storage Data
function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading localStorage:', e);
  }
  const defaultData = generateDefaultData();
  saveStore(defaultData);
  return defaultData;
}

function saveStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving localStorage:', e);
  }
}

// State
let appData = getStore();
let currentTenantRoomNumber = 1;
let currentActiveFilter = 'all';
let isAdminUnlocked = sessionStorage.getItem('admin_unlocked') === 'true';
let currentEditingRoomNumber = 1;
let currentReceiptRoom = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = parseInt(urlParams.get('room'));
  if (roomParam && roomParam >= 1 && roomParam <= 17) {
    currentTenantRoomNumber = roomParam;
  }

  const viewParam = urlParams.get('view');
  if (viewParam === 'admin') {
    switchView('admin');
  }

  refreshUI();
});

// Refresh Full UI
function refreshUI() {
  appData = getStore();
  document.getElementById('headerBuildingTitle').textContent = appData.settings.buildingName || 'कारेगाव रेंटल रूम्स, पुणे';
  document.getElementById('ratePerUnitLabel').textContent = `मीटर रिडिंगनुसार (दर ₹${appData.settings.electricityRatePerUnit || 10} / युनिट)`;

  populateTenantRoomSelector();
  loadTenantRoom(currentTenantRoomNumber);

  if (isAdminUnlocked) {
    renderAdminDashboard();
    updateAdminStats();
  }
}

// Show Toast
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  toastMsg.textContent = message;
  toastIcon.className = isError 
    ? 'fa-solid fa-circle-exclamation text-rose-400 text-lg' 
    : 'fa-solid fa-circle-check text-emerald-400 text-lg';

  toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
  }, 3500);
}

// Switch View
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
      updateAdminStats();
    } else {
      document.getElementById('adminPinGate').classList.remove('hidden');
      document.getElementById('adminDashboard').classList.add('hidden');
    }
  }
}

// Unlock Admin
function unlockAdmin() {
  const pin = document.getElementById('adminPinInput').value.trim();
  const correctPin = appData.settings.adminPin || '1234';

  if (pin === correctPin) {
    isAdminUnlocked = true;
    sessionStorage.setItem('admin_unlocked', 'true');
    document.getElementById('adminPinGate').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    renderAdminDashboard();
    updateAdminStats();
    showToast('Admin लॉगिन यशस्वी!');
  } else {
    showToast('चुकीचा PIN आहे! कृपया योग्य पासवर्ड टाका.', true);
  }
}

// Populate Tenant Room Selector
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

  document.getElementById('tenantRoomBadge').textContent = `रूम नं. ${room.roomNumber}`;
  const isDouble = room.type === 'Double';
  document.getElementById('tenantRoomTypeBadge').textContent = isDouble ? 'डबल रूम (४ पैकी १)' : 'सिंगल रूम';
  document.getElementById('tenantRoomTypeBadge').className = isDouble 
    ? 'bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-md' 
    : 'bg-blue-800/80 text-blue-100 text-xs px-2.5 py-1 rounded-md font-medium';

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
  document.getElementById('tenantSubmitAmount').value = total || (room.rentAmount + (room.billing?.lightBillAmount || 0));

  // Status Banner & Action Boxes
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

  generateUpiQrCode(room, total || (room.rentAmount + (room.billing?.lightBillAmount || 0)));
}

// Generate Dynamic UPI QR Code
function generateUpiQrCode(room, amount) {
  const upiId = appData.settings.ownerUpi || '9876543210@ybl';
  document.getElementById('displayUpiId').textContent = upiId;

  const building = encodeURIComponent('Karegaon Rentals Pune');
  const note = encodeURIComponent(`Room ${room.roomNumber} Rent and Light Bill`);
  const upiUrl = `upi://pay?pa=${upiId}&pn=${building}&am=${amount}&cu=INR&tn=${note}`;

  document.getElementById('upiIntentBtn').href = upiUrl;

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

// Tenant Submits Payment
function submitTenantPayment() {
  const roomNo = currentTenantRoomNumber;
  const amount = document.getElementById('tenantSubmitAmount').value.trim();
  const utrNumber = document.getElementById('tenantSubmitUtr').value.trim();
  const notes = document.getElementById('tenantSubmitNotes').value.trim();

  if (!utrNumber) {
    showToast('कृपया UTR किंवा ट्रान्झॅक्शन नंबर टाका', true);
    return;
  }

  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;

  room.payment.status = 'submitted';
  room.payment.details = {
    amount: Number(amount) || room.billing.totalPayable,
    utrNumber: utrNumber,
    submittedAt: new Date().toISOString(),
    notes: notes || 'भाडेकरूने सबमिट केले'
  };

  saveStore(appData);
  showToast('पेमेंट व्हेरिफिकेशनसाठी पाठवले आहे! धन्यवाद.');
  document.getElementById('tenantSubmitUtr').value = '';
  refreshUI();
}

// Update Admin Top Stats
function updateAdminStats() {
  const totalRooms = appData.rooms.length;
  const occupiedRooms = appData.rooms.filter(r => r.status === 'occupied').length;
  const vacantRooms = totalRooms - occupiedRooms;

  let totalRent = 0;
  let totalLightBill = 0;
  let totalDues = 0;
  let totalCollected = 0;
  let pendingVerificationCount = 0;

  appData.rooms.forEach(r => {
    if (r.status === 'occupied') {
      totalRent += (r.rentAmount || 0);
      totalLightBill += (r.billing?.lightBillAmount || 0);
      totalDues += (r.billing?.totalPayable || 0);
      if (r.payment?.status === 'verified') {
        totalCollected += (r.payment.details?.amount || r.billing?.totalPayable || 0);
      }
      if (r.payment?.status === 'submitted') {
        pendingVerificationCount++;
      }
    }
  });

  document.getElementById('statTotalRooms').textContent = totalRooms;
  document.getElementById('statOccupiedRooms').textContent = occupiedRooms;
  document.getElementById('statVacantRooms').textContent = `${vacantRooms} रिकाम्या`;
  document.getElementById('statTotalRent').textContent = `₹${totalRent.toLocaleString('en-IN')}`;
  document.getElementById('statTotalLightBill').textContent = `₹${totalLightBill.toLocaleString('en-IN')}`;
  document.getElementById('statTotalCollected').textContent = `₹${totalCollected.toLocaleString('en-IN')}`;
  document.getElementById('statTotalDues').textContent = `₹${totalDues.toLocaleString('en-IN')}`;
  document.getElementById('statPendingVerifPill').textContent = `${pendingVerificationCount} व्हेरिफिकेशन बाकी`;
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

        <div class="p-4 space-y-3">
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

function calculateModalLightBill() {
  const past = parseFloat(document.getElementById('modalPastReading').value) || 0;
  const current = parseFloat(document.getElementById('modalCurrentReading').value) || 0;
  const rate = appData.settings.electricityRatePerUnit || 10;

  const units = Math.max(0, current - past);
  const bill = units * rate;

  document.getElementById('modalCalcUnits').textContent = `${units} Units`;
  document.getElementById('modalCalcBill').textContent = `₹${bill.toLocaleString('en-IN')}`;
}

function saveRoomMeter() {
  const roomNo = currentEditingRoomNumber;
  const currentReading = parseFloat(document.getElementById('modalCurrentReading').value);
  const readingDate = document.getElementById('modalReadingDate').value;

  if (isNaN(currentReading)) {
    showToast('कृपया चालू रिडिंग टाका', true);
    return;
  }

  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;

  room.meter.currentReading = currentReading;
  room.meter.lastReadingDate = readingDate;

  const rate = appData.settings.electricityRatePerUnit || 10;
  const units = Math.max(0, currentReading - room.meter.pastReading);
  const lightBill = units * rate;

  room.billing.unitsConsumed = units;
  room.billing.lightBillAmount = lightBill;
  room.billing.totalPayable = room.rentAmount + lightBill + (room.billing.previousDues || 0);

  saveStore(appData);
  showToast(`रूम नं. ${roomNo} चे मीटर रिडिंग अपडेट झाले!`);
  closeModal('meterModal');
  refreshUI();
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

function saveTenantDetails() {
  const roomNo = currentEditingRoomNumber;
  const name = document.getElementById('editTenantName').value.trim();
  const phone = document.getElementById('editTenantPhone').value.trim();
  const rentAmount = parseFloat(document.getElementById('editTenantRent').value) || 0;
  const deposit = parseFloat(document.getElementById('editTenantDeposit').value) || 0;
  const joinDate = document.getElementById('editTenantJoinDate').value;
  const aadhaar = document.getElementById('editTenantAadhaar').value.trim();

  if (!name) {
    showToast('कृपया भाडेकरूचे नाव टाका', true);
    return;
  }

  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;

  room.tenant = { name, phone, deposit, joinDate, aadhaar };
  room.rentAmount = rentAmount;
  room.status = 'occupied';
  room.billing.currentRent = rentAmount;
  room.billing.totalPayable = rentAmount + (room.billing.lightBillAmount || 0) + (room.billing.previousDues || 0);

  saveStore(appData);
  showToast('भाडेकरू माहिती सेव्ह झाली!');
  closeModal('tenantEditModal');
  refreshUI();
}

function vacateRoom() {
  if (!confirm(`तुम्हाला खात्री आहे का की रूम नं. ${currentEditingRoomNumber} रिकामी करायची आहे?`)) {
    return;
  }

  const room = appData.rooms.find(r => r.roomNumber === currentEditingRoomNumber);
  if (!room) return;

  room.tenant = null;
  room.status = 'vacant';
  room.payment.status = 'pending';
  room.payment.details = null;

  saveStore(appData);
  showToast('रूम रिकामी करण्यात आली!');
  closeModal('tenantEditModal');
  refreshUI();
}

// Admin Verifies Payment (Approve / Reject)
function verifyPayment(roomNo, action) {
  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;

  if (action === 'approve') {
    const paidAmount = Number(room.payment?.details?.amount) || room.billing.totalPayable;
    const receiptNo = `RCP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(roomNo).padStart(3, '0')}`;

    room.payment.status = 'verified';
    room.payment.details = {
      ...(room.payment.details || {}),
      verifiedAt: new Date().toISOString(),
      receiptNumber: receiptNo
    };

    const diff = room.billing.totalPayable - paidAmount;
    room.billing.previousDues = Math.max(0, diff);
    room.billing.totalPayable = Math.max(0, diff);

    appData.paymentHistory.unshift({
      id: `hist-${Date.now()}`,
      roomNumber: roomNo,
      tenantName: room.tenant?.name || 'Unknown',
      month: room.billing.month || 'चालू महिना',
      amount: paidAmount,
      rentAmount: room.rentAmount,
      lightBillAmount: room.billing.lightBillAmount,
      pastReading: room.meter.pastReading,
      currentReading: room.meter.currentReading,
      utrNumber: room.payment.details.utrNumber,
      receiptNumber: receiptNo,
      verifiedAt: new Date().toISOString()
    });

    saveStore(appData);
    showToast(`रूम नं. ${roomNo} चे पेमेंट मंजूर झाले! 🎉`);
    refreshUI();
  } else if (action === 'reject') {
    room.payment.status = 'pending';
    room.payment.details = null;
    saveStore(appData);
    showToast(`रूम नं. ${roomNo} चे पेमेंट नाकारले.`);
    refreshUI();
  }
}

// Batch Meter Modal
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
  const rate = appData.settings.electricityRatePerUnit || 10;
  const units = Math.max(0, current - past);
  const bill = units * rate;
  document.getElementById(`batchBill-${roomNo}`).textContent = `₹${bill}`;
}

function saveBatchMeterReadings() {
  const inputs = document.querySelectorAll('.batchMeterInput');
  const rate = appData.settings.electricityRatePerUnit || 10;

  inputs.forEach(inp => {
    const roomNo = parseInt(inp.dataset.room);
    const room = appData.rooms.find(r => r.roomNumber === roomNo);
    if (room && inp.value !== '') {
      const currentReading = parseFloat(inp.value) || room.meter.pastReading;
      room.meter.currentReading = currentReading;
      const units = Math.max(0, currentReading - room.meter.pastReading);
      const lightBill = units * rate;
      room.billing.unitsConsumed = units;
      room.billing.lightBillAmount = lightBill;
      if (room.payment.status !== 'verified') {
        room.billing.totalPayable = room.rentAmount + lightBill + (room.billing.previousDues || 0);
      }
    }
  });

  saveStore(appData);
  showToast('सर्व १७ खोल्यांचे मीटर रिडिंग व बिले अपडेट झाली!');
  closeModal('batchMeterModal');
  refreshUI();
}

// Receipt Modal
function openReceiptModal(roomNo) {
  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;
  currentReceiptRoom = room;

  const total = room.payment?.status === 'verified' && room.payment.details?.amount
    ? room.payment.details.amount
    : (room.billing?.totalPayable || (room.rentAmount + (room.billing?.lightBillAmount || 0)));

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

function shareReceiptWhatsApp() {
  if (!currentReceiptRoom) return;
  const room = currentReceiptRoom;
  const tenantPhone = room.tenant?.phone ? room.tenant.phone.replace(/[^0-9]/g, '') : '';
  const total = room.payment?.status === 'verified' && room.payment.details?.amount
    ? room.payment.details.amount
    : (room.billing?.totalPayable || (room.rentAmount + (room.billing?.lightBillAmount || 0)));

  const message = `*${appData.settings.buildingName || 'कारेगाव रेंटल, पुणे'} - अधिकृत भरणा पावती*\n\n` +
    `पावती क्र: ${room.payment?.details?.receiptNumber || 'RCP'}\n` +
    `भाडेकरू: ${room.tenant?.name || ''}\n` +
    `रूम: नं. ${room.roomNumber} (${room.type === 'Double' ? 'डबल' : 'सिंगल'})\n` +
    `तारीख: ${new Date().toLocaleDateString('mr-IN')}\n\n` +
    `*तपशील:*\n` +
    `• खोली भाडे: ₹${room.rentAmount}\n` +
    `• लाईट बिल: ₹${room.billing?.lightBillAmount} (${room.billing?.unitsConsumed} units @ ₹${appData.settings.electricityRatePerUnit || 10}/u)\n` +
    `  (मागील रिडिंग: ${room.meter?.pastReading} | चालू रिडिंग: ${room.meter?.currentReading})\n` +
    `• मागील बाकी: ₹${room.billing?.previousDues}\n` +
    `---------------------------\n` +
    `*एकूण जमा रक्कम: ₹${total}*\n` +
    `UTR: ${room.payment?.details?.utrNumber || 'N/A'}\n` +
    `स्टेटस: *Payment Verified & Approved ✅*\n\n` +
    `पावती पाहण्यासाठी: ${window.location.origin}${window.location.pathname}?room=${room.roomNumber}\n` +
    `धन्यवाद! 🙏`;

  const waUrl = tenantPhone 
    ? `https://wa.me/91${tenantPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(waUrl, '_blank');
}

function shareWhatsAppBill(roomNo) {
  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room || !room.tenant) {
    showToast('या रूममध्ये भाडेकरू नोंदवलेला नाही', true);
    return;
  }

  const tenantPhone = room.tenant.phone ? room.tenant.phone.replace(/[^0-9]/g, '') : '';
  const total = room.billing?.totalPayable || (room.rentAmount + (room.billing?.lightBillAmount || 0));
  const appUrl = `${window.location.origin}${window.location.pathname}?room=${room.roomNumber}`;

  const message = `*${appData.settings.buildingName || 'कारेगाव रेंटल, पुणे'} - मासिक बिल*\n\n` +
    `नमस्कार ${room.tenant.name},\n` +
    `तुमचे चालू महिन्याचे भाडे व लाईट बिलाचा तपशील खालीलप्रमाणे:\n\n` +
    `🏠 *रूम नं: ${room.roomNumber}* (${room.type === 'Double' ? 'डबल रूम' : 'सिंगल रूम'})\n` +
    `💵 *१. खोली भाडे:* ₹${room.rentAmount}\n` +
    `⚡ *२. लाईट बिल:* ₹${room.billing?.lightBillAmount}\n` +
    `   • मागील रिडिंग: ${room.meter?.pastReading}\n` +
    `   • चालू रिडिंग: ${room.meter?.currentReading}\n` +
    `   • वापरलेले युनिट्स: ${room.billing?.unitsConsumed} units (@ ₹${appData.settings.electricityRatePerUnit || 10}/unit)\n` +
    `⏳ *३. पहिली बाकी (थकबाकी):* ₹${room.billing?.previousDues}\n` +
    `----------------------------------\n` +
    `💰 *एकूण भरायची रक्कम: ₹${total}*\n\n` +
    `📲 *ऑनलाइन बिल पाहण्यासाठी व UPI ने भरण्यासाठी लिंक:*\n` +
    `${appUrl}\n\n` +
    `पेमेंट केल्यानंतर UTR नंबर वरील लिंकवर सबमिट करा.\n` +
    `धन्यवाद! 🙏`;

  const waUrl = tenantPhone 
    ? `https://wa.me/91${tenantPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(waUrl, '_blank');
}

// Settings Modal
function openSettingsModal() {
  document.getElementById('settingBuildingName').value = appData.settings.buildingName || '';
  document.getElementById('settingOwnerUpi').value = appData.settings.ownerUpi || '';
  document.getElementById('settingSingleRent').value = appData.settings.singleRoomRent || 3000;
  document.getElementById('settingDoubleRent').value = appData.settings.doubleRoomRent || 5000;
  document.getElementById('settingRatePerUnit').value = appData.settings.electricityRatePerUnit || 10;
  document.getElementById('settingsModal').classList.remove('hidden');
}

function saveSettings() {
  const buildingName = document.getElementById('settingBuildingName').value.trim();
  const ownerUpi = document.getElementById('settingOwnerUpi').value.trim();
  const singleRoomRent = parseFloat(document.getElementById('settingSingleRent').value) || 3000;
  const doubleRoomRent = parseFloat(document.getElementById('settingDoubleRent').value) || 5000;
  const electricityRatePerUnit = parseFloat(document.getElementById('settingRatePerUnit').value) || 10;
  const newPin = document.getElementById('settingNewPin').value.trim();

  appData.settings.buildingName = buildingName;
  appData.settings.ownerUpi = ownerUpi;
  appData.settings.singleRoomRent = singleRoomRent;
  appData.settings.doubleRoomRent = doubleRoomRent;
  appData.settings.electricityRatePerUnit = electricityRatePerUnit;
  if (newPin) appData.settings.adminPin = newPin;

  // Recalculate all room light bills
  appData.rooms.forEach(r => {
    const units = Math.max(0, (r.meter.currentReading || 0) - (r.meter.pastReading || 0));
    r.billing.unitsConsumed = units;
    r.billing.lightBillAmount = units * electricityRatePerUnit;
    if (r.payment.status !== 'verified') {
      r.billing.totalPayable = r.rentAmount + r.billing.lightBillAmount + (r.billing.previousDues || 0);
    }
  });

  saveStore(appData);
  showToast('सेटिंग्ज यशस्वीरीत्या सेव्ह केल्या!');
  closeModal('settingsModal');
  refreshUI();
}

// Export Data Backup (JSON download)
function exportDataBackup() {
  const jsonStr = JSON.stringify(appData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `karegaon_rental_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('बॅकअप फाईल डाउनलोड झाली!');
}

// Import Data Backup
function importDataBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.rooms && imported.settings) {
        appData = imported;
        saveStore(appData);
        showToast('बॅकअप डेटा यशस्वीरीत्या रिस्टोअर झाला!');
        closeModal('settingsModal');
        refreshUI();
      } else {
        showToast('अवैध फाईल फॉरमॅट', true);
      }
    } catch (err) {
      showToast('बॅकअप वाचताना त्रुटी आली', true);
    }
  };
  reader.readAsText(file);
}

// History Modal
function openHistoryModal() {
  const container = document.getElementById('historyListContainer');
  container.innerHTML = '';

  if (appData.paymentHistory && appData.paymentHistory.length > 0) {
    appData.paymentHistory.forEach(item => {
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
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// =========================================================================
// OmAtharva Sadan - Karegaon Rental & Electricity Billing System
// Complete Data Store with Features 1, 3, 5, 6, 7, 8
// =========================================================================

const STORAGE_KEY = 'omatharva_sadan_store_v1';
const DOUBLE_ROOMS = [1, 6, 11, 15];

// Initial Demo Meter Photo (SVG / Data URL)
const SAMPLE_METER_PHOTO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'><rect width='400' height='260' fill='%230f172a'/><rect x='40' y='30' width='320' height='120' rx='10' fill='%23020617' stroke='%2338bdf8' stroke-width='3'/><text x='200' y='105' font-family='monospace' font-size='46' font-weight='bold' fill='%2338bdf8' text-anchor='middle'>00475 kWh</text><text x='200' y='190' font-family='sans-serif' font-size='16' font-weight='bold' fill='%23f59e0b' text-anchor='middle'>OMATHARVA SADAN - ROOM 1</text><text x='200' y='225' font-family='sans-serif' font-size='13' fill='%2394a3b8' text-anchor='middle'>Reading Date: 16 Nov 2026</text></svg>";

// Generate Initial Default Building Data (17 Rooms)
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
    let meterPhoto = null;

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
      meterPhoto = SAMPLE_METER_PHOTO;
      paymentDetails = {
        amount: 6050,
        utrNumber: 'UPI432198765432',
        submittedAt: '2026-11-15T18:30:00.000Z',
        notes: 'Google Pay ने भरले'
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
        notes: 'PhonePe ने भरले'
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
        lastReadingDate: '2026-11-10',
        photo: meterPhoto
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
      buildingName: 'ओमअथर्व सदन, कारेगाव, पुणे (OmAtharva Sadan)',
      address: 'कारेगाव, रांजणगाव एमआयडीसी रोड, शिरूर, पुणे - ४१२२०९',
      ownerName: 'वंदना माळी (Vandana Mali)',
      ownerPhone: '9876543210',
      ownerUpi: 'malivandana034@okicici',
      singleRoomRent: 3000,
      doubleRoomRent: 5000,
      electricityRatePerUnit: 10,
      adminPin: '1234',
      // FEATURE 6: Digital Notice Board
      notices: [
        {
          id: 1,
          text: 'कृपया सर्व भाडेकरूंनी कचरा सकाळी ९ च्या आधी इमारतीच्या मुख्य गेटजवळील डस्टबिनमध्ये ठेवावा.',
          date: '16/11/2026',
          active: true
        }
      ],
      // FEATURE 5: Building Expenses
      expenses: [
        { id: 1, title: 'MSEB मुख्य मीटर लाईट बिल', amount: 2400, date: '2026-11-10' },
        { id: 2, title: 'इमारत साफसफाई झाडूवाला', amount: 1200, date: '2026-11-05' }
      ]
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

// LocalStorage helpers
function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('speedyhome_karegaon_store_v4');
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.settings) {
        data.settings.buildingName = 'ओमअथर्व सदन, कारेगाव, पुणे (OmAtharva Sadan)';
        data.settings.ownerUpi = 'malivandana034@okicici';
        data.settings.ownerName = 'वंदना माळी (Vandana Mali)';
      }
      return data;
    }
  } catch (e) {
    console.error('Error loading store:', e);
  }
  const defaultData = generateDefaultData();
  saveStore(defaultData);
  return defaultData;
}

function saveStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving store:', e);
  }
}

// Global State
let appData = getStore();
let currentLoggedInRole = sessionStorage.getItem('karegaon_auth_role') || null;
let currentLoggedInRoomNumber = parseInt(sessionStorage.getItem('karegaon_auth_room')) || null;
let currentAdminFilter = 'all';
let currentEditingRoomNumber = 1;
let currentReceiptRoom = null;
let tempMeterPhotoBase64 = null;
let currentSettlementRoom = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = parseInt(urlParams.get('room'));

  populateLoginRoomDropdown();

  if (roomParam && roomParam >= 1 && roomParam <= 17) {
    const roomSelect = document.getElementById('loginRoomNumber');
    if (roomSelect) roomSelect.value = roomParam;
  }

  if (currentLoggedInRole === 'tenant' && currentLoggedInRoomNumber) {
    showTenantScreen(currentLoggedInRoomNumber);
  } else if (currentLoggedInRole === 'admin') {
    showAdminScreen();
  } else {
    showAuthScreen();
  }
});

// Toast Notifications
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  toastMsg.textContent = message;
  toastIcon.className = isError 
    ? 'fa-solid fa-circle-exclamation text-rose-400 text-lg' 
    : 'fa-solid fa-circle-check text-emerald-400 text-lg';

  toast.classList.remove('translate-y-28', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('translate-y-28', 'opacity-0', 'pointer-events-none');
  }, 3500);
}

// Populate Login Room Dropdown
function populateLoginRoomDropdown() {
  const select = document.getElementById('loginRoomNumber');
  if (!select) return;

  select.innerHTML = '<option value="">-- रूम नंबर निवडा --</option>';
  for (let i = 1; i <= 17; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `रूम नं. ${i}`;
    select.appendChild(opt);
  }
}

// Login Tabs Switching
function switchLoginTab(tab) {
  const tabTenantBtn = document.getElementById('tabTenantBtn');
  const tabAdminBtn = document.getElementById('tabAdminBtn');
  const tenantForm = document.getElementById('tenantLoginForm');
  const adminForm = document.getElementById('adminLoginForm');

  if (tab === 'tenant') {
    tabTenantBtn.className = 'py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md';
    tabAdminBtn.className = 'py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white';
    tenantForm.classList.remove('hidden');
    adminForm.classList.add('hidden');
  } else {
    tabAdminBtn.className = 'py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md';
    tabTenantBtn.className = 'py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white';
    tenantForm.classList.add('hidden');
    adminForm.classList.remove('hidden');
  }
}

// Tenant Login
function handleTenantLogin(e) {
  e.preventDefault();
  const roomNo = parseInt(document.getElementById('loginRoomNumber').value);
  const phone = document.getElementById('loginTenantPhone').value.trim();

  if (!roomNo) {
    showToast('कृपया तुमचा रूम नंबर निवडा', true);
    return;
  }
  if (!phone) {
    showToast('कृपया तुमचा मोबाईल नंबर टाका', true);
    return;
  }

  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) {
    showToast('रूम आढळली नाही', true);
    return;
  }

  if (room.tenant && room.tenant.phone) {
    const registeredPhone = room.tenant.phone.replace(/[^0-9]/g, '');
    const enteredPhone = phone.replace(/[^0-9]/g, '');
    
    if (!registeredPhone.endsWith(enteredPhone) && !enteredPhone.endsWith(registeredPhone)) {
      showToast(`या रूमसाठी नोंदणीकृत मोबाईल नंबर जुळत नाही. कृपया योग्य नंबर टाका.`, true);
      return;
    }
  }

  currentLoggedInRole = 'tenant';
  currentLoggedInRoomNumber = roomNo;
  sessionStorage.setItem('karegaon_auth_role', 'tenant');
  sessionStorage.setItem('karegaon_auth_room', roomNo);

  showToast(`रूम नं. ${roomNo} मध्ये स्वागत आहे! 🎉`);
  showTenantScreen(roomNo);
}

// Admin Login
function handleAdminLogin(e) {
  e.preventDefault();
  const pin = document.getElementById('loginAdminPin').value.trim();
  const correctPin = appData.settings.adminPin || '1234';

  if (!pin) {
    showToast('कृपया ४ अंकी PIN टाका', true);
    return;
  }

  if (pin === correctPin) {
    currentLoggedInRole = 'admin';
    currentLoggedInRoomNumber = null;
    sessionStorage.setItem('karegaon_auth_role', 'admin');
    sessionStorage.removeItem('karegaon_auth_room');

    showToast('Super Admin लॉगिन यशस्वी!');
    showAdminScreen();
  } else {
    showToast('चुकीचा PIN आहे! कृपया योग्य पासवर्ड टाका.', true);
  }
}

// Logout
function logout() {
  currentLoggedInRole = null;
  currentLoggedInRoomNumber = null;
  sessionStorage.removeItem('karegaon_auth_role');
  sessionStorage.removeItem('karegaon_auth_room');
  showAuthScreen();
  showToast('लॉगआउट यशस्वी!');
}

function goToHome() {
  if (currentLoggedInRole === 'tenant' && currentLoggedInRoomNumber) {
    showTenantScreen(currentLoggedInRoomNumber);
  } else if (currentLoggedInRole === 'admin') {
    showAdminScreen();
  } else {
    showAuthScreen();
  }
}

// Screen 1: Auth Screen
function showAuthScreen() {
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('tenantScreen').classList.add('hidden');
  document.getElementById('adminScreen').classList.add('hidden');

  document.getElementById('headerAuthNav').innerHTML = `
    <span class="text-xs text-slate-400 hidden sm:inline"><i class="fa-solid fa-lock text-emerald-400 mr-1"></i> सुरक्षित पोर्टल</span>
  `;
}

// Screen 2: Tenant Screen (ONLY LOGGED-IN ROOM)
function showTenantScreen(roomNo) {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('tenantScreen').classList.remove('hidden');
  document.getElementById('adminScreen').classList.add('hidden');

  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;

  // Header Nav Bar
  document.getElementById('headerAuthNav').innerHTML = `
    <div class="flex items-center gap-2">
      <span class="bg-slate-900 border border-slate-700/80 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
        <i class="fa-solid fa-door-open text-sky-400"></i> रूम ${room.roomNumber}
      </span>
      <button onclick="logout()" class="bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition">
        <i class="fa-solid fa-power-off"></i> <span class="hidden sm:inline">लॉगआउट</span>
      </button>
    </div>
  `;

  // FEATURE 6: Digital Notice Display
  const noticeBox = document.getElementById('tenantNoticeBox');
  const activeNotice = (appData.settings.notices || []).find(n => n.active);
  if (activeNotice) {
    noticeBox.classList.remove('hidden');
    document.getElementById('tenantNoticeText').textContent = activeNotice.text;
    document.getElementById('tenantNoticeDate').textContent = activeNotice.date;
  } else {
    noticeBox.classList.add('hidden');
  }

  // Tenant Details
  document.getElementById('tenantViewRoomBadge').textContent = `रूम नं. ${room.roomNumber}`;
  const isDouble = room.type === 'Double';
  document.getElementById('tenantViewTypeBadge').textContent = isDouble ? 'डबल रूम (₹५,०००)' : 'सिंगल रूम (₹३,०००)';
  document.getElementById('tenantRoomIdNumber').textContent = room.roomNumber;
  document.getElementById('tenantGreetingName').textContent = room.tenant?.name || `भाडेकरू (रूम ${room.roomNumber})`;
  document.getElementById('tenantBillMonth').textContent = room.billing?.month || 'चालू महिना';

  // Financials
  document.getElementById('tenantRentVal').textContent = `₹${(room.rentAmount || 0).toLocaleString('en-IN')}`;
  document.getElementById('tenantRentSubtext').textContent = isDouble ? 'फिक्स मासिक भाडे (डबल रूम)' : 'फिक्स मासिक भाडे (सिंगल रूम)';
  document.getElementById('tenantPastReadingVal').textContent = room.meter?.pastReading ?? 0;
  document.getElementById('tenantCurrReadingVal').textContent = room.meter?.currentReading ?? 0;
  
  const units = room.billing?.unitsConsumed || 0;
  document.getElementById('tenantUnitsVal').textContent = `${units} Units`;
  document.getElementById('tenantLightBillVal').textContent = `₹${(room.billing?.lightBillAmount || 0).toLocaleString('en-IN')}`;
  
  const prevDues = room.billing?.previousDues || 0;
  document.getElementById('tenantPrevDuesVal').textContent = `₹${prevDues.toLocaleString('en-IN')}`;
  
  const total = room.billing?.totalPayable || (room.rentAmount + (room.billing?.lightBillAmount || 0));
  document.getElementById('tenantTotalVal').textContent = `₹${total.toLocaleString('en-IN')}`;
  document.getElementById('inputTenantPaidAmount').value = total;

  // FEATURE 1: Meter Photo Proof Status
  const meterPhotoStatus = document.getElementById('tenantMeterPhotoStatus');
  const viewPhotoBtn = document.getElementById('viewMeterPhotoBtn');
  if (room.meter?.photo) {
    meterPhotoStatus.textContent = `फोटो उपलब्ध आहे (तारीख: ${room.meter.lastReadingDate || 'चालू महिना'})`;
    viewPhotoBtn.classList.remove('opacity-50', 'pointer-events-none');
  } else {
    meterPhotoStatus.textContent = `या महिन्याचा मीटर फोटो अद्याप जोडलेला नाही`;
  }

  // Payment Status
  const statusCard = document.getElementById('tenantPaymentStatusCard');
  const utrFormBox = document.getElementById('tenantUtrFormBox');
  const receiptActionBox = document.getElementById('tenantReceiptActionBox');
  const status = room.payment?.status || 'pending';

  if (status === 'verified') {
    statusCard.className = 'p-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-200 space-y-1.5 shadow-lg shadow-emerald-950/30';
    statusCard.innerHTML = `
      <div class="flex items-center gap-2 font-black text-sm text-emerald-400">
        <i class="fa-solid fa-circle-check text-lg"></i>
        <span>Payment Successful! (पेमेंट मंजूर झाले आहे 🎉)</span>
      </div>
      <p class="text-xs text-emerald-300/90 leading-relaxed">
        तुमचे <b>₹${(room.payment.details?.amount || total).toLocaleString('en-IN')}</b> चे पेमेंट इमारत मालकांनी व्हेरिफाय केले आहे. अधिकृत पावती खाली उपलब्ध आहे.
      </p>
      <div class="text-[11px] font-mono text-emerald-400/80 pt-1 border-t border-emerald-800/40 flex flex-wrap justify-between">
        <span>पावती क्र.: <b>${room.payment.details?.receiptNumber || 'RCP-VERIFIED'}</b></span>
        <span>UTR: ${room.payment.details?.utrNumber || 'N/A'}</span>
      </div>
    `;
    utrFormBox.classList.add('hidden');
    receiptActionBox.classList.remove('hidden');
  } else if (status === 'submitted') {
    statusCard.className = 'p-5 rounded-2xl border border-amber-500/40 bg-amber-950/40 text-amber-200 space-y-1.5 shadow-lg shadow-amber-950/30';
    statusCard.innerHTML = `
      <div class="flex items-center gap-2 font-black text-sm text-amber-400">
        <i class="fa-solid fa-clock-rotate-left text-base animate-spin"></i>
        <span>व्हेरिफिकेशन चालू आहे (Verification Under Review)</span>
      </div>
      <p class="text-xs text-amber-300/90 leading-relaxed">
        तुम्ही सबमिट केलेला UTR: <span class="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded">${room.payment.details?.utrNumber || '--'}</span>. 
        मालक तपासून लवकरच 'Successful' मार्क करतील.
      </p>
    `;
    utrFormBox.classList.remove('hidden');
    receiptActionBox.classList.add('hidden');
  } else {
    statusCard.className = 'p-5 rounded-2xl border border-rose-500/40 bg-rose-950/40 text-rose-200 space-y-1.5 shadow-lg shadow-rose-950/30';
    statusCard.innerHTML = `
      <div class="flex items-center gap-2 font-black text-sm text-rose-400">
        <i class="fa-solid fa-triangle-exclamation text-base"></i>
        <span>पेमेंट बाकी आहे (Payment Pending)</span>
      </div>
      <p class="text-xs text-rose-300/90 leading-relaxed">
        कृपया उजवीकडील UPI QR कोड स्कॅन करून किंवा 'Pay Now' वर क्लिक करून एकूण <b>₹${total.toLocaleString('en-IN')}</b> भरा आणि १२ अंकी UTR नंबर नोंदवा.
      </p>
    `;
    utrFormBox.classList.remove('hidden');
    receiptActionBox.classList.add('hidden');
  }

  generateTenantUpiQr(room, total);
}

// Generate Dynamic UPI QR Code
function generateTenantUpiQr(room, amount) {
  const upiId = appData.settings.ownerUpi || 'malivandana034@okicici';
  document.getElementById('tenantDisplayUpi').textContent = upiId;

  const payee = encodeURIComponent('Vandana Mali');
  const note = encodeURIComponent(`OmAtharva Sadan Room ${room.roomNumber} Rent`);
  const upiUrl = `upi://pay?pa=${upiId}&pn=${payee}&am=${amount}&cu=INR&tn=${note}`;

  document.getElementById('tenantUpiLinkBtn').href = upiUrl;

  const qrContainer = document.getElementById('tenantQrCanvas');
  qrContainer.innerHTML = '';

  if (window.QRCode) {
    try {
      new QRCode(qrContainer, {
        text: upiUrl,
        width: 176,
        height: 176,
        colorDark: '#020617',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      renderQrImageFallback(qrContainer, upiUrl);
    }
  } else {
    renderQrImageFallback(qrContainer, upiUrl);
  }
}

// Toggle between Dynamic QR Code and Original GPay QR Code
function toggleOriginalQr() {
  const dynamicWrap = document.getElementById('tenantQrCanvas');
  const originalImg = document.getElementById('originalGpayQrImg');
  const toggleBtn = document.getElementById('toggleQrBtnText');

  if (originalImg.classList.contains('hidden')) {
    dynamicWrap.classList.add('hidden');
    originalImg.classList.remove('hidden');
    toggleBtn.textContent = 'डायनॅमिक QR कोड दाखवा';
  } else {
    dynamicWrap.classList.remove('hidden');
    originalImg.classList.add('hidden');
    toggleBtn.textContent = 'मूळ GPay QR कोड दाखवा';
  }
}

function renderQrImageFallback(container, text) {
  const imgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=176x176&data=${encodeURIComponent(text)}`;
  container.innerHTML = `<img src="${imgUrl}" alt="UPI QR Code" class="w-44 h-44 object-contain rounded-xl shadow">`;
}

// Tenant Submits UTR
function handleTenantUtrSubmit() {
  const roomNo = currentLoggedInRoomNumber;
  const amount = document.getElementById('inputTenantPaidAmount').value.trim();
  const utrNumber = document.getElementById('inputTenantUtrNo').value.trim();
  const notes = document.getElementById('inputTenantNote').value.trim();

  if (!utrNumber) {
    showToast('कृपया अचूक UTR / ट्रान्झॅक्शन नंबर टाका', true);
    return;
  }

  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;

  room.payment.status = 'submitted';
  room.payment.details = {
    amount: Number(amount) || room.billing.totalPayable,
    utrNumber: utrNumber,
    submittedAt: new Date().toISOString(),
    notes: notes || 'भाडेकरूने ॲपवरून सबमिट केले'
  };

  saveStore(appData);
  showToast('पेमेंट तपशील पडताळणीसाठी मालकांकडे पाठवले आहे! धन्यवाद.');
  document.getElementById('inputTenantUtrNo').value = '';
  showTenantScreen(roomNo);
}

// Screen 3: Admin Screen (FULL 17 ROOMS)
function showAdminScreen() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('tenantScreen').classList.add('hidden');
  document.getElementById('adminScreen').classList.remove('hidden');

  document.getElementById('headerAuthNav').innerHTML = `
    <div class="flex items-center gap-2">
      <span class="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
        <i class="fa-solid fa-crown text-amber-400"></i> मालक / Admin
      </span>
      <button onclick="logout()" class="bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition">
        <i class="fa-solid fa-power-off"></i> <span class="hidden sm:inline">लॉगआउट</span>
      </button>
    </div>
  `;

  updateAdminStats();
  renderAdminRoomsGrid();
}

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

  document.getElementById('adminStatOccupied').textContent = occupiedRooms;
  document.getElementById('adminStatVacant').textContent = `${vacantRooms} रिकाम्या`;
  document.getElementById('adminStatTotalRent').textContent = `₹${totalRent.toLocaleString('en-IN')}`;
  document.getElementById('adminStatLightBill').textContent = `₹${totalLightBill.toLocaleString('en-IN')}`;
  document.getElementById('adminStatCollected').textContent = `₹${totalCollected.toLocaleString('en-IN')}`;
  document.getElementById('adminStatDues').textContent = `₹${totalDues.toLocaleString('en-IN')}`;
  document.getElementById('adminStatPendingPill').textContent = `${pendingVerificationCount} पडताळणी बाकी`;
}

function renderAdminRoomsGrid() {
  const grid = document.getElementById('adminRoomsGrid');
  grid.innerHTML = '';

  let filteredRooms = appData.rooms;
  if (currentAdminFilter === 'double') {
    filteredRooms = appData.rooms.filter(r => r.type === 'Double');
  } else if (currentAdminFilter === 'single') {
    filteredRooms = appData.rooms.filter(r => r.type === 'Single');
  } else if (currentAdminFilter === 'verification') {
    filteredRooms = appData.rooms.filter(r => r.payment?.status === 'submitted');
  }

  if (filteredRooms.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500 bg-slate-950/60 rounded-3xl border border-slate-800">
        <i class="fa-solid fa-filter text-3xl mb-2 text-slate-600"></i>
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
    card.className = 'bg-slate-950/80 rounded-3xl border border-slate-800 shadow-xl hover:border-slate-700 transition flex flex-col justify-between overflow-hidden';

    let statusBadge = '';
    if (status === 'verified') {
      statusBadge = `<span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Paid</span>`;
    } else if (status === 'submitted') {
      statusBadge = `<span class="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse"><i class="fa-solid fa-clock"></i> Verify करा</span>`;
    } else {
      statusBadge = `<span class="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"><i class="fa-solid fa-circle-xmark"></i> बाकी</span>`;
    }

    card.innerHTML = `
      <div>
        <div class="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div class="flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-xl ${isDouble ? 'bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-black' : 'bg-gradient-to-tr from-sky-600 to-blue-600 text-white font-bold'} flex items-center justify-center text-sm shadow">
              ${room.roomNumber}
            </span>
            <div>
              <span class="text-xs font-bold text-white block">रूम नं. ${room.roomNumber}</span>
              <span class="text-[10px] font-bold ${isDouble ? 'text-amber-400' : 'text-sky-400'}">
                ${isDouble ? '⭐ डबल रूम (₹५,०००)' : 'सिंगल रूम (₹३,०००)'}
              </span>
            </div>
          </div>
          <div>${statusBadge}</div>
        </div>

        <div class="p-4 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <div>
              <span class="text-slate-400 text-[10px] block">भाडेकरू:</span>
              <span class="font-bold text-white">${isOccupied ? room.tenant.name : '<span class="text-slate-400 italic">रिकामी रूम</span>'}</span>
            </div>
            <div class="text-right">
              <span class="text-slate-400 text-[10px] block">मोबाईल:</span>
              <span class="font-mono text-slate-300">${isOccupied ? room.tenant.phone : '--'}</span>
            </div>
          </div>

          <div class="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800 grid grid-cols-3 gap-1 text-center text-xs">
            <div>
              <span class="text-[10px] text-slate-400 block">मागील</span>
              <span class="font-mono font-bold text-slate-300">${room.meter?.pastReading ?? 0}</span>
            </div>
            <div class="border-x border-slate-800">
              <span class="text-[10px] text-slate-400 block">चालू</span>
              <span class="font-mono font-bold text-sky-400">${room.meter?.currentReading ?? 0}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">लाईट बिल</span>
              <span class="font-mono font-bold text-amber-400">₹${lightBill} (${units}u)</span>
            </div>
          </div>

          <div class="text-xs space-y-1 pt-1">
            <div class="flex justify-between text-slate-400">
              <span>मासिक भाडे:</span>
              <span class="font-semibold text-slate-200">₹${(room.rentAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>मागील बाकी (Pahili Baki):</span>
              <span class="font-semibold text-rose-400">₹${(room.billing?.previousDues || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-between text-sm font-black text-white border-t border-slate-800/80 pt-1.5">
              <span>एकूण येणे रक्कम:</span>
              <span class="font-mono text-sky-300">₹${totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          ${status === 'submitted' ? `
            <div class="bg-amber-950/40 p-2.5 rounded-2xl border border-amber-600/40 text-xs space-y-2 mt-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-amber-300">UTR: <span class="font-mono">${room.payment.details?.utrNumber || '--'}</span></span>
                <span class="text-[10px] font-bold text-amber-400">₹${room.payment.details?.amount || totalAmount}</span>
              </div>
              <div class="flex gap-1.5">
                <button onclick="adminVerifyPayment(${room.roomNumber}, 'approve')" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2 rounded-xl text-xs shadow flex items-center justify-center gap-1 transition">
                  <i class="fa-solid fa-check"></i> Approve (मंजूर)
                </button>
                <button onclick="adminVerifyPayment(${room.roomNumber}, 'reject')" class="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-2 rounded-xl text-xs shadow flex items-center justify-center gap-1 transition">
                  <i class="fa-solid fa-xmark"></i> Reject
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="p-3 bg-slate-900/60 border-t border-slate-800 grid grid-cols-4 gap-1.5 text-center">
        <button onclick="openMeterModal(${room.roomNumber})" title="मीटर रिडिंग व फोटो बदला" class="py-2 px-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 transition">
          <i class="fa-solid fa-bolt text-amber-400"></i> मीटर
        </button>
        <button onclick="openTenantEditModal(${room.roomNumber})" title="भाडेकरू माहिती बदला" class="py-2 px-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 transition">
          <i class="fa-solid fa-user text-sky-400"></i> भाडेकरू
        </button>
        <button onclick="shareWhatsAppBill(${room.roomNumber})" title="WhatsApp वर स्मरणपत्र पाठवा" class="py-2 px-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 rounded-xl text-xs font-bold transition">
          <i class="fa-brands fa-whatsapp text-emerald-400"></i> स्मरणपत्र
        </button>
        <button onclick="openMoveOutSettlement(${room.roomNumber})" title="रूम सोडताना हिशोब (Settlement)" class="py-2 px-1.5 bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800/40 rounded-xl text-xs font-bold transition">
          <i class="fa-solid fa-handshake text-amber-400"></i> सोडणे
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}

function adminFilter(filter) {
  currentAdminFilter = filter;
  document.querySelectorAll('.adminFilterBtn').forEach(btn => {
    if (btn.dataset.filter === filter) {
      btn.className = 'adminFilterBtn active px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 text-white';
    } else {
      btn.className = 'adminFilterBtn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-300 hover:bg-slate-800';
    }
  });
  renderAdminRoomsGrid();
}

// FEATURE 1: METER PHOTO PREVIEW & SAVE
function previewMeterPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    tempMeterPhotoBase64 = e.target.result;
    const previewImg = document.getElementById('modalPhotoPreviewImg');
    const container = document.getElementById('modalPhotoPreviewContainer');
    previewImg.src = tempMeterPhotoBase64;
    container.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function openMeterModal(roomNo) {
  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;
  currentEditingRoomNumber = roomNo;
  tempMeterPhotoBase64 = room.meter?.photo || null;

  document.getElementById('modalMeterRoomNumber').textContent = room.roomNumber;
  document.getElementById('modalPastReadingInput').value = room.meter?.pastReading ?? 0;
  document.getElementById('modalCurrentReadingInput').value = room.meter?.currentReading ?? room.meter?.pastReading ?? 0;
  document.getElementById('modalReadingDateInput').value = room.meter?.lastReadingDate || new Date().toISOString().split('T')[0];

  const previewImg = document.getElementById('modalPhotoPreviewImg');
  const container = document.getElementById('modalPhotoPreviewContainer');
  if (tempMeterPhotoBase64) {
    previewImg.src = tempMeterPhotoBase64;
    container.classList.remove('hidden');
  } else {
    container.classList.add('hidden');
  }

  calculateModalLightBill();
  document.getElementById('meterModal').classList.remove('hidden');
}

function calculateModalLightBill() {
  const past = parseFloat(document.getElementById('modalPastReadingInput').value) || 0;
  const current = parseFloat(document.getElementById('modalCurrentReadingInput').value) || 0;
  const rate = appData.settings.electricityRatePerUnit || 10;

  const units = Math.max(0, current - past);
  const bill = units * rate;

  document.getElementById('modalCalcUnitsText').textContent = `${units} Units`;
  document.getElementById('modalCalcBillText').textContent = `₹${bill.toLocaleString('en-IN')}`;
}

function saveModalMeterReading() {
  const roomNo = currentEditingRoomNumber;
  const currentReading = parseFloat(document.getElementById('modalCurrentReadingInput').value);
  const readingDate = document.getElementById('modalReadingDateInput').value;

  if (isNaN(currentReading)) {
    showToast('कृपया चालू रिडिंग टाका', true);
    return;
  }

  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;

  room.meter.currentReading = currentReading;
  room.meter.lastReadingDate = readingDate;
  if (tempMeterPhotoBase64) {
    room.meter.photo = tempMeterPhotoBase64;
  }

  const rate = appData.settings.electricityRatePerUnit || 10;
  const units = Math.max(0, currentReading - room.meter.pastReading);
  const lightBill = units * rate;

  room.billing.unitsConsumed = units;
  room.billing.lightBillAmount = lightBill;
  if (room.payment.status !== 'verified') {
    room.billing.totalPayable = room.rentAmount + lightBill + (room.billing.previousDues || 0);
  }

  saveStore(appData);
  showToast(`रूम नं. ${roomNo} चे मीटर रिडिंग व फोटो सेव्ह झाले!`);
  closeModal('meterModal');
  showAdminScreen();
}

function openMeterPhotoModal() {
  const room = appData.rooms.find(r => r.roomNumber === currentLoggedInRoomNumber);
  const photo = room?.meter?.photo;
  const img = document.getElementById('fullSizeMeterPhoto');
  const msg = document.getElementById('noMeterPhotoMsg');

  if (photo) {
    img.src = photo;
    img.classList.remove('hidden');
    msg.classList.add('hidden');
  } else {
    img.classList.add('hidden');
    msg.classList.remove('hidden');
  }
  document.getElementById('meterPhotoModal').classList.remove('hidden');
}

// FEATURE 6: DIGITAL NOTICE BOARD
function openNoticeModal() {
  renderNoticeList();
  document.getElementById('noticeModal').classList.remove('hidden');
}

function renderNoticeList() {
  const container = document.getElementById('activeNoticeList');
  container.innerHTML = '';
  const notices = appData.settings.notices || [];

  if (notices.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-500 italic">कोणतीही चालू नोटीस नाही.</p>';
    return;
  }

  notices.forEach((n, idx) => {
    const div = document.createElement('div');
    div.className = 'bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs flex items-start justify-between gap-2';
    div.innerHTML = `
      <div>
        <span class="text-[10px] text-amber-400 font-mono block">${n.date}</span>
        <p class="text-white mt-0.5">${n.text}</p>
      </div>
      <button onclick="deleteNotice(${n.id})" class="text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    container.appendChild(div);
  });
}

function publishNotice() {
  const text = document.getElementById('inputNoticeText').value.trim();
  if (!text) {
    showToast('कृपया सूचनेचा मजकूर टाका', true);
    return;
  }

  if (!appData.settings.notices) appData.settings.notices = [];
  appData.settings.notices.unshift({
    id: Date.now(),
    text: text,
    date: new Date().toLocaleDateString('mr-IN'),
    active: true
  });

  saveStore(appData);
  document.getElementById('inputNoticeText').value = '';
  renderNoticeList();
  showToast('नवीन नोटीस प्रसिद्ध झाली!');
}

function deleteNotice(id) {
  appData.settings.notices = (appData.settings.notices || []).filter(n => n.id !== id);
  saveStore(appData);
  renderNoticeList();
  showToast('नोटीस काढण्यात आली!');
}

// FEATURE 5: EXPENSES & PROFIT TRACKER
function openExpenseModal() {
  renderExpenseDashboard();
  document.getElementById('expenseModal').classList.remove('hidden');
}

function renderExpenseDashboard() {
  const expenses = appData.settings.expenses || [];
  let totalExpenses = 0;
  expenses.forEach(e => totalExpenses += (e.amount || 0));

  let totalCollected = 0;
  appData.rooms.forEach(r => {
    if (r.payment?.status === 'verified') {
      totalCollected += (r.payment.details?.amount || r.billing?.totalPayable || 0);
    }
  });

  const netProfit = totalCollected - totalExpenses;

  document.getElementById('expTotalCollected').textContent = `₹${totalCollected.toLocaleString('en-IN')}`;
  document.getElementById('expTotalExpenses').textContent = `₹${totalExpenses.toLocaleString('en-IN')}`;
  document.getElementById('expNetProfit').textContent = `₹${netProfit.toLocaleString('en-IN')}`;

  const container = document.getElementById('expenseItemsContainer');
  container.innerHTML = '';

  if (expenses.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">चालू महिन्यासाठी कोणताही खर्च नोंदवलेला नाही.</p>';
    return;
  }

  expenses.forEach(e => {
    const div = document.createElement('div');
    div.className = 'bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between';
    div.innerHTML = `
      <div>
        <span class="font-bold text-white block">${e.title}</span>
        <span class="text-[10px] text-slate-400 font-mono">${e.date}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="font-bold text-rose-400 font-mono text-sm">₹${e.amount.toLocaleString('en-IN')}</span>
        <button onclick="deleteExpenseItem(${e.id})" class="text-slate-500 hover:text-rose-400">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

function addExpenseItem() {
  const title = document.getElementById('inputExpTitle').value.trim();
  const amount = parseFloat(document.getElementById('inputExpAmount').value);

  if (!title || isNaN(amount) || amount <= 0) {
    showToast('कृपया खर्चाचे नाव आणि योग्य रक्कम टाका', true);
    return;
  }

  if (!appData.settings.expenses) appData.settings.expenses = [];
  appData.settings.expenses.unshift({
    id: Date.now(),
    title: title,
    amount: amount,
    date: new Date().toISOString().split('T')[0]
  });

  saveStore(appData);
  document.getElementById('inputExpTitle').value = '';
  document.getElementById('inputExpAmount').value = '';
  renderExpenseDashboard();
  showToast('खर्च यशस्वीरीत्या नोंदवला!');
}

function deleteExpenseItem(id) {
  appData.settings.expenses = (appData.settings.expenses || []).filter(e => e.id !== id);
  saveStore(appData);
  renderExpenseDashboard();
}

// FEATURE 7: EXPORT MONTHLY EXCEL / CSV REPORT
function exportMonthlyExcelReport() {
  const headers = [
    'Room No',
    'Room Type',
    'Tenant Name',
    'Mobile',
    'Past Reading',
    'Current Reading',
    'Units Used',
    'Light Bill (Rs)',
    'Room Rent (Rs)',
    'Previous Dues (Rs)',
    'Total Payable (Rs)',
    'Payment Status',
    'UTR No',
    'Payment Date'
  ];

  const rows = [headers];

  appData.rooms.forEach(r => {
    rows.push([
      r.roomNumber,
      r.type === 'Double' ? 'Double Room' : 'Single Room',
      r.tenant ? `"${r.tenant.name}"` : 'Vacant',
      r.tenant ? `"${r.tenant.phone}"` : '-',
      r.meter?.pastReading ?? 0,
      r.meter?.currentReading ?? 0,
      r.billing?.unitsConsumed ?? 0,
      r.billing?.lightBillAmount ?? 0,
      r.rentAmount ?? 0,
      r.billing?.previousDues ?? 0,
      r.billing?.totalPayable ?? 0,
      r.payment?.status ?? 'pending',
      r.payment?.details?.utrNumber ? `"${r.payment.details.utrNumber}"` : '-',
      r.payment?.details?.verifiedAt ? new Date(r.payment.details.verifiedAt).toLocaleDateString('en-GB') : '-'
    ]);
  });

  const csvContent = '\uFEFF' + rows.map(e => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OmAtharva_Sadan_Monthly_Report_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Excel/CSV रिपोर्ट यशस्वीरीत्या डाउनलोड झाला!');
}

// FEATURE 8: MOVE-OUT & DEPOSIT SETTLEMENT
function openMoveOutSettlement(roomNo) {
  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room || !room.tenant) {
    showToast('या रूममध्ये भाडेकरू नोंदवलेला नाही', true);
    return;
  }
  currentSettlementRoom = room;

  document.getElementById('settleRoomNo').textContent = room.roomNumber;
  document.getElementById('settleRoomDisplay').textContent = `रूम नं. ${room.roomNumber} (${room.type === 'Double' ? 'डबल' : 'सिंगल'})`;
  document.getElementById('settleTenantName').textContent = room.tenant.name;
  document.getElementById('settleDate').textContent = new Date().toLocaleDateString('mr-IN');
  
  const deposit = room.tenant.deposit || (room.type === 'Double' ? 10000 : 6000);
  document.getElementById('settleOriginalDeposit').textContent = `₹${deposit.toLocaleString('en-IN')}`;

  document.getElementById('settleUnpaidRent').value = room.billing?.previousDues || 0;
  document.getElementById('settleFinalLightBill').value = room.billing?.lightBillAmount || 0;
  document.getElementById('settleRepairDeduction').value = 1000;

  calculateSettlement();
  document.getElementById('settlementModal').classList.remove('hidden');
}

function calculateSettlement() {
  if (!currentSettlementRoom) return;
  const deposit = currentSettlementRoom.tenant?.deposit || (currentSettlementRoom.type === 'Double' ? 10000 : 6000);
  const unpaidRent = parseFloat(document.getElementById('settleUnpaidRent').value) || 0;
  const lightBill = parseFloat(document.getElementById('settleFinalLightBill').value) || 0;
  const repair = parseFloat(document.getElementById('settleRepairDeduction').value) || 0;

  const totalDeductions = unpaidRent + lightBill + repair;
  const refundable = Math.max(0, deposit - totalDeductions);

  document.getElementById('settleRefundableAmount').textContent = `₹${refundable.toLocaleString('en-IN')}`;
}

function completeMoveOutAndVacate() {
  if (!currentSettlementRoom) return;
  const roomNo = currentSettlementRoom.roomNumber;

  if (!confirm(`तुम्हाला खात्री आहे का की रूम नं. ${roomNo} चा हिशोब पूर्ण करून रूम रिकामी करायची आहे?`)) {
    return;
  }

  currentSettlementRoom.tenant = null;
  currentSettlementRoom.status = 'vacant';
  currentSettlementRoom.payment.status = 'pending';
  currentSettlementRoom.payment.details = null;
  currentSettlementRoom.billing.previousDues = 0;
  currentSettlementRoom.billing.totalPayable = 0;

  saveStore(appData);
  showToast(`रूम नं. ${roomNo} चा हिशोब पूर्ण झाला आणि रूम रिकामी केली!`);
  closeModal('settlementModal');
  populateLoginRoomDropdown();
  showAdminScreen();
}

// FEATURE 3: BULK WHATSAPP REMINDERS
function sendBulkWhatsAppReminders() {
  const unpaidRooms = appData.rooms.filter(r => r.status === 'occupied' && r.payment?.status !== 'verified');
  
  if (unpaidRooms.length === 0) {
    showToast('सर्व भाडेकरूंनी भाडे भरलेले आहे! थकबाकी नाही.', false);
    return;
  }

  const roomList = unpaidRooms.map(r => `रूम ${r.roomNumber}: ${r.tenant?.name} (₹${r.billing?.totalPayable})`).join('\n');
  const proceed = confirm(`खालील ${unpaidRooms.length} भाडेकरूंचे भाडे बाकी आहे:\n\n${roomList}\n\nपहिली रूम (${unpaidRooms[0].roomNumber}) साठी WhatsApp उघडायचे का?`);

  if (proceed) {
    shareWhatsAppBill(unpaidRooms[0].roomNumber);
  }
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

  const message = `*${appData.settings.buildingName || 'ओमअथर्व सदन, कारेगाव, पुणे'} - मासिक बिल स्मरणपत्र*\n\n` +
    `नमस्कार ${room.tenant.name},\n` +
    `तुमचे चालू महिन्याचे खोली भाडे व लाईट बिल खालीलप्रमाणे बाकी आहे:\n\n` +
    `🏠 *रूम नं: ${room.roomNumber}* (${room.type === 'Double' ? 'डबल रूम' : 'सिंगल रूम'})\n` +
    `💵 *१. खोली भाडे:* ₹${room.rentAmount}\n` +
    `⚡ *२. लाईट बिल:* ₹${room.billing?.lightBillAmount} (${room.billing?.unitsConsumed} युनिट्स @ ₹${appData.settings.electricityRatePerUnit || 10}/u)\n` +
    `   • मागील रिडिंग: ${room.meter?.pastReading} | चालू रिडिंग: ${room.meter?.currentReading}\n` +
    `⏳ *३. पहिली बाकी (थकबाकी):* ₹${room.billing?.previousDues}\n` +
    `----------------------------------\n` +
    `💰 *एकूण भरायची रक्कम: ₹${total}*\n\n` +
    `📲 *ऑनलाइन बिल पाहण्यासाठी व UPI ने पेमेंट करण्यासाठी येथे क्लिक करा:*\n` +
    `${appUrl}\n\n` +
    `पेमेंट केल्यानंतर कृपया UTR नंबर ॲपमध्ये सबमिट करा.\n` +
    `धन्यवाद! 🙏`;

  const waUrl = tenantPhone 
    ? `https://wa.me/91${tenantPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(waUrl, '_blank');
}

// Admin Payment Verification
function adminVerifyPayment(roomNo, action) {
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
    showToast(`रूम नं. ${roomNo} चे पेमेंट मंजूर झाले! 🎉 पावती तयार आहे.`);
    showAdminScreen();
  } else if (action === 'reject') {
    room.payment.status = 'pending';
    room.payment.details = null;
    saveStore(appData);
    showToast(`रूम नं. ${roomNo} चे पेमेंट नाकारले.`);
    showAdminScreen();
  }
}

// Batch Meter Modal
function openBatchMeterModal() {
  const tbody = document.getElementById('batchMeterTableBody');
  tbody.innerHTML = '';

  appData.rooms.forEach(room => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-900/60 transition border-b border-slate-800/60';
    const isDouble = room.type === 'Double';
    const tenantName = room.tenant ? room.tenant.name.split(' ')[0] : '<span class="text-slate-400 italic">रिकामी</span>';

    tr.innerHTML = `
      <td class="p-2.5 font-bold font-mono text-white">रूम ${room.roomNumber}</td>
      <td class="p-2.5 text-[11px] font-semibold ${isDouble ? 'text-amber-400' : 'text-sky-400'}">${isDouble ? 'डबल' : 'सिंगल'}</td>
      <td class="p-2.5 text-slate-300">${tenantName}</td>
      <td class="p-2.5 font-mono text-slate-400">${room.meter?.pastReading ?? 0}</td>
      <td class="p-2.5">
        <input type="number" data-room="${room.roomNumber}" data-past="${room.meter?.pastReading ?? 0}" value="${room.meter?.currentReading ?? ''}" oninput="updateBatchRowLive(this)" class="batchMeterInput w-24 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 font-mono font-bold text-xs text-white focus:outline-none focus:border-sky-500">
      </td>
      <td class="p-2.5 font-mono font-bold text-amber-400" id="batchBill-${room.roomNumber}">
        ₹${room.billing?.lightBillAmount || 0}
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('batchMeterModal').classList.remove('hidden');
}

function updateBatchRowLive(input) {
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
  showAdminScreen();
}

// Tenant Edit Modal
function openTenantEditModal(roomNo) {
  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;
  currentEditingRoomNumber = roomNo;

  document.getElementById('modalEditRoomNumber').textContent = room.roomNumber;
  document.getElementById('modalEditTenantName').value = room.tenant?.name || '';
  document.getElementById('modalEditTenantPhone').value = room.tenant?.phone || '';
  document.getElementById('modalEditTenantRent').value = room.rentAmount || (room.type === 'Double' ? 5000 : 3000);
  document.getElementById('modalEditTenantDeposit').value = room.tenant?.deposit || '';
  document.getElementById('modalEditTenantJoinDate').value = room.tenant?.joinDate || new Date().toISOString().split('T')[0];
  document.getElementById('modalEditTenantAadhaar').value = room.tenant?.aadhaar || '';

  document.getElementById('tenantEditModal').classList.remove('hidden');
}

function saveModalTenantDetails() {
  const roomNo = currentEditingRoomNumber;
  const name = document.getElementById('modalEditTenantName').value.trim();
  const phone = document.getElementById('modalEditTenantPhone').value.trim();
  const rentAmount = parseFloat(document.getElementById('modalEditTenantRent').value) || 0;
  const deposit = parseFloat(document.getElementById('modalEditTenantDeposit').value) || 0;
  const joinDate = document.getElementById('modalEditTenantJoinDate').value;
  const aadhaar = document.getElementById('modalEditTenantAadhaar').value.trim();

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
  populateLoginRoomDropdown();
  showAdminScreen();
}

// Receipt Modal
function openReceiptModal(roomNo) {
  const room = appData.rooms.find(r => r.roomNumber === roomNo);
  if (!room) return;
  currentReceiptRoom = room;

  const total = room.payment?.status === 'verified' && room.payment.details?.amount
    ? room.payment.details.amount
    : (room.billing?.totalPayable || (room.rentAmount + (room.billing?.lightBillAmount || 0)));

  document.getElementById('rcptBuildingName').textContent = appData.settings.buildingName || 'कारेगाव रेसिडेन्सी, पुणे';
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

  const message = `*${appData.settings.buildingName || 'ओमअथर्व सदन, कारेगाव, पुणे'} - अधिकृत भरणा पावती*\n\n` +
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
    `ओमअथर्व सदन (OmAtharva Sadan) • धन्यवाद! 🙏`;

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
  showAdminScreen();
}

// Backup & Restore
function exportDataBackup() {
  const jsonStr = JSON.stringify(appData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omatharva_sadan_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('बॅकअप फाईल डाउनलोड झाली!');
}

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
        showToast('बॅकअप डेटा रिस्टोअर झाला!');
        closeModal('settingsModal');
        showAdminScreen();
      } else {
        showToast('अवैध फाईल फॉरमॅट', true);
      }
    } catch (err) {
      showToast('बॅकअप वाचताना त्रुटी आली', true);
    }
  };
  reader.readAsText(file);
}

// Payment History Modal
function openHistoryModal() {
  const container = document.getElementById('historyListContainer');
  container.innerHTML = '';

  if (appData.paymentHistory && appData.paymentHistory.length > 0) {
    appData.paymentHistory.forEach(item => {
      const div = document.createElement('div');
      div.className = 'p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-1';
      div.innerHTML = `
        <div class="flex items-center justify-between font-bold text-white">
          <span>रूम नं. ${item.roomNumber} - ${item.tenantName}</span>
          <span class="text-emerald-400 font-mono text-sm">₹${(item.amount || 0).toLocaleString('en-IN')}</span>
        </div>
        <div class="flex justify-between text-slate-400 text-[11px]">
          <span>पावती क्र.: <span class="font-mono font-semibold text-slate-200">${item.receiptNumber || 'N/A'}</span></span>
          <span>तारीख: ${new Date(item.verifiedAt).toLocaleDateString('mr-IN')}</span>
        </div>
        <div class="text-[11px] text-slate-400">
          भाडे: ₹${item.rentAmount} | लाईट बिल: ₹${item.lightBillAmount} | UTR: <span class="font-mono text-sky-400">${item.utrNumber}</span>
        </div>
      `;
      container.appendChild(div);
    });
  } else {
    container.innerHTML = '<p class="text-center text-slate-500 py-6">कोणताही इतिहास सापडला नाही.</p>';
  }
  document.getElementById('historyModal').classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const { getData, saveData } = require('./data/store');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to recalculate room billing
function recalculateRoom(room, ratePerUnit) {
  const past = Number(room.meter?.pastReading) || 0;
  const current = Number(room.meter?.currentReading) || past;
  const units = Math.max(0, current - past);
  const lightBill = units * ratePerUnit;
  const rent = Number(room.rentAmount) || 0;
  const previousDues = Number(room.billing?.previousDues) || 0;

  room.meter.pastReading = past;
  room.meter.currentReading = current;
  room.billing.unitsConsumed = units;
  room.billing.lightBillAmount = lightBill;
  room.billing.currentRent = rent;
  room.billing.previousDues = previousDues;
  room.billing.totalPayable = rent + lightBill + previousDues;
  return room;
}

// 1. Get Settings
app.get('/api/settings', (req, res) => {
  const data = getData();
  const safeSettings = { ...data.settings };
  delete safeSettings.adminPin; // don't expose pin directly
  res.json({ success: true, settings: safeSettings });
});

// 2. Verify Admin PIN
app.post('/api/admin/verify-pin', (req, res) => {
  const { pin } = req.body;
  const data = getData();
  if (pin === data.settings.adminPin) {
    res.json({ success: true, message: 'PIN valid' });
  } else {
    res.status(401).json({ success: false, message: 'चुकीचा पासवर्ड/PIN आहे (Incorrect PIN)' });
  }
});

// 3. Update Settings
app.put('/api/settings', (req, res) => {
  const { pin, newPin, buildingName, address, ownerName, ownerPhone, ownerUpi, singleRoomRent, doubleRoomRent, electricityRatePerUnit } = req.body;
  const data = getData();
  if (pin !== data.settings.adminPin) {
    return res.status(401).json({ success: false, message: 'चुकीचा PIN आहे' });
  }

  if (buildingName) data.settings.buildingName = buildingName;
  if (address) data.settings.address = address;
  if (ownerName) data.settings.ownerName = ownerName;
  if (ownerPhone) data.settings.ownerPhone = ownerPhone;
  if (ownerUpi) data.settings.ownerUpi = ownerUpi;
  if (singleRoomRent) data.settings.singleRoomRent = Number(singleRoomRent);
  if (doubleRoomRent) data.settings.doubleRoomRent = Number(doubleRoomRent);
  if (electricityRatePerUnit) data.settings.electricityRatePerUnit = Number(electricityRatePerUnit);
  if (newPin && newPin.trim()) data.settings.adminPin = newPin.trim();

  // Recalculate all rooms with new rate
  data.rooms.forEach(r => recalculateRoom(r, data.settings.electricityRatePerUnit));

  saveData(data);
  res.json({ success: true, message: 'Settings यशस्वीरीत्या सेव्ह केल्या!', settings: data.settings });
});

// 4. Get All Rooms
app.get('/api/rooms', (req, res) => {
  const data = getData();
  res.json({ success: true, rooms: data.rooms, settings: { buildingName: data.settings.buildingName, ownerUpi: data.settings.ownerUpi, rate: data.settings.electricityRatePerUnit } });
});

// 5. Get Single Room
app.get('/api/rooms/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const data = getData();
  const room = data.rooms.find(r => r.roomNumber === id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'रूम सापडली नाही' });
  }
  res.json({ success: true, room, settings: { buildingName: data.settings.buildingName, ownerName: data.settings.ownerName, ownerPhone: data.settings.ownerPhone, ownerUpi: data.settings.ownerUpi, rate: data.settings.electricityRatePerUnit } });
});

// 6. Update Tenant Details
app.put('/api/rooms/:id/tenant', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, phone, aadhaar, deposit, joinDate, rentAmount, action } = req.body;
  const data = getData();
  const room = data.rooms.find(r => r.roomNumber === id);
  if (!room) return res.status(404).json({ success: false, message: 'रूम सापडली नाही' });

  if (action === 'vacate') {
    room.tenant = null;
    room.status = 'vacant';
    room.payment.status = 'pending';
    room.payment.details = null;
  } else {
    room.tenant = {
      name: name?.trim() || '',
      phone: phone?.trim() || '',
      aadhaar: aadhaar?.trim() || '',
      deposit: Number(deposit) || 0,
      joinDate: joinDate || new Date().toISOString().split('T')[0]
    };
    room.status = 'occupied';
    if (rentAmount) room.rentAmount = Number(rentAmount);
  }

  recalculateRoom(room, data.settings.electricityRatePerUnit);
  saveData(data);
  res.json({ success: true, message: 'भाडेकरू माहिती अपडेट झाली!', room });
});

// 7. Update Meter Reading for Room
app.put('/api/rooms/:id/meter', (req, res) => {
  const id = parseInt(req.params.id);
  const { pastReading, currentReading, readingDate } = req.body;
  const data = getData();
  const room = data.rooms.find(r => r.roomNumber === id);
  if (!room) return res.status(404).json({ success: false, message: 'रूम सापडली नाही' });

  if (pastReading !== undefined && pastReading !== null) {
    room.meter.pastReading = Number(pastReading);
  }
  if (currentReading !== undefined && currentReading !== null) {
    room.meter.currentReading = Number(currentReading);
  }
  if (readingDate) {
    room.meter.lastReadingDate = readingDate;
  }

  recalculateRoom(room, data.settings.electricityRatePerUnit);
  saveData(data);
  res.json({ success: true, message: `रूम नं. ${id} चे मीटर रिडिंग यशस्वीरीत्या नोंदवले!`, room });
});

// 8. Batch Meter Reading for All Rooms
app.put('/api/rooms-batch-meter', (req, res) => {
  const { readings } = req.body; // array of { roomNumber, currentReading }
  const data = getData();
  if (!Array.isArray(readings)) {
    return res.status(400).json({ success: false, message: 'Readings array required' });
  }

  readings.forEach(item => {
    const room = data.rooms.find(r => r.roomNumber === item.roomNumber);
    if (room && item.currentReading !== undefined && item.currentReading !== '') {
      room.meter.currentReading = Number(item.currentReading);
      recalculateRoom(room, data.settings.electricityRatePerUnit);
    }
  });

  saveData(data);
  res.json({ success: true, message: 'सर्व खोल्यांचे मीटर रिडिंग अपडेट झाले!', rooms: data.rooms });
});

// 9. Update Previous Dues / Adjustment
app.put('/api/rooms/:id/dues', (req, res) => {
  const id = parseInt(req.params.id);
  const { previousDues, rentAmount } = req.body;
  const data = getData();
  const room = data.rooms.find(r => r.roomNumber === id);
  if (!room) return res.status(404).json({ success: false, message: 'रूम सापडली नाही' });

  if (previousDues !== undefined) {
    room.billing.previousDues = Number(previousDues);
  }
  if (rentAmount !== undefined) {
    room.rentAmount = Number(rentAmount);
  }

  recalculateRoom(room, data.settings.electricityRatePerUnit);
  saveData(data);
  res.json({ success: true, message: 'रक्कम अपडेट झाली!', room });
});

// 10. Tenant Submits Payment
app.post('/api/rooms/:id/payment/submit', (req, res) => {
  const id = parseInt(req.params.id);
  const { amount, utrNumber, notes } = req.body;
  const data = getData();
  const room = data.rooms.find(r => r.roomNumber === id);
  if (!room) return res.status(404).json({ success: false, message: 'रूम सापडली नाही' });

  if (!utrNumber || utrNumber.trim().length < 4) {
    return res.status(400).json({ success: false, message: 'कृपया अचूक UTR / ट्रान्झॅक्शन नंबर टाका.' });
  }

  room.payment.status = 'submitted';
  room.payment.details = {
    amount: Number(amount) || room.billing.totalPayable,
    utrNumber: utrNumber.trim(),
    submittedAt: new Date().toISOString(),
    notes: notes?.trim() || 'भाडेकरूने सबमिट केले'
  };

  saveData(data);
  res.json({
    success: true,
    message: 'पेमेंट व्हेरिफिकेशनसाठी पाठवले आहे! Admin व्हेरिफाय करेल.',
    payment: room.payment
  });
});

// 11. Admin Verifies Payment (Approve / Reject)
app.post('/api/rooms/:id/payment/verify', (req, res) => {
  const id = parseInt(req.params.id);
  const { action, notes } = req.body; // action: 'approve' | 'reject'
  const data = getData();
  const room = data.rooms.find(r => r.roomNumber === id);
  if (!room) return res.status(404).json({ success: false, message: 'रूम सापडली नाही' });

  if (action === 'approve') {
    const paidAmount = Number(room.payment?.details?.amount) || room.billing.totalPayable;
    const receiptNo = `RCP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(id).padStart(3, '0')}`;
    
    room.payment.status = 'verified';
    room.payment.details = {
      ...(room.payment.details || {}),
      verifiedAt: new Date().toISOString(),
      receiptNumber: receiptNo,
      verifiedNotes: notes || 'Admin Verified'
    };

    // Calculate remaining balance if partial payment
    const diff = room.billing.totalPayable - paidAmount;
    room.billing.previousDues = Math.max(0, diff);
    room.billing.totalPayable = Math.max(0, diff);

    // Save into payment history
    data.paymentHistory.unshift({
      id: `hist-${Date.now()}`,
      roomNumber: id,
      tenantName: room.tenant?.name || 'Unknown',
      month: room.billing.month || new Date().toLocaleString('mr-IN', { month: 'long', year: 'numeric' }),
      amount: paidAmount,
      rentAmount: room.rentAmount,
      lightBillAmount: room.billing.lightBillAmount,
      unitsConsumed: room.billing.unitsConsumed,
      pastReading: room.meter.pastReading,
      currentReading: room.meter.currentReading,
      utrNumber: room.payment.details.utrNumber,
      receiptNumber: receiptNo,
      verifiedAt: new Date().toISOString()
    });

    saveData(data);
    res.json({ success: true, message: `रूम नं. ${id} चे पेमेंट यशस्वीरीत्या व्हेरिफाय झाले! 🎉`, room });
  } else if (action === 'reject') {
    room.payment.status = 'pending';
    room.payment.details = null;
    saveData(data);
    res.json({ success: true, message: `रूम नं. ${id} चे पेमेंट नाकारले (Rejected). भाडेकरूला पुन्हा सबमिट करण्यास सांगा.`, room });
  } else {
    res.status(400).json({ success: false, message: 'Invalid action' });
  }
});

// 12. Move to Next Month Billing Cycle
app.post('/api/rooms/:id/next-cycle', (req, res) => {
  const id = parseInt(req.params.id);
  const data = getData();
  const room = data.rooms.find(r => r.roomNumber === id);
  if (!room) return res.status(404).json({ success: false, message: 'रूम सापडली नाही' });

  // Current reading becomes past reading
  room.meter.pastReading = room.meter.currentReading;
  // If payment was not verified, remaining dues roll over into previous dues
  if (room.payment.status !== 'verified') {
    room.billing.previousDues = room.billing.totalPayable;
  } else {
    room.billing.previousDues = 0;
  }

  // Reset payment status for new month
  room.payment.status = 'pending';
  room.payment.details = null;

  recalculateRoom(room, data.settings.electricityRatePerUnit);
  saveData(data);
  res.json({ success: true, message: `रूम नं. ${id} नवीन महिन्याच्या बिलासाठी तयार केले!`, room });
});

// 13. Get Overview Stats
app.get('/api/stats', (req, res) => {
  const data = getData();
  const totalRooms = data.rooms.length;
  const occupiedRooms = data.rooms.filter(r => r.status === 'occupied').length;
  const vacantRooms = totalRooms - occupiedRooms;

  let totalRent = 0;
  let totalLightBill = 0;
  let totalDues = 0;
  let totalCollected = 0;
  let pendingVerificationCount = 0;

  data.rooms.forEach(r => {
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

  res.json({
    success: true,
    stats: {
      totalRooms,
      occupiedRooms,
      vacantRooms,
      totalRent,
      totalLightBill,
      totalDues,
      totalCollected,
      pendingVerificationCount,
      doubleRoomsCount: 4,
      singleRoomsCount: 13
    }
  });
});

// 14. Get Payment History
app.get('/api/history', (req, res) => {
  const data = getData();
  res.json({ success: true, history: data.paymentHistory || [] });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 Karegaon Rental App Server is running on:`);
  console.log(`👉 Local:   http://localhost:${PORT}`);
  console.log(`====================================================`);
});

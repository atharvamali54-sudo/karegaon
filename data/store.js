const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

const DOUBLE_ROOMS = [1, 6, 11, 15];

function getDefaultData() {
  const rooms = [];
  for (let i = 1; i <= 17; i++) {
    const isDouble = DOUBLE_ROOMS.includes(i);
    const rentAmount = isDouble ? 5000 : 3000;
    
    // Sample initial demo tenants for testing
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
      currentReading = 475; // 55 units = Rs 550
      previousDues = 500;   // Pahili baki = Rs 500
      paymentStatus = 'submitted';
      paymentDetails = {
        amount: 6050, // 5000 + 550 + 500
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
      currentReading = 245; // 35 units = Rs 350
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
      currentReading = 625; // 45 units = Rs 450
      previousDues = 0;
      paymentStatus = 'pending';
    }

    const units = Math.max(0, currentReading - pastReading);
    const lightBill = units * 10;
    const totalAmount = rentAmount + lightBill + previousDues;

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
        totalPayable: totalAmount,
        month: 'नोव्हेंबर २०२६ (November 2026)'
      },
      payment: {
        status: paymentStatus, // 'pending' | 'submitted' | 'verified'
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
      }
    ]
  };
}

function initData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = getDefaultData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data file, reinitializing:', err);
    const defaultData = getDefaultData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
}

function getData() {
  return initData();
}

function saveData(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

module.exports = {
  getData,
  saveData,
  DOUBLE_ROOMS
};

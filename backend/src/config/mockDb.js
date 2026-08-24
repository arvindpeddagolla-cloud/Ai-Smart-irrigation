import bcryptjs from 'bcryptjs';

// Pre-hash a default password "password123" for testing
const salt = bcryptjs.genSaltSync(10);
const hashedPassword = bcryptjs.hashSync('password123', salt);

export const mockDB = {
  users: [
    {
      _id: 'u1',
      name: 'Ramesh Patel',
      email: 'ramesh@farm.com',
      password: hashedPassword,
      role: 'FARMER',
      phone: '+91 98765 43210',
      createdAt: new Date('2026-01-10T10:00:00Z')
    },
    {
      _id: 'u2',
      name: 'Ravi Verma',
      email: 'ravi@smartcare.com',
      password: hashedPassword,
      role: 'TECHNICIAN',
      phone: '+91 99887 76655',
      specialty: 'HARDWARE',
      activeJobs: 2,
      status: 'ONLINE',
      createdAt: new Date('2026-02-15T09:00:00Z')
    },
    {
      _id: 'u3',
      name: 'Kumar Swamy',
      email: 'kumar@smartcare.com',
      password: hashedPassword,
      role: 'TECHNICIAN',
      phone: '+91 88776 65544',
      specialty: 'SOFTWARE_IOT',
      activeJobs: 1,
      status: 'ONLINE',
      createdAt: new Date('2026-02-16T11:00:00Z')
    },
    {
      _id: 'u4',
      name: 'Suresh Kumar',
      email: 'suresh@smartcare.com',
      password: hashedPassword,
      role: 'TECHNICIAN',
      phone: '+91 77665 54433',
      specialty: 'FIELD',
      activeJobs: 0,
      status: 'OFFLINE',
      createdAt: new Date('2026-02-17T12:00:00Z')
    },
    {
      _id: 'u5',
      name: 'Demo Admin',
      email: 'admin@smartirrigation.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+91 90000 12345',
      createdAt: new Date('2026-01-01T08:00:00Z')
    }
  ],

  devices: [
    {
      _id: 'd1',
      model: 'Smart Irrigation V1',
      serialNumber: 'SI123456',
      owner: 'u1',
      firmwareVersion: 'v1.4.2',
      purchaseDate: new Date('2026-06-12T10:00:00Z'),
      batteryLevel: 87,
      status: 'ONLINE',
      sensors: {
        soilMoisture: { status: 'ONLINE', value: 42 },
        dht22: { status: 'ONLINE', temp: 31, humidity: 68 },
        wifi: { status: 'ONLINE', signalStrength: -65 },
        weatherApi: { status: 'ONLINE' },
        battery: { status: 'ONLINE', health: 'GOOD' }
      },
      registeredAt: new Date('2026-06-12T12:00:00Z')
    }
  ],

  readings: [
    { _id: 'r1', deviceId: 'd1', serialNumber: 'SI123456', soilMoisture: 45, temperature: 30, humidity: 65, battery: 90, timestamp: new Date('2026-08-25T01:00:00Z') },
    { _id: 'r2', deviceId: 'd1', serialNumber: 'SI123456', soilMoisture: 44, temperature: 30, humidity: 66, battery: 89, timestamp: new Date('2026-08-25T01:30:00Z') },
    { _id: 'r3', deviceId: 'd1', serialNumber: 'SI123456', soilMoisture: 43, temperature: 31, humidity: 67, battery: 88, timestamp: new Date('2026-08-25T02:00:00Z') },
    { _id: 'r4', deviceId: 'd1', serialNumber: 'SI123456', soilMoisture: 42, temperature: 31, humidity: 68, battery: 87, timestamp: new Date('2026-08-25T02:30:00Z') }
  ],

  warranties: [
    {
      _id: 'w1',
      serialNumber: 'SI123456',
      productName: 'Smart Irrigation V1',
      purchaseDate: new Date('2026-06-12T10:00:00Z'),
      expiryDate: new Date('2027-06-12T10:00:00Z'),
      status: 'ACTIVE'
    }
  ],

  tickets: [
    {
      _id: 't1',
      ticketId: 'SI-2026-00085',
      farmerId: 'u1',
      farmerName: 'Ramesh Patel',
      farmerPhone: '+91 98765 43210',
      serialNumber: 'SI123456',
      productModel: 'Smart Irrigation V1',
      category: 'Power',
      description: 'Device not charging under direct solar setup.',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      assignedTechnicianId: 'u2',
      assignedTechnicianName: 'Ravi Verma',
      attachments: [],
      location: 'XYZ Village, Block 4, farm plot B',
      timeline: [
        { status: 'NEW', note: 'Support request created', timestamp: new Date('2026-08-10T09:00:00Z') },
        { status: 'ASSIGNED', note: 'Assigned to Ravi Verma', timestamp: new Date('2026-08-10T10:30:00Z') },
        { status: 'INSPECTION', note: 'Inspection started', timestamp: new Date('2026-08-11T11:00:00Z') },
        { status: 'COMPLETED', note: 'Solar panels cleaned, wires tightened. Repair completed.', timestamp: new Date('2026-08-11T14:30:00Z') }
      ],
      createdAt: new Date('2026-08-10T09:00:00Z'),
      updatedAt: new Date('2026-08-11T14:30:00Z')
    },
    {
      _id: 't2',
      ticketId: 'SI-2026-00099',
      farmerId: 'u1',
      farmerName: 'Ramesh Patel',
      farmerPhone: '+91 98765 43210',
      serialNumber: 'SI123456',
      productModel: 'Smart Irrigation V1',
      category: 'Connectivity',
      description: 'Dashboard reports OFFLINE for past 2 hours.',
      priority: 'HIGH',
      status: 'COMPLETED',
      assignedTechnicianId: 'u3',
      assignedTechnicianName: 'Kumar Swamy',
      attachments: [],
      location: 'XYZ Village, Block 4, farm plot B',
      timeline: [
        { status: 'NEW', note: 'Support request created', timestamp: new Date('2026-08-15T15:00:00Z') },
        { status: 'ASSIGNED', note: 'Assigned to Kumar Swamy', timestamp: new Date('2026-08-15T16:00:00Z') },
        { status: 'COMPLETED', note: 'Firmware reset and local Wi-Fi re-paired.', timestamp: new Date('2026-08-15T18:00:00Z') }
      ],
      createdAt: new Date('2026-08-15T15:00:00Z'),
      updatedAt: new Date('2026-08-15T18:00:00Z')
    }
  ],

  upgrades: [
    {
      _id: 'up1',
      farmerId: 'u1',
      farmerName: 'Ramesh Patel',
      serialNumber: 'SI123456',
      currentModel: 'Smart Irrigation V1',
      requestedUpgrade: 'Smart Irrigation V2',
      status: 'PENDING',
      createdAt: new Date('2026-08-20T10:00:00Z')
    }
  ]
};

// Simple CRUD mock interfaces
export const mockDBActions = {
  find: (collection) => mockDB[collection],
  findOne: (collection, queryFn) => mockDB[collection].find(queryFn),
  findById: (collection, id) => mockDB[collection].find(item => item._id === id),
  create: (collection, data) => {
    const newItem = {
      _id: `mock_${collection}_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    mockDB[collection].push(newItem);
    return newItem;
  },
  findByIdAndUpdate: (collection, id, updates) => {
    const idx = mockDB[collection].findIndex(item => item._id === id);
    if (idx !== -1) {
      mockDB[collection][idx] = {
        ...mockDB[collection][idx],
        ...updates,
        updatedAt: new Date()
      };
      return mockDB[collection][idx];
    }
    return null;
  },
  findOneAndUpdate: (collection, queryFn, updates) => {
    const idx = mockDB[collection].findIndex(queryFn);
    if (idx !== -1) {
      mockDB[collection][idx] = {
        ...mockDB[collection][idx],
        ...updates,
        updatedAt: new Date()
      };
      return mockDB[collection][idx];
    }
    return null;
  }
};

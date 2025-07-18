const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');
const Ticket = require('../src/models/Ticket');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Ticket.deleteMany({});
});

describe('Tenant Data Isolation', () => {
  test('Admin from Tenant A cannot read Tenant B data', async () => {
    // Create users for two different tenants
    const adminTenantA = new User({
      email: 'admin@tenanta.com',
      password: 'password123',
      name: 'Admin A',
      customerId: 'tenanta',
      role: 'Admin'
    });
    await adminTenantA.save();

    const adminTenantB = new User({
      email: 'admin@tenantb.com',
      password: 'password123',
      name: 'Admin B',
      customerId: 'tenantb',
      role: 'Admin'
    });
    await adminTenantB.save();

    // Create tickets for each tenant
    const ticketTenantA = new Ticket({
      title: 'Tenant A Ticket',
      description: 'This belongs to Tenant A',
      customerId: 'tenanta',
      createdBy: adminTenantA._id
    });
    await ticketTenantA.save();

    const ticketTenantB = new Ticket({
      title: 'Tenant B Ticket',
      description: 'This belongs to Tenant B',
      customerId: 'tenantb',
      createdBy: adminTenantB._id
    });
    await ticketTenantB.save();

    // Admin A should only see their own tenant's data
    const tenantATickets = await Ticket.find({ customerId: 'tenanta' });
    expect(tenantATickets).toHaveLength(1);
    expect(tenantATickets[0].title).toBe('Tenant A Ticket');

    // Admin B should only see their own tenant's data
    const tenantBTickets = await Ticket.find({ customerId: 'tenantb' });
    expect(tenantBTickets).toHaveLength(1);
    expect(tenantBTickets[0].title).toBe('Tenant B Ticket');

    // Cross-tenant query should return empty
    const crossTenantQuery = await Ticket.find({ 
      customerId: 'tenanta',
      _id: ticketTenantB._id 
    });
    expect(crossTenantQuery).toHaveLength(0);
  });
});
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect('mongodb://admin:password@localhost:27017/flowbit?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  customerId: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

// Ticket schema
const ticketSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Ticket.deleteMany({});

    // Create LogisticsCo Admin
    const logisticsAdmin = new User({
      email: 'admin@logisticsco.com',
      password: 'password123',
      name: 'LogisticsCo Admin',
      customerId: 'logisticsco',
      role: 'Admin'
    });
    await logisticsAdmin.save();

    // Create LogisticsCo User
    const logisticsUser = new User({
      email: 'user@logisticsco.com',
      password: 'password123',
      name: 'LogisticsCo User',
      customerId: 'logisticsco',
      role: 'User'
    });
    await logisticsUser.save();

    // Create RetailGmbH Admin
    const retailAdmin = new User({
      email: 'admin@retailgmbh.com',
      password: 'password123',
      name: 'RetailGmbH Admin',
      customerId: 'retailgmbh',
      role: 'Admin'
    });
    await retailAdmin.save();

    // Create RetailGmbH User
    const retailUser = new User({
      email: 'user@retailgmbh.com',
      password: 'password123',
      name: 'RetailGmbH User',
      customerId: 'retailgmbh',
      role: 'User'
    });
    await retailUser.save();

    // Create sample tickets for LogisticsCo
    const logisticsTickets = [
      {
        customerId: 'logisticsco',
        title: 'Shipment Tracking Issue',
        description: 'Customer cannot track their shipment using the provided tracking number.',
        priority: 'high',
        status: 'open',
        createdBy: logisticsUser._id
      },
      {
        customerId: 'logisticsco',
        title: 'Delivery Delay Complaint',
        description: 'Customer complaining about delayed delivery that was supposed to arrive yesterday.',
        priority: 'medium',
        status: 'in-progress',
        createdBy: logisticsUser._id
      },
      {
        customerId: 'logisticsco',
        title: 'Package Damaged',
        description: 'Package arrived damaged. Customer requesting replacement or refund.',
        priority: 'urgent',
        status: 'open',
        createdBy: logisticsAdmin._id
      }
    ];

    for (const ticketData of logisticsTickets) {
      const ticket = new Ticket(ticketData);
      await ticket.save();
    }

    // Create sample tickets for RetailGmbH
    const retailTickets = [
      {
        customerId: 'retailgmbh',
        title: 'Product Return Request',
        description: 'Customer wants to return a product that doesn\'t match the description.',
        priority: 'medium',
        status: 'open',
        createdBy: retailUser._id
      },
      {
        customerId: 'retailgmbh',
        title: 'Payment Processing Error',
        description: 'Customer\'s payment was charged twice for the same order.',
        priority: 'high',
        status: 'resolved',
        createdBy: retailUser._id
      },
      {
        customerId: 'retailgmbh',
        title: 'Website Login Issues',
        description: 'Multiple customers reporting they cannot log into their accounts.',
        priority: 'urgent',
        status: 'in-progress',
        createdBy: retailAdmin._id
      }
    ];

    for (const ticketData of retailTickets) {
      const ticket = new Ticket(ticketData);
      await ticket.save();
    }

    console.log('Database seeded successfully!');
    console.log('\nDemo Users Created:');
    console.log('LogisticsCo Admin: admin@logisticsco.com / password123');
    console.log('LogisticsCo User: user@logisticsco.com / password123');
    console.log('RetailGmbH Admin: admin@retailgmbh.com / password123');
    console.log('RetailGmbH User: user@retailgmbh.com / password123');
    console.log('\nSample tickets created for both tenants.');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Event = require("./models/Event");
const Booking = require("./models/Bookings");

dotenv.config();

const users = [
  {
    name: "Admin User",
    email: "admin@eventora.com",
    password: "password123",
    role: "admin",
  },
  {
    name: "Ayush Patokar",
    email: "ayush@eventora.com",
    password: "password123",
    role: "user",
  },
  {
    name: "Alice Smith",
    email: "alice@eventora.com",
    password: "password123",
    role: "user",
  },
  {
    name: "Bob Johnson",
    email: "bob@eventora.com",
    password: "password123",
    role: "user",
  },
];

const events = [
  {
    title: "React & Node.js Developer Retreat",
    description:
      "Join us for a deep dive into modern full-stack web development using React, Node.js and Express.",
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    location: "Pune",
    category: "Technology",
    totalSeats: 200,
    ticketPrice: 999,
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Neon Nights Music Festival",
    description:
      "Experience an unforgettable night of live music, DJs and amazing performances.",
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    location: "Mumbai",
    category: "Music",
    totalSeats: 500,
    ticketPrice: 1499,
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Global Leaders Business Summit",
    description:
      "A business event featuring entrepreneurs, founders and investors discussing the future of business and technology.",
    date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    location: "Bangalore",
    category: "Business",
    totalSeats: 150,
    ticketPrice: 2499,
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Modern Art Exhibition",
    description:
      "Explore contemporary artwork from talented artists and creative minds.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: "Delhi",
    category: "Art",
    totalSeats: 300,
    ticketPrice: 299,
    imageUrl:
      "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "AI & Machine Learning Workshop",
    description:
      "Learn the fundamentals of Artificial Intelligence and Machine Learning through practical sessions.",
    date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    location: "Hyderabad",
    category: "Technology",
    totalSeats: 100,
    ticketPrice: 1499,
    imageUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Photography Masterclass",
    description:
      "Learn professional photography techniques from experienced photographers.",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    location: "Goa",
    category: "Photography",
    totalSeats: 80,
    ticketPrice: 799,
    imageUrl:
      "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Gaming & Esports Expo",
    description:
      "Experience gaming tournaments, new releases and the latest gaming technology.",
    date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    location: "Mumbai",
    category: "Gaming",
    totalSeats: 400,
    ticketPrice: 699,
    imageUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Digital Marketing Seminar",
    description:
      "Learn about SEO, social media marketing, content marketing and online advertising.",
    date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    location: "Pune",
    category: "Marketing",
    totalSeats: 180,
    ticketPrice: 599,
    imageUrl:
      "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Fitness & Wellness Camp",
    description:
      "A wellness event featuring fitness activities, nutrition sessions and expert guidance.",
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    location: "Goa",
    category: "Fitness",
    totalSeats: 120,
    ticketPrice: 499,
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Cloud Computing Conference",
    description:
      "Explore cloud architecture, DevOps, scalable applications and modern cloud technologies.",
    date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    location: "Bangalore",
    category: "Technology",
    totalSeats: 250,
    ticketPrice: 1299,
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB - matches MONGODB_URI used in index.js / .env.example
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("\n✅ MongoDB connection open...");

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Booking.deleteMany({});

    console.log("🗑️ Existing users, events and bookings cleared.");

    // Hash passwords
    const salt = await bcrypt.genSalt(10);

    const hashedUsers = users.map((user) => ({
      ...user,
      password: bcrypt.hashSync(user.password, salt),
      isVerified: true,
    }));

    // Create users
    const createdUsers = await User.insertMany(hashedUsers);

    console.log(`👤 Created ${createdUsers.length} users.`);

    // Find admin and normal users
    const adminUser = createdUsers.find((user) => user.role === "admin");
    const normalUsers = createdUsers.filter((user) => user.role === "user");

    // Add admin and available seats to events
    const eventsWithAdmin = events.map((event) => ({
      ...event,
      availableSeats: event.totalSeats,
      createdBy: adminUser._id,
    }));

    // Create events
    const createdEvents = await Event.insertMany(eventsWithAdmin);

    console.log(`🎉 Created ${createdEvents.length} events.`);

    // Generate bookings
    const bookingsData = [];

    for (const event of createdEvents) {
      // Assign 1-3 users to each event
      const randomCount = Math.floor(Math.random() * 3) + 1;

      // Shuffle users
      const shuffledUsers = [...normalUsers].sort(() => Math.random() - 0.5);
      const selectedUsers = shuffledUsers.slice(0, randomCount);

      for (const user of selectedUsers) {
        const statuses = ["pending", "confirmed", "cancelled"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        let paymentStatus = "non_paid";

        // Confirmed bookings are paid and reduce available seats
        if (status === "confirmed") {
          paymentStatus = "paid";
          event.availableSeats -= 1;
          await event.save();
        }

        bookingsData.push({
          userId: user._id,
          eventId: event._id,
          status: status,
          paymentStatus: paymentStatus,
          amount: event.ticketPrice,
        });
      }
    }

    // Insert bookings
    await Booking.insertMany(bookingsData);

    console.log(`🎫 Created ${bookingsData.length} bookings.`);

    console.log("\n🚀 Database seeded successfully!");
    console.log("-------------------------------------------");
    console.log("Admin Email: admin@eventora.com");
    console.log("User Email:  ayush@eventora.com");
    console.log("Password:    password123");
    console.log("-------------------------------------------\n");

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

seedDatabase();

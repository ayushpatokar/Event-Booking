const express = require('express');
const dotenv =require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const console = require('node:console');
const authRoutes = require('./routes/auth.js');
const eventRoutes = require('./routes/events.js');
const bookingRoutes = require('./routes/booking.js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth',authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);


//connect to mongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
  console.log('connected to MongoDb');
})
.catch((error)=>{
  console.error('Error connecting to MongoDB:',error);const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.js');
const eventRoutes = require('./routes/events.js');
const bookingRoutes = require('./routes/booking.js');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Eventora API Running');
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
  console.log(`server is running at http://localhost:${PORT}`);
})
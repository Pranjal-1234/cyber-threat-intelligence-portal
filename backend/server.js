const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { runSetup } = require('./setup');
const authRoutes = require('./routes/auth');
const threatRoutes = require('./routes/threats');
const checkRoutes = require('./routes/check');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admins');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/threats', threatRoutes);
app.use('/check', checkRoutes);
app.use('/users', userRoutes);
app.use('/admins', adminRoutes);


const PORT = process.env.PORT || 5000;

runSetup()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database setup failed:', err.message);
        process.exit(1);
    });

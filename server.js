require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// المسارات
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/chat'));
app.use('/api', require('./routes/subscribe'));
app.use('/api', require('./routes/merchant')); // جديد
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
require('dotenv').config();

const express = require('express');

const mongoose = require('mongoose');
// const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const { default: axios } = require('axios');
const { logger } = require('./logger');
const CrypticHunt = require('./models/crypticHuntEmail');

/**
 * Global configuration
 */
const secretKey = process.env.CAPTCHA;

const app = express();
app.use(cors());

// app.use(session({ secret: 'who am i?' }));

/** database connections and configurations */
mongoose.connect(process.env.MONGO);
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/** route to handle email and captcha data from user */
app.post('/rsvp', async (req, res) => {
  if (!req.body.captcha) {
    logger.error(`Captcha wasn't supplied in body`);
    return res.json({ success: false, msg: 'Captcha is not checked.' });
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}`;
  try {
    const request = await axios.get(verifyUrl);
    const { data } = request;

    if (!data.success || data.success === undefined) {
      logger.warn(`Captcha verification failed: ${JSON.stringify(data)}`);
      return res.json({ success: false, msg: 'Captcha verification failed.' });
    }

    if (data.score < 0.5) {
      return res.json({
        success: false,
        msg: 'You might be a bot, sorry!',
      });
    }

    const email = req.body.email.toString();
    logger.info(`Adding email to db, Email: ${email}`);

    try {
      await CrypticHunt.create({ email });
    } catch (err) {
      logger.error(`Error adding email to db: ${err}`);
      return res.json({ success: false, msg: 'Email already registered.' });
    }

    return res.json({ success: true, msg: 'Email registered successfully.' });
  } catch (e) {
    logger.error(`Captcha verification failed: ${e}`);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port');
});

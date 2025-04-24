import * as core from 'express-serve-static-core';
import twilio from 'twilio';
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SERVICE_ID,
} from '../../../shopify.app.json';

const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_AUTH_TOKEN;
const serviceId = TWILIO_SERVICE_ID;
const client = twilio(accountSid, authToken);

export default (app: core.Express) => {
  app.post('/api/public/verify', async (req, res) => {
    const {phoneNumber} = req.body;
    if (!phoneNumber) {
      res.status(400).json({error: 'Phone number is required'});
      return;
    }
    if (phoneNumber[0] !== '+') {
      res.status(400).json({error: 'Phone number must start with a + sign'});
      return;
    }

    try {
      const verification = await client.verify.v2
        .services(serviceId)
        .verifications.create({
          channel: 'sms',
          to: phoneNumber,
        });
      console.log(verification);

      res.status(200).json({
        success: true,
        message: 'Verification code sent',
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      res.status(400).json({
        success: false,
        message: 'Error sending verification code',
      });
    }
  });
  app.get('/api/public/verify/:phoneNumber', async (req, res) => {
    const {phoneNumber} = req.params;
    const {code} = req.query;
    if (!phoneNumber) {
      res.status(400).json({error: 'Phone number is required'});
      return;
    }
    if (!code) {
      res.status(400).json({error: 'Code is required'});
      return;
    }

    try {
      const verificationCheck = await client.verify.v2
        .services(serviceId)
        .verificationChecks.create({
          to: phoneNumber,
          code: code as string,
        });
      console.log(verificationCheck);

      if (verificationCheck.status !== 'approved') {
        res.status(400).json({
          success: false,
          message: 'Verification code not valid',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Verification code checked',
      });
    } catch (error) {
      console.error('Error checking verification code:', error);
      res.status(400).json({
        success: false,
        message: 'Error checking verification code',
      });
    }
  });
};

/* eslint-disable max-len */
import * as core from 'express-serve-static-core';
import twilio from 'twilio';
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SERVICE_ID,
} from '../../../shopify.app.json';
import {db} from '../../firebase.server';

const VERIFICATION_COOLDOWN_SECONDS = 60; // e.g., 60 seconds

export const verifyStorage = {
  collection: db.collection('shopify-verify'),
  canAttempt: async (phoneNumber: string): Promise<boolean> => {
    try {
      const docRef = verifyStorage.collection.doc(phoneNumber);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        // No previous attempt recorded, allow it.
        return true;
      }

      const data = docSnap.data();
      if (!data?.lastAttemptTimestamp) {
        console.warn(`Firestore document ${phoneNumber} missing lastAttemptTimestamp.`);
        return true;
      }

      const secondsSinceLastAttempt = (Date.now() - data.lastAttemptTimestamp) / 1000;

      return secondsSinceLastAttempt >= VERIFICATION_COOLDOWN_SECONDS;
    } catch (error) {
      console.error(`Error checking verification attempt for ${phoneNumber}:`, error);
      return true;
    }
  },
  store: async (phoneNumber: string): Promise<void> => {
    try {
      const docRef = verifyStorage.collection.doc(phoneNumber);
      await docRef.set(
        {
          phoneNumber: phoneNumber, // Store phone number for potential queries
          lastAttemptTimestamp: Date.now(), // Use Firestore Timestamp
        },
        {merge: true} // Use merge: true to create or update
      );
      console.log(`Stored verification attempt for ${phoneNumber}`);
    } catch (error) {
      console.error(`Error storing verification attempt for ${phoneNumber}:`, error);
      // Log the error, but don't throw, as the SMS might have already been sent.
    }
  },
};

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
      // *** Spam Prevention Check ***
      const allowed = await verifyStorage.canAttempt(phoneNumber);
      if (!allowed) {
        console.log(`Verification attempt blocked for ${phoneNumber} due to cooldown.`);
        res.status(429).json({ // 429 Too Many Requests
          success: false,
          message: `Too many verification requests. Please wait ${VERIFICATION_COOLDOWN_SECONDS} seconds before trying again.`,
        });
        return;
      }

      const verification = await client.verify.v2
        .services(serviceId)
        .verifications.create({
          channel: 'sms',
          to: phoneNumber,
        });
      console.log(verification);

      await verifyStorage.store(phoneNumber);

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

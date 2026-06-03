/**
 * contact.routes.js — routes for the contact endpoint.
 */
const express = require('express');
const router = express.Router();

const { validateContact } = require('../middleware/validate');
const { submitContact } = require('../controllers/contact.controller');

// POST /api/contact
router.post('/', validateContact, submitContact);

module.exports = router;

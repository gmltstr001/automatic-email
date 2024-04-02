const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 3000;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission
app.post('/send-email', upload.single('attachment'), async (req, res) => {
    var { sMailto, sSubject, sName, sAge, sGender, sOcc, sDesc, sSubs, sIntrst} = req.body;
    var attachments = [];

    // Check if attachment exists
    if (req.file) {
        attachments.push({
            filename: req.file.originalname,
            path: req.file.path,
            contentType: req.file.mimetype,
        });
    }
    const sBody = `Name: ${sName}\nAge: ${sAge}\nGender: ${sGender}\nOccupation: ${sOcc}\n\nDesciption:\n${sDesc}\n\nSubscription: ${sSubs}\nInterests: ${sIntrst}`;

    const mailOptions = {
        from: {
            name: 'Mailer Testing',
            address: process.env.EMAIL_USER,
        },
        to: sMailto,
        subject: sSubject,
        text: sBody,
        attachments: attachments,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email was sent!');
        res.json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while sending the email.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

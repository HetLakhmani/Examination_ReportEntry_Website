const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const blobStream = require('blob-stream');

// Insert user to database
router.post('/add', async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            enrollmentID: req.body.enrollmentID,
            subject_name: req.body.subject_name,
            marks: req.body.marks,
        });
        await user.save(); // Using await to handle promise
        req.session.message = {
            type: 'success',
            message: 'User added successfully'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'error' });
    }
});

// Get all users routes
router.get('/', async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('index', { title: "Home Page", users: users });
    } catch (err) {
        res.json({ message: err.message });
    }
});


router.get('/add', (req, res) => {
    res.render('add_users', { title: "Add Users" });
});

//Edit an user deatails
//Edit an user details
router.get('/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const user = await User.findById(id).exec();
        if (!user) {
            res.redirect('/');
        } else {
            res.render('edit_users', { title: "Edit Users", user: user });
        }
    } catch (err) {
        res.json({ message: err.message });
    }
});

router.post('/update/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const updatedUser = {
            name: req.body.name,
            enrollmentID: req.body.enrollmentID,
            subject_name: req.body.subject_name,
            marks: req.body.marks,
        };
        await User.findByIdAndUpdate(id, updatedUser);
        req.session.message = {
            type: 'success',
            message: 'User updated successfully'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

//Delete user routes

router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        await User.findByIdAndDelete(id);
        req.session.message = {
            type: 'danger',
            message: 'User deleted successfully'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Define route for downloading PDF
router.get('/download-pdf', async (req, res) => {
    try {
        // Fetch data from the database (assuming you have a function to retrieve users)
        const users = await User.find();

        // Create a new PDF document
        const doc = new PDFDocument();

        // Set response headers
        res.setHeader('Content-Disposition', 'attachment; filename="users.pdf"');
        res.setHeader('Content-Type', 'application/pdf');

        // Pipe the PDF document to the response
        doc.pipe(res);

        // Add content to the PDF
        doc.fontSize(16).text('User List', { align: 'center' });
        doc.moveDown();

        // Loop through the users and add them to the PDF
        users.forEach((user, index) => {
            doc.text(`User ${index + 1}: ${user.name} - ${user.enrollmentID} - ${user.subject_name} - ${user.marks}`);
            doc.moveDown();
        });

        // End the PDF document
        doc.end();
    } catch (err) {
        // Handle errors
        console.error('Error generating PDF:', err);
        res.status(500).send('Error generating PDF');
    }
});

module.exports = router;

// app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')

// Connect to MongoDB
mongoose.connect('mongodb+srv://anandsaiii1200:Yanandsai@cluster1.nzqg4k4.mongodb.net/student-mentorDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Create Mentor model
const Mentor = mongoose.model('Mentor', new mongoose.Schema({
  name: String
}));

// Create Student model
const Student = mongoose.model('Student', new mongoose.Schema({
  name: String,
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }
}));

// Create Express app
const app = express();

app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// API to create Mentor
app.post('/mentors', async (req, res) => {
  try {
    const mentor = new Mentor({ name: req.body.name });
    await mentor.save();
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Mentor' });
  }
});

// API to create Student
app.post('/students', async (req, res) => {
  try {
    const student = new Student({ name: req.body.name });
    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Student' });
  }
});

// API to assign a student to Mentor
app.post('/students/:studentId/mentor/:mentorId', async (req, res) => {
  try {
    const { studentId, mentorId } = req.params;
    const student = await Student.findByIdAndUpdate(studentId, { mentor: mentorId }, { new: true });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign Mentor to Student' });
  }
});

// API to select one mentor and add multiple students
app.post('/mentors/:mentorId/students', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await Mentor.findById(mentorId);
    const students = req.body.students;

    // Assign mentor to students
    for (const studentId of students) {
      await Student.findByIdAndUpdate(studentId, { mentor: mentorId });
    }

    res.json({ message: 'Students assigned to Mentor successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign students to Mentor' });
  }
});

// API to assign or change Mentor for a particular Student
app.put('/students/:studentId/mentor/:mentorId', async (req, res) => {
  try {
    const { studentId, mentorId } = req.params;
    const student = await Student.findByIdAndUpdate(studentId, { mentor: mentorId }, { new: true });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign/change Mentor for Student' });
  }
});

// API to select one student and assign one mentor
app.put('/students/:studentId/assign-mentor', async (req, res) => {
  try {
    const { studentId } = req.params;
    const mentorId = req.body.mentorId;
    const student = await Student.findByIdAndUpdate(studentId, { mentor: mentorId }, { new: true });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign Mentor to Student' });
  }
});

// API to show all students for a particular mentor
app.get('/mentors/:mentorId/students', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const students = await Student.find({ mentor: mentorId });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get students for Mentor' });
  }
});

// API to show the previously assigned mentor for a particular student
app.get('/students/:studentId/previous-mentor', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate('mentor');
    if (student.mentor) {
      res.json(student.mentor);
    } else {
      res.json({ message: 'Student has no previous mentor' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get previous mentor for Student' });
  }
});

// Start the server
const port = 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

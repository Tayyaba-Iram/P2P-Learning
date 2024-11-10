import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

// Campus Schema
const campusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    programs: [programSchema] // Array of program objects
});

// University Schema
const universitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // Ensure university names are unique
    },
    campuses: [campusSchema] // Array of campus objects
});

// Model creation
const University = mongoose.model('University', universitySchema);

export default University;

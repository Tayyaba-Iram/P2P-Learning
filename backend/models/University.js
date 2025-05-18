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
    programs: [programSchema]
});

// University Schema
const universitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true 
    },
    campuses: [campusSchema] 
});

const University = mongoose.model('University', universitySchema);

export default University;

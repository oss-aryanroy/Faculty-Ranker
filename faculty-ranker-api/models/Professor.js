import { Schema, model } from 'mongoose';

const professorSchema = new Schema({
  emp_id: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  name: String,
  designation: String,
  department: String,
  image: String,
  specialization: [String]
});

export default model('Professor', professorSchema, 'professor_info');
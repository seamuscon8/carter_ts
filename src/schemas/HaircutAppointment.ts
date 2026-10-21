import { Schema, type Model, models, model } from "mongoose";
import type { HaircutAppointment } from "@/data/haircutappointment";

const appointmentStatuses = ["scheduled", "completed", "cancelled"] as const;

const HaircutAppointmentSchema = new Schema({
  appointmentNumber: {
    type: Number,
    required: [true, "Appointment number is required."],
    unique: true,
  },

  customerName: {
    type: String,
    required: [true, "Name is required."],
    trim: true,
    minLength: 1,
    maxLength: [30, "Name cannot exceed 30 characters."],
  },

  customerEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },

  customerPhone: {
    type: String,
    required: [true, "Phone number is required."],
    set: (value: string) => value.replace(/\D/g, ""),
    match: [/^\d{10}$/, "Phone number must be 10 digits."],
  },

  appointmentDate: {
    type: Date,
    required: [true, "Appointment date is required."],
  },

  appointmentTime: {
    type: String,
    required: [true, "Appointment time is required."],
  },

  service: {
    type: String,
    trim: true,
  },

  barberId: {
    type: Number,
  },

  barberName: {
    type: String,
    trim: true,
  },

  status: {
    type: String,
    enum: appointmentStatuses,
    required: true,
    default: "scheduled",
  },

  price: {
    type: Number,
    min: 0,
  },
});

const HaircutAppointmentModel =
  (models.HaircutAppointment as Model<HaircutAppointment>) ||
  model<HaircutAppointment>("HaircutAppointment", HaircutAppointmentSchema);

export default HaircutAppointmentModel;

"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import FormField from "./FormField";
import AppointmentCalendar from "./AppointmentCalendar";
import {
  appointmentTimes,
  initialValues,
  validate,
  type FormValues,
  type FormErrors,
  type FormFieldName,
} from "./appointmentValidation";
import styles from "./book-now.module.css";

type BookingConfirmation = {
  customerName: string;
  customerPhone: string;
  appointmentDate: string;
  appointmentTime: string;
};

export default function BookNowPage() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedAppointment, setSubmittedAppointment] = useState<BookingConfirmation | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as FormFieldName;
    const value = event.target.value;

    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const handleDateChange = (date: string) => {
    setValues((current) => ({
      ...current,
      appointmentDate: date,
      appointmentTime: "",
    }));

    setErrors((current) => ({
      ...current,
      appointmentDate: undefined,
      appointmentTime: undefined,
    }));
  };

  const handleTimeChange = (time: string) => {
    setValues((current) => ({
      ...current,
      appointmentTime: time,
    }));

    setErrors((current) => ({
      ...current,
      appointmentTime: undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setSubmitError(null);

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: values.customerName.trim(),
          customerPhone: values.customerPhone.trim(),
          appointmentDate: values.appointmentDate,
          appointmentTime: values.appointmentTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.message ?? "Could not submit appointment.");
        return;
      }

      setSubmittedAppointment({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
      });
    } catch {
      setSubmitError("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues({ ...initialValues });
    setErrors({});
    setSubmitError(null);
    setSubmittedAppointment(null);
  };

  const errorProps = (field: FormFieldName) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    className: errors[field] ? styles.inputError : undefined,
  });

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.content} aria-labelledby="book-now-heading">
        <p className={styles.eyebrow}>Appointments</p>

        <h1 className={styles.heading} id="book-now-heading">
          Book your next cut.
        </h1>

        <p className={styles.intro}>Enter your name and phone number, then choose a date and time.</p>

        {submittedAppointment ? (
          <div className={styles.confirmation} role="status">
            <h2>Appointment booked!</h2>

            <p>Thanks, {submittedAppointment.customerName}. Your appointment has been booked.</p>

            <div className={styles.details}>
              <span>
                {new Date(submittedAppointment.appointmentDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
                {" at "}
                {submittedAppointment.appointmentTime}
              </span>

              <span>Phone: {submittedAppointment.customerPhone}</span>
            </div>

            <button className={styles.resetButton} type="button" onClick={resetForm}>
              Book another appointment
            </button>
          </div>
        ) : (
          <form className={styles.form} noValidate onSubmit={handleSubmit}>
            <fieldset
              disabled={isSubmitting}
              style={{
                border: 0,
                padding: 0,
                margin: 0,
                minWidth: 0,
              }}
            >
              <legend
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  clipPath: "inset(50%)",
                }}
              >
                Booking details
              </legend>

              <div className={styles.grid}>
                <FormField error={errors.customerName} htmlFor="customerName" label="Name">
                  <input
                    {...errorProps("customerName")}
                    id="customerName"
                    name="customerName"
                    type="text"
                    autoComplete="name"
                    maxLength={30}
                    required
                    value={values.customerName}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField error={errors.customerPhone} htmlFor="customerPhone" label="Phone number">
                  <input
                    {...errorProps("customerPhone")}
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    autoComplete="tel"
                    required
                    placeholder="(555) 123-4567"
                    value={values.customerPhone}
                    onChange={handleChange}
                  />
                </FormField>

                <div className={styles.fullWidth}>
                  <AppointmentCalendar
                    date={values.appointmentDate}
                    time={values.appointmentTime}
                    times={appointmentTimes}
                    dateError={errors.appointmentDate}
                    timeError={errors.appointmentTime}
                    onDateChange={handleDateChange}
                    onTimeChange={handleTimeChange}
                  />
                </div>
              </div>

              <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Booking..." : "Book appointment"}
              </button>
            </fieldset>

            {submitError && <p role="alert">{submitError}</p>}
          </form>
        )}
      </section>
    </main>
  );
}

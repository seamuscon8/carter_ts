export const appointmentTimes = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

export type FormValues = {
  customerName: string;
  customerPhone: string;
  appointmentDate: string;
  appointmentTime: string;
};

export type FormFieldName = keyof FormValues;

export type FormErrors = Partial<Record<FormFieldName, string>>;

export const initialValues: FormValues = {
  customerName: "",
  customerPhone: "",
  appointmentDate: "",
  appointmentTime: "",
};

export function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  (Object.keys(initialValues) as FormFieldName[]).forEach((field) => {
    if (!values[field].trim()) {
      errors[field] = "This field is required.";
    }
  });

  if (values.customerName.trim().length > 30) {
    errors.customerName = "Name cannot exceed 30 characters.";
  }

  const phoneDigits = values.customerPhone.replace(/\D/g, "");

  if (values.customerPhone.trim() && phoneDigits.length !== 10) {
    errors.customerPhone = "Enter a valid 10-digit phone number.";
  }

  if (values.appointmentDate) {
    const date = values.appointmentDate;
    const parsed = new Date(`${date}T00:00:00.000Z`);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date
    ) {
      errors.appointmentDate = "Select a valid date.";
    }
  }

  if (values.appointmentTime && !appointmentTimes.includes(values.appointmentTime)) {
    errors.appointmentTime = "Select a valid time.";
  }

  return errors;
}

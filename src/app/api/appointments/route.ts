import { NextResponse } from "next/server";
import connectDB from "@/database/db";
import HaircutAppointmentModel from "@/schemas/HaircutAppointment";

export async function GET(request: Request) {
  try {
    await connectDB();

    const barberId = new URL(request.url).searchParams.get("barberId");

    if (barberId !== null) {
      const parsedBarberId = Number(barberId);

      if (!Number.isInteger(parsedBarberId) || parsedBarberId < 0) {
        return NextResponse.json({ message: "Invalid barber ID." }, { status: 400 });
      }

      const appointments = await HaircutAppointmentModel.find({ barberId: parsedBarberId });
      return NextResponse.json(appointments, { status: 200 });
    }

    const appointments = await HaircutAppointmentModel.find();

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ message: "Unable to retrieve appointments." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid appointment information." }, { status: 400 });
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      appointmentDate,
      appointmentTime,
      service,
      barberId,
      barberName,
      price,
    } = body;

    // These four fields are always required.
    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof customerPhone !== "string" ||
      customerPhone.replace(/\D/g, "").length !== 10 ||
      typeof appointmentDate !== "string" ||
      !appointmentDate.trim() ||
      typeof appointmentTime !== "string" ||
      !appointmentTime.trim()
    ) {
      return NextResponse.json(
        { message: "A name, valid phone number, date, and time are required." },
        { status: 400 },
      );
    }

    const parsedAppointmentDate = new Date(appointmentDate);

    if (Number.isNaN(parsedAppointmentDate.getTime())) {
      return NextResponse.json({ message: "Invalid appointment date." }, { status: 400 });
    }

    // Optional text fields must be strings if provided.
    if (
      (customerEmail != null && typeof customerEmail !== "string") ||
      (service != null && typeof service !== "string") ||
      (barberName != null && typeof barberName !== "string")
    ) {
      return NextResponse.json({ message: "Email, service, and barber name must be text." }, { status: 400 });
    }

    // An omitted barber ID stays undefined instead of becoming 0.
    const hasBarberId = barberId !== undefined && barberId !== null && barberId !== "";

    let numericBarberId: number | undefined;

    if (hasBarberId) {
      if (
        (typeof barberId !== "number" && typeof barberId !== "string") ||
        (typeof barberId === "string" && !barberId.trim())
      ) {
        return NextResponse.json({ message: "Invalid barber ID." }, { status: 400 });
      }

      numericBarberId = Number(barberId);

      if (!Number.isInteger(numericBarberId) || numericBarberId < 0) {
        return NextResponse.json({ message: "Invalid barber ID." }, { status: 400 });
      }
    }

    // Price is optional, but must be valid when provided.
    if (price != null && (typeof price !== "number" || !Number.isFinite(price) || price < 0)) {
      return NextResponse.json({ message: "Price must be a nonnegative number." }, { status: 400 });
    }

    await connectDB();

    const lastAppointment = await HaircutAppointmentModel.findOne().sort({
      appointmentNumber: -1,
    });

    const nextAppointmentNumber = lastAppointment ? lastAppointment.appointmentNumber + 1 : 1;

    const newAppointment = await HaircutAppointmentModel.create({
      appointmentNumber: nextAppointmentNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.replace(/\D/g, ""),
      appointmentDate: parsedAppointmentDate,
      appointmentTime: appointmentTime.trim(),
      status: "scheduled",

      // Missing or blank optional information is not stored.
      customerEmail: customerEmail?.trim() || undefined,
      service: service?.trim() || undefined,
      barberId: numericBarberId,
      barberName: barberName?.trim() || undefined,
      price: price ?? undefined,
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error(error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
    }

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Failed to create appointment." }, { status: 500 });
  }
}

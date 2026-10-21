"use client";

import { useEffect, useState } from "react";
import styles from "./AppointmentCalendar.module.css";

type Props = {
  date: string;
  time: string;
  times: string[];
  dateError?: string;
  timeError?: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
};

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AppointmentCalendar({
  date,
  time,
  times,
  dateError,
  timeError,
  onDateChange,
  onTimeChange,
}: Props) {
  const [today, setToday] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<Date | null>(null);
  const [timeZone, setTimeZone] = useState("");

  useEffect(() => {
    const now = new Date();

    setToday(new Date(now.getFullYear(), now.getMonth(), now.getDate()));

    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));

    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  if (!today || !visibleMonth) {
    return <p role="status">Loading calendar...</p>;
  }

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = dateKey(today);

  const parsedDate = date ? new Date(`${date}T12:00:00`) : null;
  const selectedDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;

  const canGoBack = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());

  const changeMonth = (offset: number) => {
    setVisibleMonth(new Date(year, month + offset, 1));
  };

  return (
    <div className={styles.picker}>
      <fieldset
        className={styles.panel}
        aria-invalid={Boolean(dateError)}
        aria-describedby={dateError ? "appointmentDate-error" : undefined}
      >
        <legend className={styles.srOnly}>Appointment date</legend>

        <div className={styles.monthNavigation}>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Previous month"
            disabled={!canGoBack}
            onClick={() => changeMonth(-1)}
          >
            ‹
          </button>

          <h2 className={styles.monthHeading} aria-live="polite" aria-atomic="true">
            {visibleMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <button type="button" className={styles.arrow} aria-label="Next month" onClick={() => changeMonth(1)}>
            ›
          </button>
        </div>

        <div className={styles.days}>
          {weekdays.map((weekday) => (
            <abbr key={weekday} title={weekday} className={styles.weekday}>
              {weekday.charAt(0)}
            </abbr>
          ))}

          {Array.from({ length: firstWeekday }, (_, index) => (
            <span key={`blank-${index}`} aria-hidden="true" />
          ))}

          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const currentDate = new Date(year, month, day);
            const key = dateKey(currentDate);
            const isSelected = key === date;
            const isPast = key < todayKey;

            return (
              <button
                key={key}
                type="button"
                className={`${styles.day} ${isSelected ? styles.selectedDay : ""}`}
                disabled={isPast}
                aria-label={currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                aria-pressed={isSelected}
                aria-current={key === todayKey ? "date" : undefined}
                onClick={() => onDateChange(key)}
              >
                {day}
              </button>
            );
          })}
        </div>

        {dateError && (
          <p id="appointmentDate-error" className={styles.error} role="alert">
            {dateError}
          </p>
        )}
      </fieldset>

      <fieldset
        className={styles.panel}
        aria-invalid={Boolean(timeError)}
        aria-describedby={timeError ? "appointmentTime-error" : undefined}
      >
        <legend className={styles.srOnly}>Appointment time</legend>

        <h2 className={styles.dateHeading} aria-live="polite" aria-atomic="true">
          {selectedDate
            ? selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
            : "Select a date"}
        </h2>

        <p className={styles.timeZone}>Time zone: {timeZone}</p>

        {selectedDate ? (
          <div className={styles.times}>
            {times.map((slot) => (
              <button
                key={slot}
                type="button"
                className={`${styles.timeButton} ${time === slot ? styles.selectedTime : ""}`}
                aria-pressed={time === slot}
                onClick={() => onTimeChange(slot)}
              >
                {slot}
              </button>
            ))}

            {times.length === 0 && <p className={styles.hint}>No times available for this date.</p>}
          </div>
        ) : (
          <p className={styles.hint}>Choose a date to select your appointment time.</p>
        )}

        {timeError && (
          <p id="appointmentTime-error" className={styles.error} role="alert">
            {timeError}
          </p>
        )}
      </fieldset>
    </div>
  );
}

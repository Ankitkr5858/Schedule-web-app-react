import React, { useState, useEffect } from "react";
import axios from "axios";

interface Appointment {
  time: string;
  name: string;
}

function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const getCurrentDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate());

  useEffect(() => {
    fetchAppointments();
  }, []);
  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [appointments, selectedDate]);
  const fetchAppointments = async () => {
    try {
      const response = await axios.get<Appointment[]>(
        "http://localhost:3000/api/appointments"
      );
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments", error);
    }
  };

  const fetchAvailableSlots = (date: string) => {
    const existingAppointments = appointments.map((appt) => appt.time);
    const allSlots = Array.from({ length: 24 }, (_, index) => `${index}:00`);
    const available = allSlots.filter(
      (slot) => !existingAppointments.includes(`${date} ${slot}`)
    );
    setAvailableSlots(available);
  };

  const handleAppointmentSubmit = async () => {
    try {
      const response = await axios.post<Appointment>(
        "http://localhost:3000/api/appointments",
        {
          time: `${selectedDate} ${selectedTime}`,
          name: userName,
        }
      );
      setAppointments([...appointments, response.data]);
      setAvailableSlots(availableSlots.filter((slot) => slot !== selectedTime));
      setSelectedTime("");
      setUserName("");
    } catch (error) {
      console.error("Error scheduling appointment", error);
    }
  };

  const handleAppointmentCancel = async (time: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/appointments/${time}`);
      setAppointments(appointments.filter((appt) => appt.time !== time));

      const [date, slot] = time.split(" ");
      console.log(date, slot, selectedDate, date === selectedDate);
      if (date === selectedDate) {
        console.log("HERE", availableSlots);
        setAvailableSlots([...availableSlots, slot]);
      }
    } catch (error) {
      console.error("Error cancelling appointment", error);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchAvailableSlots(newDate);
  };
  return (
    <div className="App shadow-2xl bg-gradient-to-r from-indigo-500  rounded-lg p-5 bg-white min-w-[320px] w-full max-w-[500px] md:min-w-[750px]">
      <div className="font-extrabold text-3xl sm:text-4xl text-center mb-5">
        <span>Scheduling Platform</span>
      </div>
      <div>
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="md:w-1/2">
            <h2 className="text-lg sm:text-xl mb-2">Select Date</h2>
            <input
              type="date"
              className="p-3 focus:none w-full mb-2 sm:mb-0 text-black rounded-lg border border-gray-500 bg-white"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-lg sm:text-xl mb-2">Available Time Slots</h2>
            <select
              className=" px-3 py-3.5 w-full focus:none text-black rounded-lg bg-white border border-gray-500"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="">Select a time</option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <div className=" md:w-1/2">
          <h2 className="text-lg sm:text-xl mb-2">Schedule an Appointment</h2>
          <div className="flex flex-col">
            <label className="mb-4">
              Name:
              <input
                className="w-full rounded-lg p-3 text-black bg-white border border-gray-500"
                type="text"
                placeholder="Enter the name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="md:w-1/2 mb-3">
          <h2 className="text-lg sm:text-xl mb-2">Scheduled Appointments</h2>
          <ul className="max-h-[150px] overflow-auto scheduledAppointmentsList p-1">
            {appointments.length ? appointments.map((appt) => (
              <li key={appt.time}>
                <div className="pl-3 rounded-lg flex justify-between items-center mb-2 bg-gray-300">
                  <span>

                    {appt.time} - {appt.name}
                  </span>
                  <div className="">
                    <button className="bg-gray-400 self-end" onClick={() => handleAppointmentCancel(appt.time)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </li>
            )) : (<div className="text-center">There are no scheduled appointments.</div>)}
          </ul>
        </div>
      </div>
      <button
        className="sm: bg-black text-white w-full"
        onClick={handleAppointmentSubmit}
        disabled={!selectedTime || !userName}
      >
        Schedule
      </button>
    </div>
  );
}

export default App;

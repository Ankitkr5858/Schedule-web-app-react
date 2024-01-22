import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();

const PORT = 3000;

app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  }),
);
interface Appointment {
  time: string;
  name: string;
}

let appointments: Appointment[] = [];

app.get("/api/appointments", (_req: Request, res: Response) => {
  res.json(appointments);
});

app.post("/api/appointments", (req: Request, res: Response) => {
  const { time, name } = req.body as Appointment;

  if (!time || !name) {
    return res
      .status(400)
      .json({ error: "Invalid input. Both time and name are required." });
  }

  if (appointments.some((appt) => appt.time === time)) {
    return res
      .status(400)
      .json({ error: "Appointment already scheduled for this time." });
  }

  const newAppointment: Appointment = { time, name };
  appointments.push(newAppointment);

  res.status(201).json(newAppointment);
});

app.delete("/api/appointments/:time", (req: Request, res: Response) => {
  const { time } = req.params;
  appointments = appointments.filter((appt) => appt.time !== time);
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import { z } from "zod";
const text = z.string().trim().max(2000);
const name = z.string().trim().min(1).max(160);
const email = z.union([z.email(), z.literal("")]).default("");
const date = z
  .union([z.iso.datetime({ local: true }), z.iso.date(), z.literal("")])
  .default("");
const common = { assignee: text.default(""), notes: text.default("") };
export const schemas = {
  leads: z.object({
    ...common,
    name,
    email,
    phone: text.default(""),
    service: name,
    source: z
      .enum([
        "Website",
        "Google",
        "Meta",
        "WhatsApp",
        "Referral",
        "Manual",
        "CSV",
      ])
      .default("Manual"),
    status: z
      .enum([
        "New",
        "Contacted",
        "Interested",
        "Appointment Booked",
        "Quotation Sent",
        "Converted",
        "Lost",
        "Not Responding",
        "Follow-up Required",
      ])
      .default("New"),
    temperature: z.enum(["Hot", "Warm", "Cold"]).default("Warm"),
    followup: date,
    value: z.number().min(0).max(1e9).default(0),
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .default("USD"),
  }),
  customers: z.object({
    ...common,
    name,
    email,
    phone: text.default(""),
    company: text.default(""),
  }),
  appointments: z.object({
    ...common,
    title: name,
    customer: name,
    email,
    date,
    status: z
      .enum([
        "Scheduled",
        "Confirmed",
        "Completed",
        "Cancelled",
        "No-show",
        "Rescheduled",
      ])
      .default("Scheduled"),
  }),
  jobs: z.object({
    ...common,
    title: name,
    customer: name,
    email,
    stage: z
      .enum([
        "Booked",
        "Inspection",
        "In progress",
        "Quality check",
        "Ready",
        "Completed",
      ])
      .default("Booked"),
    due: date,
    updates: z
      .array(z.object({ text: name, date: text, visible: z.boolean() }))
      .max(100)
      .default([]),
  }),
  tasks: z.object({
    ...common,
    title: name,
    due: date,
    priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
    status: z
      .enum(["Pending", "In Progress", "Completed", "Blocked"])
      .default("Pending"),
  }),
  invoices: z
    .object({
      ...common,
      number: name,
      customer: name,
      email,
      amount: z.number().positive().max(1e9),
      paid: z.number().min(0).max(1e9).default(0),
      currency: z
        .string()
        .regex(/^[A-Z]{3}$/)
        .default("USD"),
      due: date,
      status: z.enum(["Pending", "Partial", "Paid"]).default("Pending"),
    })
    .refine((d) => d.paid <= d.amount, {
      message: "Payment cannot exceed the invoice total.",
    }),
  templates: z.object({ title: name, body: text.min(1), ...common }),
};

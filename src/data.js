const day = (offset = 0, time = "") => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const date = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
  return date + (time ? "T" + time : "");
};
export const today = () => day();
export const stages = [
  "Booked",
  "Inspection",
  "In progress",
  "Quality check",
  "Ready",
  "Completed",
];
export const leadStatuses = [
  "New",
  "Contacted",
  "Interested",
  "Appointment Booked",
  "Quotation Sent",
  "Converted",
  "Lost",
  "Not Responding",
  "Follow-up Required",
];
export const currencies = [
  "USD",
  "INR",
  "EUR",
  "GBP",
  "AED",
  "CAD",
  "AUD",
  "SGD",
  "JPY",
  "BRL",
];
export const money = (value, currency = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
export const dateLabel = (value) =>
  value
    ? new Date(
        value.length === 10 ? value + "T12:00" : value,
      ).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "Not scheduled";
export const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
export function seed() {
  const leads = [
    [
      "l1",
      "Olivia Rhye",
      "olivia@example.com",
      "Annual vehicle service",
      "Website",
      "New",
      "Hot",
      0,
      320,
    ],
    [
      "l2",
      "Phoenix Baker",
      "phoenix@example.com",
      "Brake inspection",
      "Google",
      "Follow-up Required",
      "Warm",
      -1,
      180,
    ],
    [
      "l3",
      "Lana Steiner",
      "lana@example.com",
      "Air conditioning repair",
      "Referral",
      "Quotation Sent",
      "Hot",
      0,
      450,
    ],
    [
      "l4",
      "Demi Wilkinson",
      "demi@example.com",
      "Wheel alignment",
      "WhatsApp",
      "Appointment Booked",
      "Warm",
      1,
      120,
    ],
    [
      "l5",
      "Drew Cano",
      "drew@example.com",
      "Engine diagnostics",
      "Meta",
      "Contacted",
      "Warm",
      1,
      250,
    ],
    [
      "l6",
      "Natali Craig",
      "natali@example.com",
      "Full vehicle detailing",
      "Website",
      "Converted",
      "Hot",
      2,
      280,
    ],
    [
      "l7",
      "Orlando Diggs",
      "orlando@example.com",
      "Battery replacement",
      "Google",
      "New",
      "Cold",
      2,
      160,
    ],
    [
      "l8",
      "Andi Lane",
      "andi@example.com",
      "Oil and filter change",
      "Referral",
      "Converted",
      "Warm",
      3,
      95,
    ],
  ].map(
    ([
      id,
      name,
      email,
      service,
      source,
      status,
      temperature,
      offset,
      value,
    ]) => ({
      id,
      kind: "leads",
      data: {
        name,
        email,
        service,
        source,
        status,
        temperature,
        followup: day(offset),
        value,
        currency: "USD",
        phone: "+1 555 010 0000",
        assignee: "Alex Morgan",
        notes: "",
      },
    }),
  );
  return [
    ...leads,
    ...[
      ["a1", "Annual vehicle service", "Olivia Rhye", "09:30"],
      ["a2", "Wheel alignment", "Demi Wilkinson", "11:00"],
      ["a3", "Vehicle collection", "Natali Craig", "14:30"],
    ].map(([id, title, customer, time]) => ({
      id,
      kind: "appointments",
      data: {
        title,
        customer,
        email: "client@example.com",
        date: day(0, time),
        status: "Confirmed",
        assignee: "Alex Morgan",
        notes: "",
      },
    })),
    ...[
      ["j1", "Full vehicle detailing", "Natali Craig", "Quality check"],
      ["j2", "Brake pad replacement", "Phoenix Baker", "In progress"],
      ["j3", "Annual vehicle service", "Olivia Rhye", "Booked"],
    ].map(([id, title, customer, stage]) => ({
      id,
      kind: "jobs",
      data: {
        title,
        customer,
        stage,
        email: "client@example.com",
        due: day(1),
        assignee: "Alex Morgan",
        notes: "Internal: inspect before release.",
        updates: [
          {
            text: "Your service has been booked.",
            date: day(-1),
            visible: true,
          },
          { text: "Parts supplier contacted.", date: day(), visible: false },
          {
            text: "Your vehicle is with our service team.",
            date: day(),
            visible: true,
          },
        ],
      },
    })),
    ...[
      ["t1", "Follow up on the brake inspection", "High", -1],
      ["t2", "Prepare Olivia’s service estimate", "Medium", 0],
      ["t3", "Confirm tomorrow’s appointments", "Low", 1],
    ].map(([id, title, priority, offset]) => ({
      id,
      kind: "tasks",
      data: {
        title,
        priority,
        due: day(offset),
        status: "Pending",
        assignee: "Alex Morgan",
        notes: "",
      },
    })),
    ...[
      ["i1", "INV-1001", "Natali Craig", 280, 280, "Paid"],
      ["i2", "INV-1002", "Phoenix Baker", 450, 100, "Partial"],
      ["i3", "INV-1003", "Olivia Rhye", 320, 0, "Pending"],
    ].map(([id, number, customer, amount, paid, status]) => ({
      id,
      kind: "invoices",
      data: {
        number,
        customer,
        amount,
        paid,
        status,
        currency: "USD",
        due: day(3),
        email: "client@example.com",
        assignee: "Alex Morgan",
        notes: "",
      },
    })),
    ...leads
      .filter((l) => l.data.status === "Converted")
      .map((l, i) => ({
        id: "c" + i,
        kind: "customers",
        data: {
          name: l.data.name,
          email: l.data.email,
          phone: l.data.phone,
          company: "",
          notes: "",
          assignee: "Alex Morgan",
        },
      })),
    {
      id: "m1",
      kind: "templates",
      data: {
        title: "Friendly first follow-up",
        body: "Hi {{name}}, thanks for your interest in {{service}}. When would be a good time to discuss what you need?",
        notes: "",
        assignee: "Alex Morgan",
      },
    },
    {
      id: "m2",
      kind: "templates",
      data: {
        title: "Your service is ready",
        body: "Hi {{name}}, your {{service}} is ready. Please get in touch to arrange collection.",
        notes: "",
        assignee: "Alex Morgan",
      },
    },
  ];
}
export async function api(path, options = {}) {
  const r = await fetch("/api" + path, {
    credentials: "same-origin",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await r.json();
  if (!r.ok) {
    const e = new Error(data.error || "Request failed");
    e.status = r.status;
    throw e;
  }
  return data;
}
export const post = (path, data) =>
  api(path, { method: "POST", body: JSON.stringify(data) });
export function getDemo() {
  try {
    return JSON.parse(localStorage.getItem("relaynest-demo-v1")) || seed();
  } catch {
    return seed();
  }
}
export function saveDemo(records) {
  localStorage.setItem("relaynest-demo-v1", JSON.stringify(records));
}
export const fields = {
  leads: [
    ["name", "text", true],
    ["email", "email"],
    ["phone", "tel"],
    ["service", "text", true],
    [
      "source",
      ["Website", "Google", "Meta", "WhatsApp", "Referral", "Manual", "CSV"],
    ],
    ["status", leadStatuses],
    ["temperature", ["Warm", "Hot", "Cold"]],
    ["followup", "date"],
    ["value", "number"],
    ["currency", currencies],
    ["assignee", "text"],
    ["notes", "textarea"],
  ],
  customers: [
    ["name", "text", true],
    ["email", "email"],
    ["phone", "tel"],
    ["company", "text"],
    ["assignee", "text"],
    ["notes", "textarea"],
  ],
  appointments: [
    ["title", "text", true],
    ["customer", "text", true],
    ["email", "email"],
    ["date", "datetime-local", true],
    [
      "status",
      [
        "Scheduled",
        "Confirmed",
        "Completed",
        "Cancelled",
        "No-show",
        "Rescheduled",
      ],
    ],
    ["assignee", "text"],
    ["notes", "textarea"],
  ],
  jobs: [
    ["title", "text", true],
    ["customer", "text", true],
    ["email", "email"],
    ["stage", stages],
    ["due", "date"],
    ["assignee", "text"],
    ["notes", "textarea"],
  ],
  tasks: [
    ["title", "text", true],
    ["due", "date"],
    ["priority", ["Medium", "High", "Low"]],
    ["status", ["Pending", "In Progress", "Completed", "Blocked"]],
    ["assignee", "text"],
    ["notes", "textarea"],
  ],
  invoices: [
    ["number", "text", true],
    ["customer", "text", true],
    ["email", "email"],
    ["amount", "number", true],
    ["paid", "number"],
    ["currency", currencies],
    ["due", "date"],
    ["assignee", "text"],
    ["notes", "textarea"],
  ],
  templates: [
    ["title", "text", true],
    ["body", "textarea", true],
  ],
};

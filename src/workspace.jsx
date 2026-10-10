import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  Contact,
  CalendarDays,
  Layers3,
  SquareCheckBig,
  Receipt,
  ChartNoAxesCombined,
  Settings,
  FileText,
  Search,
  Plus,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Bell,
  HelpCircle,
  MoreHorizontal,
  Download,
  Upload,
  Sparkles,
  Clock,
  Check,
  Mail,
  LogOut,
  Menu,
  PanelLeftClose,
  ExternalLink,
  Copy,
  Trash2,
  Pencil,
  Printer,
  RotateCcw,
  Filter,
  ChevronDown,
  Send,
  ShieldCheck,
} from "lucide-react";
import Papa from "papaparse";
import { Brand, Language, Badge, Empty, Modal } from "./ui";
import {
  api,
  post,
  seed,
  getDemo,
  saveDemo,
  money,
  dateLabel,
  initials,
  today,
  fields,
  leadStatuses,
  stages,
  currencies,
} from "./data";
import { PlanCards, openCheckout } from "./public";
import { DailyFocus } from "./focus.jsx";

const navigation = [
  ["overview", LayoutDashboard],
  ["leads", Users],
  ["customers", Contact],
  ["appointments", CalendarDays],
  ["jobs", Layers3],
  ["tasks", SquareCheckBig],
  ["invoices", Receipt],
  ["reports", ChartNoAxesCombined],
];
const addLabels = {
  leads: "newLead",
  customers: "newCustomer",
  appointments: "schedule",
  jobs: "newJob",
  tasks: "newTask",
  invoices: "newInvoice",
  templates: "newTemplate",
};
function downloadCSV(records, kind) {
  const rows = records.filter((r) => r.kind === kind).map((r) => r.data);
  const blob = new Blob([Papa.unparse(rows, { escapeFormulae: true })], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relaynest-${kind}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const overdue = (d) => d && d.slice(0, 10) < today();

export default function Workspace({ demo = false }) {
  const { t } = useTranslation(),
    location = useLocation(),
    navigate = useNavigate();
  const base = demo ? "/demo" : "/app";
  const page = location.pathname.split("/")[2] || "overview";
  const [records, setRecords] = useState(() => (demo ? getDemo() : [])),
    [session, setSession] = useState(null),
    [loading, setLoading] = useState(!demo),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All"),
    [editor, setEditor] = useState(null),
    [selected, setSelected] = useState(null),
    [draft, setDraft] = useState(null),
    [toast, setToast] = useState(""),
    [mobile, setMobile] = useState(false),
    [notifications, setNotifications] = useState(false),
    [busy, setBusy] = useState(false),
    [confirmDelete, setConfirmDelete] = useState(null);
  const inputRef = useRef();
  const list = (kind) => records.filter((r) => r.kind === kind);
  const due = list("leads").filter(
    (r) =>
      r.data.followup &&
      r.data.followup <= today() &&
      !["Converted", "Lost"].includes(r.data.status),
  );
  const visible = list(page).filter(
    (r) =>
      JSON.stringify(r.data).toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All" || r.data.status === filter || r.data.stage === filter),
  );
  useEffect(() => {
    document.title = `${t(page)} | Relaynest`;
    setQuery("");
    setFilter("All");
    setMobile(false);
  }, [page, t]);
  useEffect(() => {
    if (!demo) refresh();
  }, [demo]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const s = await api("/session");
      setSession(s);
      if (["active", "trialing"].includes(s.subscription?.status))
        setRecords(await api("/workspace/records"));
    } catch (e) {
      if (e.status === 401) navigate("/login");
      else setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  function persist(next) {
    setRecords(next);
    if (demo) saveDemo(next);
  }
  async function save(kind, data, id) {
    if (demo) {
      const r = { id: id || crypto.randomUUID(), kind, data };
      persist(id ? records.map((x) => (x.id === id ? r : x)) : [r, ...records]);
      return r;
    }
    const r = await api(
      id ? `/workspace/records/${id}` : `/workspace/records/${kind}`,
      { method: id ? "PATCH" : "POST", body: JSON.stringify(data) },
    );
    setRecords((old) =>
      id ? old.map((x) => (x.id === id ? r : x)) : [r, ...old],
    );
    return r;
  }
  async function update(record, changes) {
    try {
      const r = await save(
        record.kind,
        { ...record.data, ...changes },
        record.id,
      );
      if (selected?.id === record.id) setSelected(r);
      setToast("Changes saved.");
    } catch (e) {
      setToast(e.message);
    }
  }
  async function remove(record) {
    setBusy(true);
    try {
      if (!demo)
        await api(`/workspace/records/${record.id}`, { method: "DELETE" });
      persist(records.filter((r) => r.id !== record.id));
      setSelected(null);
      setConfirmDelete(null);
      setToast("Record deleted.");
    } catch (e) {
      setToast(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function prepareDraft(record) {
    setBusy(true);
    try {
      const result = demo
        ? {
            text: `Hi ${record.data.name.split(" ")[0]}, thanks for getting in touch about ${record.data.service.toLowerCase()}. Would you like us to find a convenient time to take a closer look? Happy to answer any questions first.\n\nBest,\nAlex at Northside Auto`,
            source: "template",
          }
        : await post("/workspace/draft", { id: record.id });
      setDraft({ record, ...result });
    } catch (e) {
      setToast(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function importCSV(event) {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1000000) {
      setToast("Please use a CSV smaller than 1 MB.");
      return;
    }
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      if (parsed.errors.length)
        throw new Error("Could not read this CSV. Check its format.");
      if (
        !parsed.meta.fields.includes("name") ||
        !parsed.meta.fields.includes("service")
      )
        throw new Error(
          "CSV needs name and service columns. Optional: email, phone, followup.",
        );
      if (parsed.data.length > 100)
        throw new Error("Import up to 100 leads at a time.");
      const { schemas } = await import("../server/schemas");
      const checked = parsed.data.map((row) =>
        schemas.leads.parse({
          ...row,
          source: "CSV",
          value: Number(row.value) || 0,
        }),
      );
      let count = 0;
      let next = [...records];
      for (const data of checked) {
        if (demo) {
          next.unshift({ id: crypto.randomUUID(), kind: "leads", data });
        } else {
          const saved = await post("/workspace/records/leads", data);
          next.unshift(saved);
          setRecords([...next]);
        }
        count++;
      }
      persist(next);
      setToast(`${count} leads imported.`);
    } catch (e) {
      setToast("Import stopped: " + e.message);
    } finally {
      setBusy(false);
    }
  }
  async function checkout(plan, interval) {
    setBusy(true);
    try {
      await openCheckout(plan, interval, () =>
        setToast(
          "Payment received by checkout. Waiting for server verification.",
        ),
      );
    } catch (e) {
      setToast(e.message);
    } finally {
      setBusy(false);
    }
  }
  const gated =
    !demo &&
    !loading &&
    (!session?.business ||
      !["active", "trialing"].includes(session?.subscription?.status));
  return (
    <div className="app-shell">
      <aside className={"sidebar " + (mobile ? "mobile-open" : "")}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-toggle"
            title="Close navigation"
            onClick={() => setMobile(false)}
          >
            <PanelLeftClose size={19} />
          </button>
        </div>
        <div className="business-switch">
          <span className="business-avatar">
            {initials(
              demo
                ? "Northside Auto"
                : session?.business?.name || "My workspace",
            )}
          </span>
          <div>
            <strong>
              {demo
                ? "Northside Auto"
                : session?.business?.name || "My workspace"}
            </strong>
            <span>{demo ? "Demo business" : "Business workspace"}</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <span className="nav-caption">{t("workspace")}</span>
        <nav>
          {navigation.map(([key, Icon]) => (
            <NavLink
              key={key}
              to={`${base}/${key}`}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon size={18} />
              {t(key)}
              {key === "leads" && list("leads").length > 0 && (
                <span className="nav-count">{list("leads").length}</span>
              )}
              {key === "tasks" &&
                list("tasks").filter((r) => r.data.status !== "Completed")
                  .length > 0 && <span className="task-dot" />}
            </NavLink>
          ))}
        </nav>
        <span className="nav-caption">{t("manage")}</span>
        <nav>
          {[
            ["templates", FileText],
            ["settings", Settings],
          ].map(([key, Icon]) => (
            <NavLink
              key={key}
              to={`${base}/${key}`}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon size={18} />
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link
            className="portal-link"
            to={demo ? "/portal/demo" : `${base}/jobs`}
          >
            <ExternalLink size={16} />
            {t("clientPortal")}
            <ArrowUpRight size={15} />
          </Link>
          <div className="sidebar-demo">
            <Sparkles size={18} />
            <strong>
              {demo ? "A little look around." : "Room for your next chapter."}
            </strong>
            <p>
              {demo
                ? "Your next great client experience starts here."
                : "Keep your clients close and your next steps clear."}
            </p>
            <Link to={demo ? "/login" : "/pricing"}>
              {demo ? "Make it your workspace" : "View plans"}
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="profile-row">
            <span className="avatar profile-avatar">AM</span>
            <div>
              <strong>
                {demo
                  ? "Alex Morgan"
                  : session?.user?.email?.split("@")[0] || "Your account"}
              </strong>
              <span>
                {demo
                  ? "Workspace owner"
                  : session?.business?.role || "Account"}
              </span>
            </div>
            <button
              className="icon-button"
              title={demo ? "Back to website" : "Log out"}
              aria-label={demo ? "Back to website" : "Log out"}
              onClick={async () => {
                if (!demo) await post("/auth/logout", {});
                navigate("/");
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="app-main">
        <header className="app-topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span>{t("workspace")}</span>
            <ChevronRight size={14} />
            <strong>{t(page)}</strong>
          </div>
          <div className="topbar-right">
            <Language />
            <button
              className="icon-button notification-button"
              title="Notifications"
              aria-label="Notifications"
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={19} />
              {due.length > 0 && <i />}
            </button>
            <Link
              className="icon-button"
              to="/#product"
              title="Help"
              aria-label="Help"
            >
              <HelpCircle size={19} />
            </Link>
          </div>
        </header>
        {demo && (
          <div className="demo-bar">
            <span>
              <span className="live-dot" />
              {t("demo")}
              <span className="demo-bar-note">{t("demoNote")}</span>
            </span>
            <Link to="/login">
              Create your workspace
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
        {notifications && (
          <section className="notification-popover">
            <h3>Needs your attention</h3>
            {due.length ? (
              due.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelected(r);
                    setNotifications(false);
                  }}
                >
                  <Clock size={16} />
                  <span>
                    <strong>{r.data.name}</strong>Follow-up{" "}
                    {dateLabel(r.data.followup)}
                  </span>
                </button>
              ))
            ) : (
              <p>You're all caught up.</p>
            )}
          </section>
        )}
        <main className="workspace-content">
          {loading ? (
            <div className="loading">Loading your workspace...</div>
          ) : error ? (
            <div className="error">
              {error}
              <button onClick={refresh}>Retry</button>
            </div>
          ) : gated ? (
            <Onboarding
              session={session}
              refresh={refresh}
              checkout={checkout}
              busy={busy}
            />
          ) : (
            <>
              <div className="workspace-heading">
                <div>
                  <div className="page-kicker">
                    {page === "overview"
                      ? `YOUR ${new Date().toLocaleDateString("en", { weekday: "long" }).toUpperCase()}, CONNECTED`
                      : t("workspace").toUpperCase()}
                  </div>
                  <h1>{page === "overview" ? t("greeting") : t(page)}</h1>
                  <p>
                    {page === "overview"
                      ? t("overviewSub")
                      : {
                          leads: "Every opportunity deserves a next step.",
                          customers: "Good relationships, all in one place.",
                          appointments: "A little structure for the day ahead.",
                          jobs: "Keep every service moving forward.",
                          tasks:
                            "The next small steps that make a big difference.",
                          invoices:
                            "A clear picture of what is paid and what is pending.",
                          reports: "See where your work is taking you.",
                          templates:
                            "Thoughtful words, ready when you need them.",
                          settings: "Make yourself at home.",
                        }[page]}
                  </p>
                </div>
                {(fields[page] || page === "overview") && (
                  <button
                    className="button primary"
                    onClick={() =>
                      setEditor({ kind: page === "overview" ? "leads" : page })
                    }
                  >
                    <Plus size={17} />
                    {t(page === "overview" ? "newLead" : addLabels[page])}
                  </button>
                )}
              </div>
              {page === "overview" ? (
                <>
                  <Stats records={records} />
                  <DailyFocus
                    records={records}
                    base={base}
                    onSelect={setSelected}
                  />
                  <div className="dashboard-columns">
                    <div className="dashboard-primary">
                      <section className="panel">
                        <div className="panel-header">
                          <h2>
                            {t("pipeline")}
                            <span className="count-badge">
                              {list("leads").length}
                            </span>
                          </h2>
                          <Link className="subtle-link" to={`${base}/leads`}>
                            {t("viewAll")}
                            <ArrowUpRight size={14} />
                          </Link>
                        </div>
                        <div className="pipeline-summary">
                          {[
                            ["New", "blue"],
                            ["Contacted", "amber"],
                            ["Quotation Sent", "violet"],
                            ["Converted", "teal"],
                          ].map(([status, color]) => (
                            <div key={status}>
                              <span className={"pipeline-dot " + color} />
                              <span>{status}</span>
                              <strong>
                                {
                                  list("leads").filter(
                                    (r) => r.data.status === status,
                                  ).length
                                }
                              </strong>
                            </div>
                          ))}
                        </div>
                        <LeadTable
                          rows={list("leads").slice(0, 5)}
                          onSelect={setSelected}
                        />
                        <div className="panel-footer">
                          <span>Good conversations start with a hello.</span>
                          <Link to={`${base}/leads`}>
                            All opportunities
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </section>
                      <section className="panel jobs-overview">
                        <div className="panel-header">
                          <h2>Work in motion</h2>
                          <Link className="subtle-link" to={`${base}/jobs`}>
                            View services
                            <ArrowUpRight size={14} />
                          </Link>
                        </div>
                        {list("jobs").length ? (
                          list("jobs")
                            .slice(0, 3)
                            .map((r) => (
                              <button
                                className="job-overview-row"
                                key={r.id}
                                onClick={() => setSelected(r)}
                              >
                                <span className="job-icon">
                                  <Layers3 size={19} />
                                </span>
                                <div>
                                  <strong>{r.data.title}</strong>
                                  <span>{r.data.customer}</span>
                                </div>
                                <div className="mini-progress">
                                  {stages.slice(0, 5).map((s, i) => (
                                    <i
                                      key={s}
                                      className={
                                        i <= stages.indexOf(r.data.stage)
                                          ? "done"
                                          : ""
                                      }
                                    />
                                  ))}
                                </div>
                                <Badge>{r.data.stage}</Badge>
                                <ChevronRight size={15} />
                              </button>
                            ))
                        ) : (
                          <Empty />
                        )}
                      </section>
                    </div>
                    <aside className="dashboard-secondary">
                      <section className="assistant-panel">
                        <div className="assistant-heading">
                          <span>
                            <Sparkles size={18} />
                            {t("assistant")}
                          </span>
                          <span className="ai-label">ASSIST</span>
                        </div>
                        <h2>
                          The next hello
                          <br />
                          could be a yes.
                        </h2>
                        <p>
                          {due.length}{" "}
                          {due.length === 1 ? "lead is" : "leads are"} ready for
                          a thoughtful follow-up.
                        </p>
                        {due.slice(0, 2).map((r) => (
                          <div className="followup-item" key={r.id}>
                            <span className="avatar">
                              {initials(r.data.name)}
                            </span>
                            <div>
                              <strong>{r.data.name}</strong>
                              <span>{r.data.service}</span>
                            </div>
                            <button
                              className="icon-button"
                              aria-label={`Draft for ${r.data.name}`}
                              title="Draft follow-up"
                              disabled={busy}
                              onClick={() => prepareDraft(r)}
                            >
                              <ArrowUpRight size={17} />
                            </button>
                          </div>
                        ))}
                        <button
                          className="button primary"
                          disabled={!due.length || busy}
                          onClick={() => prepareDraft(due[0])}
                        >
                          <Sparkles size={16} />
                          {t("draft")}
                        </button>
                        <span className="assistant-foot">
                          <ShieldCheck size={13} />
                          Always reviewed by you.
                        </span>
                      </section>
                      <section className="panel schedule-panel">
                        <div className="panel-header">
                          <h2>{t("today")}</h2>
                          <span className="muted">{dateLabel(today())}</span>
                        </div>
                        {list("appointments")
                          .filter(
                            (r) =>
                              r.data.date?.startsWith(today()) &&
                              r.data.status !== "Cancelled",
                          )
                          .slice(0, 4)
                          .map((r, i) => (
                            <button
                              className="appointment-mini"
                              key={r.id}
                              onClick={() => setSelected(r)}
                            >
                              <span className={"time-mark mark-" + i}>
                                {r.data.date.slice(11, 16)}
                              </span>
                              <div>
                                <strong>{r.data.customer}</strong>
                                <span>{r.data.title}</span>
                              </div>
                            </button>
                          ))}
                        {!list("appointments").some((r) =>
                          r.data.date?.startsWith(today()),
                        ) && (
                          <p className="muted padding">
                            No appointments today.
                          </p>
                        )}
                        <Link
                          className="schedule-link"
                          to={`${base}/appointments`}
                        >
                          Open calendar
                          <ArrowRight size={14} />
                        </Link>
                      </section>
                    </aside>
                  </div>
                </>
              ) : page === "reports" ? (
                <Reports records={records} />
              ) : page === "settings" ? (
                <SettingsPage
                  demo={demo}
                  session={session}
                  onReset={() => {
                    persist(seed());
                    setToast("Sample workspace restored.");
                  }}
                />
              ) : fields[page] ? (
                <>
                  <div className="record-toolbar">
                    <label className="search-input">
                      <Search size={17} />
                      <input
                        aria-label="Search records"
                        placeholder={t("search")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                    <div className="record-toolbar-actions">
                      {[
                        "leads",
                        "jobs",
                        "tasks",
                        "invoices",
                        "appointments",
                      ].includes(page) && (
                        <label className="filter-select">
                          <Filter size={15} />
                          <select
                            aria-label="Filter status"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                          >
                            <option>All</option>
                            {(page === "leads"
                              ? leadStatuses
                              : page === "jobs"
                                ? stages
                                : page === "tasks"
                                  ? [
                                      "Pending",
                                      "In Progress",
                                      "Completed",
                                      "Blocked",
                                    ]
                                  : page === "invoices"
                                    ? ["Pending", "Partial", "Paid"]
                                    : [
                                        "Scheduled",
                                        "Confirmed",
                                        "Completed",
                                        "Cancelled",
                                        "No-show",
                                        "Rescheduled",
                                      ]
                            ).map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </label>
                      )}
                      {page === "leads" && (
                        <>
                          <input
                            ref={inputRef}
                            type="file"
                            accept=".csv,text/csv"
                            hidden
                            onChange={importCSV}
                          />
                          <button
                            className="button secondary small"
                            disabled={busy}
                            onClick={() => inputRef.current.click()}
                          >
                            <Upload size={15} />
                            {t("import")}
                          </button>
                        </>
                      )}
                      <button
                        className="icon-button bordered"
                        aria-label={t("export")}
                        title={t("export")}
                        onClick={() => downloadCSV(records, page)}
                      >
                        <Download size={17} />
                      </button>
                    </div>
                  </div>
                  {page === "leads" ? (
                    <section className="panel">
                      <LeadTable rows={visible} onSelect={setSelected} full />
                    </section>
                  ) : page === "jobs" ? (
                    <JobBoard
                      rows={visible}
                      select={setSelected}
                      update={update}
                    />
                  ) : page === "appointments" ? (
                    <Appointments rows={visible} select={setSelected} />
                  ) : page === "tasks" ? (
                    <section className="panel task-list">
                      {visible.length ? (
                        visible.map((r) => (
                          <div className="task-row" key={r.id}>
                            <input
                              aria-label={`Complete ${r.data.title}`}
                              type="checkbox"
                              checked={r.data.status === "Completed"}
                              onChange={(e) =>
                                update(r, {
                                  status: e.target.checked
                                    ? "Completed"
                                    : "Pending",
                                })
                              }
                            />
                            <button
                              className={
                                r.data.status === "Completed" ? "task-done" : ""
                              }
                              onClick={() => setSelected(r)}
                            >
                              <strong>{r.data.title}</strong>
                              <span>{r.data.assignee || "Unassigned"}</span>
                            </button>
                            <Badge>{r.data.priority}</Badge>
                            <span
                              className={
                                overdue(r.data.due) &&
                                r.data.status !== "Completed"
                                  ? "overdue"
                                  : "muted"
                              }
                            >
                              {dateLabel(r.data.due)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <Empty />
                      )}
                    </section>
                  ) : page === "templates" ? (
                    <div className="template-grid">
                      {visible.map((r) => (
                        <button
                          className="template-card"
                          key={r.id}
                          onClick={() => setEditor(r)}
                        >
                          <FileText size={24} />
                          <h3>{r.data.title}</h3>
                          <p>{r.data.body}</p>
                          <span>
                            Edit template
                            <ArrowRight size={14} />
                          </span>
                        </button>
                      ))}
                      {!visible.length && <Empty />}
                    </div>
                  ) : (
                    <GenericTable
                      rows={visible}
                      kind={page}
                      select={setSelected}
                    />
                  )}
                </>
              ) : (
                <Empty title="Page not found" />
              )}
            </>
          )}
        </main>
        <div className="workspace-footer">
          <span>
            <span className="live-dot" />
            {demo ? "A safe space to explore" : "Your connected workspace"}
          </span>
          <span>Made for the follow-through.</span>
        </div>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {editor && (
        <RecordEditor
          record={editor}
          onClose={() => setEditor(null)}
          onSave={async (data) => {
            const result = await save(editor.kind, data, editor.id);
            setEditor(null);
            if (selected?.id === result.id) setSelected(result);
            setToast(editor.id ? "Changes saved." : "Record added.");
          }}
        />
      )}
      {selected && (
        <Detail
          record={selected}
          allRecords={records}
          demo={demo}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setEditor(selected);
            setSelected(null);
          }}
          onDelete={() => setConfirmDelete(selected)}
          onDraft={() => prepareDraft(selected)}
          onUpdate={(changes) => update(selected, changes)}
          onToast={setToast}
        />
      )}
      {draft && (
        <Modal title="A thoughtful follow-up" onClose={() => setDraft(null)}>
          <div className="modal-body">
            <div className="draft-recipient">
              <span className="avatar">{initials(draft.record.data.name)}</span>
              <div>
                <strong>{draft.record.data.name}</strong>
                <span>{draft.record.data.email || "No email address"}</span>
              </div>
              <Badge>
                {draft.source === "ai" ? "AI draft" : "Template draft"}
              </Badge>
            </div>
            <label className="field">
              Message
              <textarea
                rows="8"
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
              />
            </label>
            <p className="info-note">
              {demo
                ? "Demo only. No email will be sent."
                : "Check all details before approving. This email will be sent to the lead."}
            </p>
          </div>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => {
                navigator.clipboard
                  .writeText(draft.text)
                  .then(() => setToast("Draft copied."))
                  .catch(() => setToast("Clipboard access is unavailable."));
              }}
            >
              <Copy size={16} />
              Copy
            </button>
            <button
              className="button primary"
              disabled={busy || !draft.text.trim()}
              onClick={async () => {
                if (demo) {
                  setToast("Demo approval recorded. No email was sent.");
                  setDraft(null);
                  return;
                }
                setBusy(true);
                try {
                  await post("/workspace/send", {
                    id: draft.record.id,
                    text: draft.text,
                  });
                  setToast("Follow-up email sent.");
                  setDraft(null);
                } catch (e) {
                  setToast(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Send size={16} />
              {demo ? "Approve demo draft" : t("approve")}
            </button>
          </div>
        </Modal>
      )}
      {confirmDelete && (
        <Modal
          title="Delete this record?"
          onClose={() => setConfirmDelete(null)}
        >
          <div className="modal-body">
            <p>
              This removes{" "}
              {confirmDelete.data.name ||
                confirmDelete.data.title ||
                confirmDelete.data.number}{" "}
              from your workspace. This cannot be undone.
            </p>
          </div>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </button>
            <button
              className="button danger"
              disabled={busy}
              onClick={() => remove(confirmDelete)}
            >
              Delete record
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Stats({ records }) {
  const { t } = useTranslation();
  const leads = records.filter((r) => r.kind === "leads");
  const due = leads.filter(
    (r) =>
      r.data.followup &&
      r.data.followup <= today() &&
      !["Converted", "Lost"].includes(r.data.status),
  );
  const jobs = records.filter(
    (r) => r.kind === "jobs" && r.data.stage !== "Completed",
  );
  const converted = leads.filter((r) => r.data.status === "Converted").length;
  return (
    <div className="stats-grid">
      {[
        [t("totalLeads"), leads.length, "Across all sources", Users, "teal"],
        [
          t("followups"),
          due.length,
          due.some((r) => overdue(r.data.followup))
            ? "A little attention needed"
            : "Keep the conversation going",
          Clock,
          "peach",
        ],
        [
          t("activeJobs"),
          jobs.length,
          "Good work in progress",
          Layers3,
          "blue",
        ],
        [
          t("conversion"),
          `${leads.length ? Math.round((converted / leads.length) * 100) : 0}%`,
          `${converted} inquiries became clients`,
          ChartNoAxesCombined,
          "violet",
        ],
      ].map(([label, value, sub, Icon, color]) => (
        <div className="stat" key={label}>
          <div className="stat-label">
            {label}
            <span className={"stat-icon " + color}>
              <Icon size={17} />
            </span>
          </div>
          <strong>{value}</strong>
          <span className="stat-sub">{sub}</span>
        </div>
      ))}
    </div>
  );
}
function LeadTable({ rows, onSelect, full = false }) {
  const { t } = useTranslation();
  if (!rows.length) return <Empty />;
  return (
    <div className="table-scroll">
      <table className="lead-table">
        <thead>
          <tr>
            <th>{t("name")}</th>
            <th>{t("service")}</th>
            <th>{t("status")}</th>
            {full && <th>{t("source")}</th>}
            <th>{t("followup")}</th>
            <th>
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td>
                <button className="person-button" onClick={() => onSelect(r)}>
                  <span className={"avatar avatar-" + (i % 4)}>
                    {initials(r.data.name)}
                  </span>
                  <span>
                    <strong>{r.data.name}</strong>
                    <small>{r.data.email || "No email added"}</small>
                  </span>
                </button>
              </td>
              <td>
                <span className="service-name">{r.data.service}</span>
                <span className="table-secondary">
                  {full ? r.data.assignee || "Unassigned" : r.data.source}
                </span>
              </td>
              <td>
                <Badge>{r.data.status}</Badge>
              </td>
              {full && <td>{r.data.source}</td>}
              <td>
                <span
                  className={
                    overdue(r.data.followup) &&
                    !["Converted", "Lost"].includes(r.data.status)
                      ? "overdue"
                      : "date-cell"
                  }
                >
                  {r.data.followup === today()
                    ? "Today"
                    : dateLabel(r.data.followup)}
                </span>
              </td>
              <td>
                <button
                  className="icon-button"
                  aria-label={`Open ${r.data.name}`}
                  title="View lead"
                  onClick={() => onSelect(r)}
                >
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function GenericTable({ rows, kind, select }) {
  if (!rows.length) return <Empty />;
  return (
    <section className="panel table-scroll">
      <table>
        <thead>
          <tr>
            <th>{kind === "customers" ? "Customer" : "Invoice"}</th>
            <th>{kind === "customers" ? "Email" : "Customer"}</th>
            <th>{kind === "customers" ? "Phone" : "Total"}</th>
            <th>{kind === "customers" ? "Company" : "Outstanding"}</th>
            <th>{kind === "customers" ? "Assigned to" : "Status"}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <button className="text-button" onClick={() => select(r)}>
                  {r.data.name || r.data.number}
                </button>
              </td>
              <td>
                {kind === "customers"
                  ? r.data.email || "Not provided"
                  : r.data.customer}
              </td>
              <td>
                {kind === "customers"
                  ? r.data.phone || "Not provided"
                  : money(r.data.amount, r.data.currency)}
              </td>
              <td>
                {kind === "customers"
                  ? r.data.company || "Individual"
                  : money(r.data.amount - r.data.paid, r.data.currency)}
              </td>
              <td>
                {kind === "customers" ? (
                  r.data.assignee || "Unassigned"
                ) : (
                  <Badge>{r.data.status}</Badge>
                )}
              </td>
              <td>
                <button
                  className="icon-button"
                  title="View details"
                  aria-label={`View ${r.data.name || r.data.number}`}
                  onClick={() => select(r)}
                >
                  <ChevronRight size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
function JobBoard({ rows, select, update }) {
  return (
    <div className="job-board">
      {stages.map((stage) => (
        <section className="board-column" key={stage}>
          <h2>
            <span className="pipeline-dot teal" />
            {stage}
            <span>{rows.filter((r) => r.data.stage === stage).length}</span>
          </h2>
          {rows
            .filter((r) => r.data.stage === stage)
            .map((r) => (
              <article className="job-card" key={r.id}>
                <button className="job-card-main" onClick={() => select(r)}>
                  <span className="job-reference">
                    SERVICE #{r.id.slice(-4).toUpperCase()}
                  </span>
                  <h3>{r.data.title}</h3>
                  <p>{r.data.customer}</p>
                </button>
                <div className="job-card-bottom">
                  <span>
                    <Clock size={13} />
                    {dateLabel(r.data.due)}
                  </span>
                  <span className="avatar tiny">
                    {initials(r.data.assignee || "NA")}
                  </span>
                </div>
                <select
                  aria-label={`Stage for ${r.data.title}`}
                  value={stage}
                  onChange={(e) => update(r, { stage: e.target.value })}
                >
                  {stages.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </article>
            ))}
          {!rows.some((r) => r.data.stage === stage) && (
            <div className="board-empty">No services</div>
          )}
        </section>
      ))}
    </div>
  );
}
function Appointments({ rows, select }) {
  const [offset, setOffset] = useState(0);
  const start = new Date(today() + "T12:00");
  start.setDate(start.getDate() + offset);
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  });
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>
          {dateLabel(dates[0])} - {dateLabel(dates[6])}
        </h2>
        <div className="inline-actions">
          <button
            className="icon-button"
            title="Previous week"
            aria-label="Previous week"
            onClick={() => setOffset(offset - 7)}
          >
            <ChevronLeft size={18} />
          </button>
          <button className="text-button" onClick={() => setOffset(0)}>
            Today
          </button>
          <button
            className="icon-button"
            title="Next week"
            aria-label="Next week"
            onClick={() => setOffset(offset + 7)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {dates.map((date) => (
          <div className="calendar-day" key={date}>
            <div
              className={
                date === today() ? "calendar-date is-today" : "calendar-date"
              }
            >
              <span>
                {new Date(date + "T12:00").toLocaleDateString(undefined, {
                  weekday: "short",
                })}
              </span>
              <strong>{date.slice(-2)}</strong>
            </div>
            {rows
              .filter((r) => r.data.date?.startsWith(date))
              .sort((a, b) => a.data.date.localeCompare(b.data.date))
              .map((r) => (
                <button
                  className="calendar-event"
                  key={r.id}
                  onClick={() => select(r)}
                >
                  <span>{r.data.date.slice(11, 16)}</span>
                  <strong>{r.data.customer}</strong>
                  <small>{r.data.title}</small>
                  <small>{r.data.status}</small>
                </button>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}
function Reports({ records }) {
  const leads = records.filter((r) => r.kind === "leads"),
    sources = [
      "Website",
      "Google",
      "Meta",
      "WhatsApp",
      "Referral",
      "Manual",
      "CSV",
    ];
  const invoices = records.filter((r) => r.kind === "invoices");
  const totals = Object.groupBy(invoices, (r) => r.data.currency);
  return (
    <>
      <Stats records={records} />
      <div className="report-grid">
        <section className="panel report-panel">
          <h2>Where conversations begin</h2>
          <p className="muted">Lead source distribution</p>
          {sources.map((source) => {
            const count = leads.filter((r) => r.data.source === source).length;
            return (
              <div className="report-bar" key={source}>
                <div>
                  <span>{source}</span>
                  <strong>{count}</strong>
                </div>
                <div className="bar-track">
                  <i
                    style={{
                      width: `${leads.length ? (count / leads.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </section>
        <section className="panel report-panel">
          <h2>From inquiry to outcome</h2>
          <p className="muted">Current status of your leads</p>
          {leadStatuses.map((status) => {
            const count = leads.filter((r) => r.data.status === status).length;
            return (
              <div className="report-status" key={status}>
                <Badge>{status}</Badge>
                <strong>{count}</strong>
              </div>
            );
          })}
        </section>
      </div>
      <section className="panel report-panel">
        <h2>Payments at a glance</h2>
        <p className="muted">Tracked invoices, grouped by original currency.</p>
        {Object.entries(totals).length ? (
          Object.entries(totals).map(([currency, rows]) => (
            <div className="payment-summary" key={currency}>
              <strong>{currency}</strong>
              <span>
                Invoiced{" "}
                <b>
                  {money(
                    rows.reduce((n, r) => n + r.data.amount, 0),
                    currency,
                  )}
                </b>
              </span>
              <span>
                Received{" "}
                <b>
                  {money(
                    rows.reduce((n, r) => n + r.data.paid, 0),
                    currency,
                  )}
                </b>
              </span>
              <span>
                Outstanding{" "}
                <b>
                  {money(
                    rows.reduce((n, r) => n + r.data.amount - r.data.paid, 0),
                    currency,
                  )}
                </b>
              </span>
            </div>
          ))
        ) : (
          <Empty />
        )}
      </section>
    </>
  );
}
function RecordEditor({ record, onClose, onSave }) {
  const { t } = useTranslation();
  const [data, setData] = useState(
    () =>
      record.data ||
      Object.fromEntries(
        fields[record.kind].map(([key, type]) => [
          key,
          Array.isArray(type) ? type[0] : type === "number" ? 0 : "",
        ]),
      ),
  );
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { schemas } = await import("../server/schemas");
      const candidate = { ...data };
      if (record.kind === "invoices")
        candidate.status =
          Number(data.paid) >= Number(data.amount)
            ? "Paid"
            : Number(data.paid) > 0
              ? "Partial"
              : "Pending";
      await onSave(schemas[record.kind].parse(candidate));
    } catch (e) {
      setError(e.issues?.[0]?.message || e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={
        record.id
          ? `Edit ${t(record.kind).toLowerCase()}`
          : t(addLabels[record.kind])
      }
      onClose={onClose}
      wide
    >
      <form onSubmit={submit}>
        <div className="modal-body form-grid">
          {fields[record.kind].map(([key, type, required]) => (
            <label
              key={key}
              className={type === "textarea" ? "field full" : "field"}
            >
              {t(key, {
                defaultValue: key === "stage" ? "Service stage" : key,
              })}
              {required && " *"}
              {Array.isArray(type) ? (
                <select
                  value={data[key] || type[0]}
                  onChange={(e) => setData({ ...data, [key]: e.target.value })}
                >
                  {type.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              ) : type === "textarea" ? (
                <textarea
                  required={required}
                  maxLength="2000"
                  rows="4"
                  value={data[key] || ""}
                  onChange={(e) => setData({ ...data, [key]: e.target.value })}
                />
              ) : (
                <input
                  required={required}
                  type={type}
                  min={type === "number" ? 0 : undefined}
                  step={type === "number" ? "0.01" : undefined}
                  maxLength="160"
                  value={data[key] ?? ""}
                  onChange={(e) =>
                    setData({
                      ...data,
                      [key]:
                        type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              )}
            </label>
          ))}
          {error && (
            <p className="error full" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            {t("cancel")}
          </button>
          <button className="button primary" disabled={busy}>
            <Check size={16} />
            {busy ? "Saving..." : t("save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function Detail({
  record: r,
  allRecords,
  demo,
  onClose,
  onEdit,
  onDelete,
  onDraft,
  onUpdate,
  onToast,
}) {
  const [updateText, setUpdateText] = useState(""),
    [visible, setVisible] = useState(true);
  const d = r.data;
  return (
    <Modal title={d.name || d.title || d.number} onClose={onClose} wide>
      <div className="modal-body">
        <div className="detail-top">
          <Badge>{d.status || d.stage || r.kind}</Badge>
          <div className="inline-actions">
            <button
              className="icon-button bordered"
              title="Edit"
              aria-label="Edit record"
              onClick={onEdit}
            >
              <Pencil size={17} />
            </button>
            <button
              className="icon-button bordered"
              title="Delete"
              aria-label="Delete record"
              onClick={onDelete}
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
        <dl className="detail-grid">
          {Object.entries(d)
            .filter(
              ([key]) =>
                !["notes", "updates", "body", "name", "title"].includes(key),
            )
            .map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>
                  {typeof value === "number" &&
                  ["amount", "paid", "value"].includes(key)
                    ? money(value, d.currency)
                    : String(value) || "Not set"}
                </dd>
              </div>
            ))}
        </dl>
        {d.body && <p className="message-body">{d.body}</p>}
        {d.notes && (
          <div className="internal-note">
            <strong>Internal notes</strong>
            <p>{d.notes}</p>
            <span>Not visible in the client portal.</span>
          </div>
        )}
        {r.kind === "leads" && (
          <button className="button primary" onClick={onDraft}>
            <Sparkles size={17} />
            Prepare a follow-up
          </button>
        )}
        {r.kind === "customers" && (
          <>
            <h3>Related work</h3>
            {allRecords
              .filter(
                (x) =>
                  ["jobs", "invoices", "appointments"].includes(x.kind) &&
                  x.data.customer === d.name,
              )
              .map((x) => (
                <div key={x.id} className="related-row">
                  <span>{x.data.title || x.data.number}</span>
                  <Badge>{x.data.status || x.data.stage}</Badge>
                </div>
              ))}
          </>
        )}
        {r.kind === "jobs" && (
          <>
            <div className="section-row">
              <h3>Service updates</h3>
              <Link
                className="text-button"
                to={demo ? "/portal/demo" : `/portal/${r.id}`}
                target="_blank"
              >
                Client portal
                <ExternalLink size={14} />
              </Link>
            </div>
            <p className="muted">
              Share the portal link with{" "}
              {d.email || "the customer after adding their email"}. They must
              sign in with that email.
            </p>
            <div className="updates-list">
              {d.updates?.map((u, i) => (
                <div key={i}>
                  <span className="timeline-marker" />
                  <div>
                    <p>{u.text}</p>
                    <small>
                      {dateLabel(u.date)} ·{" "}
                      {u.visible ? "Client-visible" : "Internal"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdate({
                  updates: [
                    ...(d.updates || []),
                    { text: updateText, date: today(), visible },
                  ],
                });
                setUpdateText("");
              }}
            >
              <label className="field">
                Add an update
                <input
                  required
                  maxLength="160"
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="What has changed?"
                />
              </label>
              <div className="section-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                  />
                  Approved for the client to see
                </label>
                <button className="button primary small">
                  <Plus size={15} />
                  Add update
                </button>
              </div>
            </form>
          </>
        )}
        {r.kind === "invoices" && (
          <>
            <div className="invoice-total">
              <span>Outstanding</span>
              <strong>{money(d.amount - d.paid, d.currency)}</strong>
            </div>
            <p className="info-note">
              Payment tracking only. Collect service payments through your
              business’s own payment provider, then update the amount paid.
            </p>
            <button className="button secondary" onClick={() => window.print()}>
              <Printer size={16} />
              Print invoice record
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
function SettingsPage({ demo, session, onReset }) {
  const { t } = useTranslation();
  return (
    <div className="settings-sections">
      <section>
        <h2>Workspace</h2>
        <div className="setting-row">
          <span>Business</span>
          <strong>{demo ? "Northside Auto" : session?.business?.name}</strong>
        </div>
        <div className="setting-row">
          <span>Account</span>
          <strong>{demo ? "Demo account" : session?.user?.email}</strong>
        </div>
        <div className="setting-row">
          <span>Subscription</span>
          <Badge>
            {demo ? "Demo" : session?.subscription?.status || "Inactive"}
          </Badge>
        </div>
      </section>
      <section>
        <h2>Preferences</h2>
        <div className="setting-row">
          <span>{t("language")}</span>
          <Language />
        </div>
        <p className="muted">
          Eight initial interface languages. Some detailed content currently
          falls back to English.
        </p>
      </section>
      <section>
        <h2>Connections</h2>
        <div className="setting-row">
          <span>Email follow-ups</span>
          <span>
            {demo ? "Simulated in demo" : "Configured by the platform operator"}
          </span>
        </div>
        <div className="setting-row">
          <span>AI message drafts</span>
          <span>Human approval required</span>
        </div>
        <div className="setting-row">
          <span>WhatsApp, Meta & Google lead sync</span>
          <Badge>Not connected</Badge>
        </div>
        <p className="muted">
          Manual entry and CSV imports are available. Staff invitations and
          automated channel integrations are planned for a later release.
        </p>
      </section>
      <section>
        <h2>Billing & support</h2>
        <p>
          Manage an active subscription through the secure link in your payment
          receipt. For help, contact{" "}
          <a href="mailto:hello@infotecdigital.com">hello@infotecdigital.com</a>
          .
        </p>
      </section>
      {demo && (
        <section>
          <h2>Demo data</h2>
          <p>
            Restore the original sample workspace. Your demo edits will be
            replaced.
          </p>
          <button className="button secondary" onClick={onReset}>
            <RotateCcw size={16} />
            Reset demo workspace
          </button>
        </section>
      )}
    </div>
  );
}
function Onboarding({ session, refresh, checkout, busy }) {
  const [name, setName] = useState(""),
    [error, setError] = useState("");
  if (!session?.business)
    return (
      <section className="onboarding">
        <span className="feature-icon teal">
          <Layers3 />
        </span>
        <h1>Make room for your business.</h1>
        <p>Give your workspace a name to get started.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await post("/business", { name });
              await refresh();
            } catch (e) {
              setError(e.message);
            }
          }}
        >
          <label className="field">
            Business name
            <input
              required
              minLength="2"
              maxLength="100"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="button primary">
            Create workspace
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
    );
  return (
    <section className="subscription-gate">
      <span className="eyebrow">YOUR WORKSPACE IS READY</span>
      <h1>A plan for your next chapter.</h1>
      <p>
        Your workspace opens once your subscription is verified. You can explore
        the <Link to="/demo/overview">demo</Link> while subscriptions are being
        prepared.
      </p>
      <PlanCards onSelect={checkout} />
      <button className="button secondary" disabled={busy} onClick={refresh}>
        <RotateCcw size={16} />
        Check subscription status
      </button>
    </section>
  );
}

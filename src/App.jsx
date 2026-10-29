import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell, BookOpen, CalendarDays, Check, CheckCheck, ChevronRight, CircleHelp,
  Clock3, FileText, Filter, Home, Inbox, Info, LifeBuoy, Menu, MessageCircle,
  Plus, Search, Send, ShieldCheck, Sparkles, Users, X, Megaphone, ClipboardList,
  MessageSquareText, CheckCircle2, CircleAlert, Settings2, ArrowUpRight, UserRound,
} from 'lucide-react';

const DEFAULT_PASSWORD = 'campusvoice123';

const navItems = [
  { id: 'home', label: 'Overview', icon: Home },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'new-feedback', label: 'Student Voice', icon: MessageCircle },
  { id: 'my-feedback', label: 'My Feedback', icon: Inbox },
  { id: 'calendar', label: 'Events & Calendar', icon: CalendarDays },
  { id: 'guidelines', label: 'Communication Guide', icon: BookOpen },
  { id: 'admin', label: 'Response Desk', icon: ShieldCheck },
  { id: 'profile', label: 'Profile', icon: UserRound },
];

const categories = ['All', 'Academic', 'Deadlines', 'Events', 'Facilities', 'Student Life', 'Other'];
const statusOptions = ['Received', 'Under Review', 'Responded', 'Closed'];
const roleOptions = ['student', 'faculty', 'admin'];
const roleDescriptions = {
  student: 'Student view',
  faculty: 'Faculty view',
  admin: 'Admin view',
};

const seedAnnouncements = [
  {
    id: 'a1',
    title: 'DYD Semester I — Communication Skills Workshop',
    category: 'Academic',
    date: '2026-11-05',
    time: '11:00 AM',
    venue: 'Seminar Hall',
    audience: 'DYD Semester I',
    summary: 'A sample notice showing the structured format recommended for official campus messages.',
    action: 'Check the final notice with the department office.',
    postedBy: 'Demo Faculty',
    pinned: true,
    priority: 'High',
    contact: 'Academic desk',
    fullText: 'This example notice demonstrates how CampusVoice organizes the date, venue, audience, and required action in one place for easier reading.',
  },
  {
    id: 'a2',
    title: 'Student project submissions: reminder',
    category: 'Deadlines',
    date: '2026-10-30',
    time: 'By 2:00 PM',
    venue: 'As stated by your teacher',
    audience: 'DYD Semester I',
    summary: 'A reminder for upcoming coursework and submission deadlines.',
    action: 'Confirm the actual deadline with your course teacher.',
    postedBy: 'Demo Coordinator',
    pinned: false,
    priority: 'Medium',
    contact: 'Course mentor',
    fullText: 'Please verify the official due date, submission format, and any required documents with your course teacher before submission.',
  },
  {
    id: 'a3',
    title: 'Campus clubs and student activities',
    category: 'Events',
    date: '2026-11-10',
    time: 'To be confirmed',
    venue: 'College campus',
    audience: 'All students',
    summary: 'Example event listing showing how the campus calendar can highlight opportunities and activities.',
    action: 'Look for an approved announcement before registering.',
    postedBy: 'Demo Student Affairs',
    pinned: false,
    priority: 'Low',
    contact: 'Student affairs office',
    fullText: 'This listing is a demonstration of how student opportunities can be presented in a single, searchable, organized place.',
  },
];

const seedEvents = [
  {
    id: 'e1',
    title: 'Communication Skills Workshop',
    date: '2026-11-05',
    time: '11:00 AM',
    venue: 'Seminar Hall',
    category: 'Workshop',
    note: 'Illustrative event entry. Confirm the final schedule and venue before attending.',
  },
  {
    id: 'e2',
    title: 'Student Project Review',
    date: '2026-11-12',
    time: 'To be confirmed',
    venue: 'Department venue',
    category: 'Academic',
    note: 'Illustrative event entry. Confirm the exact timing with your teacher.',
  },
  {
    id: 'e3',
    title: 'Campus Ideas Forum',
    date: '2026-11-18',
    time: 'To be confirmed',
    venue: 'To be confirmed',
    category: 'Student Life',
    note: 'Example event listing that could appear on the campus opportunities calendar.',
  },
];

const seedFeedback = [
  {
    id: 'CV-1042',
    category: 'Facilities',
    subject: 'More seating near the library',
    description: 'It would be helpful to have a few additional seats near the library entrance during busy hours.',
    suggestion: 'Add a small seating zone with benches and a stronger shade canopy.',
    created: '2026-10-24',
    status: 'Under Review',
    response: 'The suggestion has been forwarded to the relevant team for review.',
    anonymous: false,
    attachment: 'library_map.pdf',
    history: [
      { status: 'Received', timestamp: '2026-10-24T09:32:00', note: 'Submission received' },
      { status: 'Under Review', timestamp: '2026-10-25T11:10:00', note: 'Concern sent to facilities desk' },
    ],
  },
  {
    id: 'CV-1038',
    category: 'Academic',
    subject: 'Central place for class updates',
    description: 'A single place to find verified class notices would make updates easier to track.',
    suggestion: 'Use a single noticeboard with a verification mark for class updates.',
    created: '2026-10-22',
    status: 'Responded',
    response: 'This idea has been recorded for discussion. This is not an official college response.',
    anonymous: true,
    attachment: '',
    history: [
      { status: 'Received', timestamp: '2026-10-22T10:15:00', note: 'Submission received' },
      { status: 'Responded', timestamp: '2026-10-23T08:42:00', note: 'Acknowledge and route to academic review' },
    ],
  },
];

const readStore = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const dateLabel = (date) => {
  if (!date) return 'Date to be confirmed';
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getNextFeedbackId = (items) => {
  const numbers = items
    .map((item) => Number(String(item.id).replace('CV-', '')))
    .filter((num) => !Number.isNaN(num));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1043;
  return `CV-${String(next).padStart(4, '0')}`;
};

const buildHistory = (status, note) => ({
  status,
  timestamp: new Date().toISOString(),
  note,
});

function App() {
  const [page, setPage] = useState('home');
  const [announcements, setAnnouncements] = useState(() => readStore('campusvoice-announcements', seedAnnouncements));
  const [events, setEvents] = useState(() => readStore('campusvoice-events', seedEvents));
  const [feedback, setFeedback] = useState(() => readStore('campusvoice-feedback', seedFeedback));
  const [currentUser, setCurrentUser] = useState(() => readStore('campusvoice-user', {
    name: 'Bakir Dawood',
    role: 'student',
    rollNo: '',
    course: 'DYD',
    semester: 'Semester I',
  }));
  const [isAuthenticated, setIsAuthenticated] = useState(() => readStore('campusvoice-auth', false));
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [feedbackQuery, setFeedbackQuery] = useState('');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('All');
  const [adminStatusFilter, setAdminStatusFilter] = useState('All');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('All');
  const [toast, setToast] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    category: 'Academic',
    date: '',
    time: '',
    venue: '',
    audience: 'All students',
    summary: '',
    action: '',
    contact: '',
    priority: 'Medium',
  });
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    category: 'Academic',
    note: '',
  });
  const [form, setForm] = useState({
    category: 'Academic',
    subject: '',
    description: '',
    suggestion: '',
    anonymous: false,
    attachment: '',
  });
  const [loginForm, setLoginForm] = useState({
    name: 'Bakir Dawood',
    role: 'student',
    rollNo: '',
    course: 'DYD',
    semester: 'Semester I',
    facultyId: '',
    position: '',
    workingName: '',
    password: DEFAULT_PASSWORD,
  });
  const [adminResponseInput, setAdminResponseInput] = useState('');
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(seedFeedback[0]?.id || '');

  useEffect(() => {
    localStorage.setItem('campusvoice-announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('campusvoice-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('campusvoice-feedback', JSON.stringify(feedback));
  }, [feedback]);

  useEffect(() => {
    localStorage.setItem('campusvoice-user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('campusvoice-auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (!showAccountMenu) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [showAccountMenu]);

  const canManageCampus = currentUser.role !== 'student';
  const rolePageAccess = {
    student: ['home', 'announcements', 'new-feedback', 'my-feedback', 'calendar', 'guidelines', 'profile'],
    faculty: ['home', 'announcements', 'calendar', 'guidelines', 'admin', 'profile'],
    admin: ['home', 'announcements', 'calendar', 'guidelines', 'admin', 'profile'],
  };
  const visibleNavItems = navItems.filter((item) => rolePageAccess[currentUser.role]?.includes(item.id));

  const openPage = (id) => {
    const allowedPages = rolePageAccess[currentUser.role] || rolePageAccess.student;
    if (!allowedPages.includes(id)) {
      setPage('home');
      return;
    }
    setPage(id);
    setMenuOpen(false);
    setSelectedNotice(null);
    setQuery('');
  };

  useEffect(() => {
    if (currentUser.role === 'student' && page === 'admin') {
      setPage('home');
    }
  }, [currentUser.role, page]);

  const filteredAnnouncements = useMemo(() => {
    const searchTerm = query.toLowerCase();
    return announcements.filter((item) => {
      const matchesQuery = !searchTerm || [item.title, item.summary, item.category, item.audience, item.action].join(' ').toLowerCase().includes(searchTerm);
      const matchesCategory = category === 'All' || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [announcements, query, category]);

  const totalOpen = feedback.filter((item) => item.status !== 'Closed').length;
  const responseCount = feedback.filter((item) => item.status === 'Responded' || item.status === 'Closed').length;
  const upcomingEvents = [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  const visibleFeedback = useMemo(() => {
    return feedback.filter((item) => {
      const matchesStatus = feedbackStatusFilter === 'All' || item.status === feedbackStatusFilter;
      const matchesQuery = !feedbackQuery || [item.id, item.subject, item.category].join(' ').toLowerCase().includes(feedbackQuery.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [feedback, feedbackQuery, feedbackStatusFilter]);

  const adminQueue = useMemo(() => {
    return feedback.filter((item) => {
      const matchesStatus = adminStatusFilter === 'All' || item.status === adminStatusFilter;
      const matchesCategory = adminCategoryFilter === 'All' || item.category === adminCategoryFilter;
      return matchesStatus && matchesCategory;
    });
  }, [feedback, adminStatusFilter, adminCategoryFilter]);

  useEffect(() => {
    if (!adminQueue.some((item) => item.id === selectedFeedbackId) && adminQueue[0]) {
      setSelectedFeedbackId(adminQueue[0].id);
    }
  }, [adminQueue, selectedFeedbackId]);

  const selectedFeedback = feedback.find((item) => item.id === selectedFeedbackId) || adminQueue[0] || null;

  const submitFeedback = (event) => {
    event.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setToast('Please add a subject and describe your concern.');
      return;
    }

    const nextId = getNextFeedbackId(feedback);
    const createdDate = new Date().toISOString().slice(0, 10);
    const entry = {
      id: nextId,
      category: form.category,
      subject: form.subject.trim(),
      description: form.description.trim(),
      suggestion: form.suggestion.trim(),
      created: createdDate,
      status: 'Received',
      response: '',
      anonymous: form.anonymous,
      attachment: form.attachment || '',
      history: [buildHistory('Received', 'Submission received and queued for review.')],
    };

    setFeedback((prev) => [entry, ...prev]);
    setForm({ category: 'Academic', subject: '', description: '', suggestion: '', anonymous: false, attachment: '' });
    setToast(`Feedback submitted. Your reference number is ${nextId}.`);
    setPage('my-feedback');
    setSelectedFeedbackId(nextId);
  };

  const updateFeedbackState = (id, status, responseText = '') => {
    setFeedback((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const nextResponse = responseText.trim() || item.response || 'The case has been reviewed and the next step is now clear.';
      const nextHistory = [...(item.history || []), buildHistory(status, responseText.trim() || `Status changed to ${status}.`)];
      return { ...item, status, response: nextResponse, history: nextHistory };
    }));
  };

  const saveNotice = (event) => {
    event.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.summary.trim()) {
      setToast('Please add a title and summary before saving this notice.');
      return;
    }

    const newNotice = {
      ...noticeForm,
      id: `a${Date.now()}`,
      postedBy: currentUser.name || 'Demo Administrator',
      pinned: false,
      fullText: noticeForm.summary,
    };

    setAnnouncements((prev) => [newNotice, ...prev]);
    setNoticeForm({
      title: '',
      category: 'Academic',
      date: '',
      time: '',
      venue: '',
      audience: 'All students',
      summary: '',
      action: '',
      contact: '',
      priority: 'Medium',
    });
    setShowCompose(false);
    setToast('Sample announcement added to the demo feed.');
  };

  const saveEvent = (event) => {
    event.preventDefault();
    if (!eventForm.title.trim() || !eventForm.date) {
      setToast('Please add an event title and date.');
      return;
    }

    const entry = { ...eventForm, id: `e${Date.now()}` };
    setEvents((prev) => [...prev, entry].sort((a, b) => a.date.localeCompare(b.date)));
    setEventForm({ title: '', date: '', time: '', venue: '', category: 'Academic', note: '' });
    setShowEventForm(false);
    setToast('Sample event added to the calendar.');
  };

  const handleLogin = () => {
    if (!loginForm.password || loginForm.password !== DEFAULT_PASSWORD) {
      setToast(`Use the default password: ${DEFAULT_PASSWORD}`);
      return;
    }

    setCurrentUser({
      name: loginForm.name || 'Campus member',
      role: loginForm.role || 'student',
      rollNo: loginForm.rollNo,
      course: loginForm.course,
      semester: loginForm.semester,
      facultyId: loginForm.facultyId,
      position: loginForm.position,
      workingName: loginForm.workingName,
    });
    setIsAuthenticated(true);
    setPage('home');
    setToast(`Signed in as ${loginForm.role}.`);
  };

  const switchAccount = () => {
    setLoginForm({
      name: currentUser.name || '',
      role: currentUser.role || 'student',
      rollNo: currentUser.rollNo || '',
      course: currentUser.course || '',
      semester: currentUser.semester || '',
      facultyId: currentUser.facultyId || '',
      position: currentUser.position || '',
      workingName: currentUser.workingName || '',
      password: DEFAULT_PASSWORD,
    });
    setShowAccountMenu(false);
    setShowNotifications(false);
    setIsAuthenticated(false);
    setPage('home');
  };

  const statusSummary = [
    { label: 'Received', count: feedback.filter((item) => item.status === 'Received').length },
    { label: 'Under Review', count: feedback.filter((item) => item.status === 'Under Review').length },
    { label: 'Responded', count: feedback.filter((item) => item.status === 'Responded').length },
    { label: 'Closed', count: feedback.filter((item) => item.status === 'Closed').length },
  ];

  const notifications = [
    { title: 'New workshop notice', text: 'DYD Communication Skills Workshop was posted today.', time: '2m ago' },
    { title: 'Feedback update', text: 'Your submission CV-1042 is now under review.', time: '1h ago' },
    { title: 'Student forum', text: 'Campus Ideas Forum was added to the calendar.', time: 'Today' },
  ];

  const pageMeta = {
    home: ['YOUR CAMPUS, IN ONE PLACE', 'Good communication starts with clarity.', 'A calmer, clearer way to stay informed, share a concern and see what happens next.'],
    announcements: ['THE NOTICEBOARD, REIMAGINED', 'Announcements', 'Find important updates in one searchable, organized feed.'],
    'new-feedback': ['STUDENT VOICE', 'Your voice belongs here.', 'Share a suggestion or concern clearly and respectfully. Every submission receives a reference number.'],
    'my-feedback': ['CLOSE THE LOOP', 'My Feedback', 'Follow the status of your submissions and read responses in one place.'],
    calendar: ['PLAN AHEAD', 'Events & opportunities', 'A single calendar for workshops, deadlines and campus activities. Demo entries must be verified before use.'],
    guidelines: ['BETTER COMMUNICATION, TOGETHER', 'The CampusVoice communication guide', 'Simple principles for clear notices, thoughtful feedback and respectful responses.'],
    admin: ['AUTHORIZED RESPONSE WORKSPACE', 'Response Desk', 'A demonstration view for reviewing submissions and closing the communication loop.'],
    profile: ['YOUR CAMPUSVOICE ACCOUNT', 'Profile', 'View your account details and role-specific campus information.'],
  };
  const meta = pageMeta[page] || pageMeta.home;

  const renderProfile = () => {
    const profileFields = currentUser.role === 'student'
      ? [
        ['Roll number', currentUser.rollNo],
        ['Course', currentUser.course],
        ['Semester', currentUser.semester],
      ]
      : currentUser.role === 'faculty'
        ? [
          ['Faculty ID number', currentUser.facultyId],
          ['Position', currentUser.position],
        ]
        : [
          ['Admin name', currentUser.name],
          ['Working name', currentUser.workingName],
        ];

    return (
      <section className="panel cv-profile-panel">
        <div className="cv-profile-heading">
          <div className="cv-profile-avatar">{(currentUser.name || 'CM').slice(0, 2).toUpperCase()}</div>
          <div>
            <span className="eyebrow">{roleDescriptions[currentUser.role] || 'Campus member'}</span>
            <h2>{currentUser.name || 'Campus member'}</h2>
            <p>{currentUser.role} account · Demo profile</p>
          </div>
        </div>
        <div className="cv-profile-fields">
          {profileFields.map(([label, value]) => (
            <div className="cv-profile-field" key={label}>
              <span>{label}</span>
              <strong>{value?.trim() || 'Not provided'}</strong>
            </div>
          ))}
        </div>
        <p className="cv-profile-note">Profile information is saved in this browser for this demo.</p>
      </section>
    );
  };

  const renderLogin = () => (
    <div className="auth-screen">
      <div className="auth-card panel">
        <div className="auth-logo">
          <img className="brand-logo auth-brand-logo" src={`${import.meta.env.BASE_URL}campusvoice-logo.png`} alt="CampusVoice — Every Voice Matters" />
          <div>
            <strong>CampusVoice</strong>
            <span>Every Voice Matters</span>
          </div>
        </div>
        <h1>Welcome to CampusVoice</h1>
        <p>Sign in to review announcements, submit feedback, and follow every message through the Campus Communication Loop.</p>

        <label>
          {loginForm.role === 'student' ? 'Student name' : loginForm.role === 'faculty' ? 'Faculty member name' : 'Admin name'}
          <input value={loginForm.name} onChange={(e) => setLoginForm((prev) => ({ ...prev, name: e.target.value }))} />
        </label>

        <label>
          Role
          <select value={loginForm.role} onChange={(e) => setLoginForm((prev) => ({ ...prev, role: e.target.value }))}>
            {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </label>

        {loginForm.role === 'student' && (
          <>
            <label>
              Roll number
              <input value={loginForm.rollNo} onChange={(e) => setLoginForm((prev) => ({ ...prev, rollNo: e.target.value }))} placeholder="Enter your roll number" />
            </label>
            <label>
              Course
              <input value={loginForm.course} onChange={(e) => setLoginForm((prev) => ({ ...prev, course: e.target.value }))} placeholder="e.g. BSc IT" />
            </label>
            <label>
              Semester
              <input value={loginForm.semester} onChange={(e) => setLoginForm((prev) => ({ ...prev, semester: e.target.value }))} placeholder="e.g. Semester I" />
            </label>
          </>
        )}

        {loginForm.role === 'faculty' && (
          <>
            <label>
              Faculty ID number
              <input value={loginForm.facultyId} onChange={(e) => setLoginForm((prev) => ({ ...prev, facultyId: e.target.value }))} placeholder="Enter your faculty ID" />
            </label>
            <label>
              Position
              <input value={loginForm.position} onChange={(e) => setLoginForm((prev) => ({ ...prev, position: e.target.value }))} placeholder="e.g. Lecturer" />
            </label>
          </>
        )}

        {loginForm.role === 'admin' && (
          <label>
            Working name
            <input value={loginForm.workingName} onChange={(e) => setLoginForm((prev) => ({ ...prev, workingName: e.target.value }))} placeholder="Enter working name" />
          </label>
        )}

        <label>
          Password
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder={DEFAULT_PASSWORD}
          />
        </label>

        <div className="auth-note">
          <Info size={16} />
          <span>Default password: <strong>{DEFAULT_PASSWORD}</strong>. Different role views are enabled for student, faculty, and admin sign-ins.</span>
        </div>

        <button className="button primary auth-btn" onClick={handleLogin}>Enter CampusVoice</button>
      </div>
    </div>
  );

  const renderHome = () => {
    const latest = announcements.slice(0, 3);
    const nextEventsCards = upcomingEvents;
    const roleGreeting = currentUser.role === 'student'
      ? 'Student overview'
      : currentUser.role === 'faculty'
        ? 'Faculty overview'
        : 'Admin overview';

    return (
      <>
        <section className="cv-home-hero">
          <div className="cv-home-copy">
            <span className="eyebrow light">{roleGreeting.toUpperCase()}</span>
            <h2>{currentUser.role === 'student' ? 'Good communication' : 'Campus communication dashboard'}<br /><em>{currentUser.role === 'student' ? 'changes everything.' : 'keeps everyone aligned.'}</em></h2>
            <p>{currentUser.role === 'student'
              ? 'Find the updates that matter, share what could be better, and follow every concern through to a visible response.'
              : 'Review notices, manage submissions, and keep communication visible across departments and student-facing updates.'}</p>
            <div className="hero-actions">
              <button className="button light-button" onClick={() => openPage('announcements')}>Explore announcements <ChevronRight size={16} /></button>
              {currentUser.role === 'student' && <button className="text-button light-text" onClick={() => openPage('new-feedback')}>Share your voice <ArrowUpRight size={15} /></button>}
              {currentUser.role !== 'student' && <button className="text-button light-text" onClick={() => openPage('admin')}>Review queue <ArrowUpRight size={15} /></button>}
            </div>
          </div>
          <div className="cv-hero-art">
            <div className="cv-orbit orbit-one" />
            <div className="cv-orbit orbit-two" />
            <div className="cv-art-card card-one"><Megaphone size={22} /><span>Campus updates</span></div>
            <div className="cv-art-card card-two"><MessageCircle size={22} /><span>Your voice</span></div>
            <div className="cv-art-card card-three"><CheckCheck size={22} /><span>Closed loop</span></div>
            <div className="cv-art-center"><MessageSquareText size={43} /></div>
            <span className="cv-art-spark spark-a">✳</span>
            <span className="cv-art-spark spark-b">✦</span>
          </div>
        </section>

        <div className="cv-stats-strip">
          <MiniStat icon={Megaphone} label="Campus notices" value={announcements.length} hint="In this demo feed" />
          <MiniStat icon={Inbox} label="Feedback to follow" value={totalOpen} hint="Not yet closed" />
          <MiniStat icon={CheckCheck} label="Responded / closed" value={responseCount} hint="Sample statuses included" />
          <MiniStat icon={CalendarDays} label="Upcoming entries" value={events.length} hint="Verify before relying" />
        </div>

        {currentUser.role === 'student' ? (
          <>
            <div className="cv-home-grid">
              <section className="panel cv-home-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">STAY IN THE LOOP</span>
                    <h2>Latest announcements</h2>
                  </div>
                  <button className="text-button" onClick={() => openPage('announcements')}>View all <ChevronRight size={15} /></button>
                </div>
                <div className="cv-mini-notices">
                  {latest.map((notice) => (
                    <button className="cv-mini-notice" key={notice.id} onClick={() => setSelectedNotice(notice)}>
                      <span className={`cv-notice-icon ${notice.category === 'Deadlines' ? 'gold' : notice.category === 'Events' ? 'blue' : ''}`}><Megaphone size={17} /></span>
                      <span className="cv-mini-copy"><strong>{notice.title}</strong><small>{notice.category} · {dateLabel(notice.date)}</small></span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel cv-home-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">DON’T LET IT DISAPPEAR</span>
                    <h2>Close the loop</h2>
                  </div>
                  <div className="cv-round-icon"><MessageCircle size={19} /></div>
                </div>
                <p className="cv-section-intro">A good communication system does more than receive a message. It tells you what happens next.</p>
                <LoopSteps />
                <button className="button primary cv-wide-button" onClick={() => openPage('new-feedback')}>Submit a suggestion <Plus size={16} /></button>
              </section>
            </div>

            <div className="cv-home-grid lower">
              <section className="panel cv-home-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">YOUR SUBMISSIONS</span>
                    <h2>Feedback at a glance</h2>
                  </div>
                  <button className="text-button" onClick={() => openPage('my-feedback')}>Track status <ChevronRight size={15} /></button>
                </div>
                {feedback.slice(0, 2).map((item) => (
                  <div className="cv-feedback-compact" key={item.id}>
                    <div><span className="cv-ref">{item.id}</span><strong>{item.subject}</strong></div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
                {feedback.length === 0 && <p className="cv-empty-inline">No feedback yet. Your first submission can start a conversation.</p>}
              </section>

              <section className="panel cv-home-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">MARK YOUR CALENDAR</span>
                    <h2>Coming up</h2>
                  </div>
                  <button className="text-button" onClick={() => openPage('calendar')}>View calendar <ChevronRight size={15} /></button>
                </div>
                {nextEventsCards.map((event) => (
                  <div className="cv-event-compact" key={event.id}>
                    <div className="cv-date-block small">
                      <strong>{new Date(`${event.date}T12:00:00`).toLocaleDateString('en-IN', { day: '2-digit' })}</strong>
                      <span>{new Date(`${event.date}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</span>
                    </div>
                    <div>
                      <strong>{event.title}</strong>
                      <small>{event.time || 'Time to be confirmed'} · {event.venue || 'Venue to be confirmed'}</small>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          </>
        ) : (
          <div className="cv-home-grid">
            <section className="panel cv-home-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">RESPONSE WORKSPACE</span>
                  <h2>Review queue</h2>
                </div>
                <button className="text-button" onClick={() => openPage('admin')}>Open desk <ChevronRight size={15} /></button>
              </div>
              {statusSummary.map((item) => (
                <div className="cv-feedback-compact" key={item.label}>
                  <div><span className="cv-ref">{item.label}</span><strong>{item.count} submissions</strong></div>
                  <StatusBadge status={item.label} />
                </div>
              ))}
            </section>

            <section className="panel cv-home-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">ONGOING COMMUNICATION</span>
                  <h2>Priority checks</h2>
                </div>
                <div className="cv-round-icon"><ShieldCheck size={19} /></div>
              </div>
              <p className="cv-section-intro">Keep notices current, verify deadlines, and respond with clear updates so submissions move from received to resolved.</p>
              <LoopSteps />
              <button className="button primary cv-wide-button" onClick={() => openPage('admin')}>Review feedback <Plus size={16} /></button>
            </section>
          </div>
        )}

        <div className="cv-guidelines-banner">
          <div className="cv-round-icon"><BookOpen size={19} /></div>
          <div>
            <strong>Small changes make communication better.</strong>
            <p>Learn how to write a clear notice, give constructive feedback and respond respectfully.</p>
          </div>
          <button className="text-button" onClick={() => openPage('guidelines')}>Read the guide <ChevronRight size={15} /></button>
        </div>
      </>
    );
  };

  const renderAnnouncements = () => (
    <>
      {canManageCampus && showCompose && (
        <form className="panel cv-form-panel" onSubmit={saveNotice}>
          <div className="section-heading">
            <div>
              <h2>Create a sample notice</h2>
              <p>Only for demonstration. This does not publish an official notice.</p>
            </div>
            <button type="button" className="cv-icon-button" onClick={() => setShowCompose(false)}><X size={18} /></button>
          </div>
          <div className="cv-form-grid">
            <label>Notice title<input value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} required /></label>
            <label>Category<select value={noticeForm.category} onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}>{['Academic', 'Deadlines', 'Events', 'Facilities', 'Student Life'].map((option) => <option key={option}>{option}</option>)}</select></label>
            <label>Date<input type="date" value={noticeForm.date} onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })} /></label>
            <label>Time<input value={noticeForm.time} onChange={(e) => setNoticeForm({ ...noticeForm, time: e.target.value })} placeholder="11:00 AM" /></label>
            <label>Venue<input value={noticeForm.venue} onChange={(e) => setNoticeForm({ ...noticeForm, venue: e.target.value })} placeholder="Seminar Hall" /></label>
            <label>Audience<input value={noticeForm.audience} onChange={(e) => setNoticeForm({ ...noticeForm, audience: e.target.value })} /></label>
            <label>Contact<input value={noticeForm.contact} onChange={(e) => setNoticeForm({ ...noticeForm, contact: e.target.value })} placeholder="Department office" /></label>
            <label>Priority<select value={noticeForm.priority} onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}><option>High</option><option>Medium</option><option>Low</option></select></label>
            <label className="cv-full">Summary<textarea value={noticeForm.summary} onChange={(e) => setNoticeForm({ ...noticeForm, summary: e.target.value })} rows="3" required /></label>
            <label className="cv-full">Action required<input value={noticeForm.action} onChange={(e) => setNoticeForm({ ...noticeForm, action: e.target.value })} placeholder="What should the reader do next?" /></label>
          </div>
          <button className="button primary" type="submit"><Plus size={16} /> Save sample notice</button>
        </form>
      )}

      <div className="cv-search-row">
        <div className="cv-search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notices, categories, keywords…" /></div>
        <div className="cv-filter"><Filter size={16} /><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((option) => <option key={option}>{option}</option>)}</select></div>
      </div>

      <div className="cv-notice-list">
        {filteredAnnouncements.map((notice) => (
          <NoticeCard key={notice.id} item={notice} onOpen={() => setSelectedNotice(notice)} />
        ))}
        {filteredAnnouncements.length === 0 && <EmptyState title="No notices found" text="Try another search or choose a different category." />}
      </div>
    </>
  );

  const renderFeedbackForm = () => (
    <div className="cv-two-col">
      <form className="panel cv-form-panel" onSubmit={submitFeedback}>
        <div className="section-heading">
          <div>
            <h2>Share your feedback</h2>
            <p>Give clear, respectful, constructive feedback.</p>
          </div>
        </div>

        <div className="cv-form-grid">
          <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Academic</option><option>Facilities</option><option>Events</option><option>Other</option></select></label>
          <label className="cv-full">Subject<input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Add a short subject" /></label>
          <label className="cv-full">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="5" placeholder="Describe the issue, idea, or opportunity clearly." /></label>
          <label className="cv-full">Suggested solution (optional)<textarea value={form.suggestion} onChange={(e) => setForm({ ...form, suggestion: e.target.value })} rows="3" placeholder="Optional: explain how it could be improved." /></label>
          <label className="cv-check-row"><input type="checkbox" checked={form.anonymous} onChange={(e) => setForm({ ...form, anonymous: e.target.checked })} /> Submit anonymously</label>
          <label className="cv-full">Attachment (optional)<input type="file" onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0]?.name || '' })} /></label>
        </div>

        <div className="cv-guidance-box">
          <CheckCircle2 size={17} />
          <div>
            <strong>Writing tips</strong>
            <ul>
              <li>Be specific about the issue, place, or date.</li>
              <li>Keep the tone respectful and constructive.</li>
              <li>Use a clear action or suggested solution when possible.</li>
            </ul>
          </div>
        </div>

        <button className="button primary" type="submit"><Send size={16} /> Submit feedback</button>
      </form>

      <aside className="panel cv-side-panel">
        <div className="section-heading">
          <div>
            <h2>How tracking works</h2>
            <p>Every message moves through a visible status flow.</p>
          </div>
        </div>
        <div className="cv-loop-steps compact">
          {statusOptions.map((status, index) => (
            <div key={status} className="cv-loop-step">
              <span className="cv-loop-number">{index + 1}</span>
              <div><strong>{status}</strong><small>{index === 0 ? 'Submission received' : index === 1 ? 'Staff review in progress' : index === 2 ? 'Response sent' : 'Final update'}</small></div>
            </div>
          ))}
        </div>
        <div className="cv-inline-info">
          <Info size={16} />
          <span>Anonymous submissions may limit the ability to receive a direct reply in this prototype, but the reference number still tracks the case.</span>
        </div>
      </aside>
    </div>
  );

  const renderMyFeedback = () => (
    <>
      <div className="cv-search-row">
        <div className="cv-search"><Search size={18} /><input value={feedbackQuery} onChange={(e) => setFeedbackQuery(e.target.value)} placeholder="Search by reference or subject" /></div>
        <div className="cv-filter"><Filter size={16} /><select value={feedbackStatusFilter} onChange={(e) => setFeedbackStatusFilter(e.target.value)}>{['All', ...statusOptions].map((status) => <option key={status}>{status}</option>)}</select></div>
      </div>

      <div className="cv-stats-strip small-strip">
        {statusSummary.map((item) => (
          <div className="cv-stat-card compact" key={item.label}>
            <div className="cv-stat-icon"><CircleHelp size={18} /></div>
            <div><span>{item.label}</span><strong>{item.count}</strong></div>
          </div>
        ))}
      </div>

      <div className="cv-feedback-list">
        {visibleFeedback.length ? visibleFeedback.map((item) => <FeedbackCard key={item.id} item={item} />) : <EmptyState title="No submissions match" text="Try another search or choose a different filter." />}
      </div>
    </>
  );

  const renderCalendar = () => (
    <>
      {showEventForm && (
        <form className="panel cv-form-panel" onSubmit={saveEvent}>
          <div className="section-heading">
            <div>
              <h2>Add an event</h2>
              <p>Demo-only calendar entry.</p>
            </div>
            <button type="button" className="cv-icon-button" onClick={() => setShowEventForm(false)}><X size={18} /></button>
          </div>
          <div className="cv-form-grid">
            <label>Event title<input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required /></label>
            <label>Category<select value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}><option>Academic</option><option>Workshop</option><option>Student Life</option><option>Deadline</option></select></label>
            <label>Date<input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} required /></label>
            <label>Time<input value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} placeholder="11:00 AM" /></label>
            <label>Venue<input value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} placeholder="Location" /></label>
            <label className="cv-full">Note<textarea rows="3" value={eventForm.note} onChange={(e) => setEventForm({ ...eventForm, note: e.target.value })} /></label>
          </div>
          <button className="button primary" type="submit"><Plus size={16} /> Save event</button>
        </form>
      )}

      <div className="cv-calendar-grid">
        {events.map((event) => (
          <div className="panel cv-event-card" key={event.id}>
            <div className="cv-date-block">
              <strong>{new Date(`${event.date}T12:00:00`).toLocaleDateString('en-IN', { day: '2-digit' })}</strong>
              <span>{new Date(`${event.date}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</span>
            </div>
            <div>
              <span className="cv-card-kicker">{event.category}</span>
              <h3>{event.title}</h3>
              <p>{event.note || 'Demonstration event entry.'}</p>
              <small>{event.time || 'Time to be confirmed'} · {event.venue || 'Venue to be confirmed'}</small>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderGuidelines = () => (
    <>
      <div className="cv-guideline-hero panel">
        <div>
          <span className="eyebrow">COMMUNICATION EXCELLENCE</span>
          <h2>Better communication, together.</h2>
          <p>These principles support respectful, clear and accountable communication for the whole campus community.</p>
        </div>
      </div>
      <div className="cv-guide-grid">
        <GuideCard number="1" title="Write clearly" text="Use a short title, explain the main point in the first line, and include all necessary details such as time, date and action." icon={FileText} />
        <GuideCard number="2" title="Listen actively" text="Acknowledge every message with a clear response, even if the answer is still being checked." icon={Bell} />
        <GuideCard number="3" title="Be respectful" text="Feedback should be polite, specific and constructive, with a focus on improvement rather than blame." icon={ShieldCheck} />
        <GuideCard number="4" title="Close the loop" text="Always communicate the outcome, the next step, or the reason for a delay so the sender knows what happened." icon={CheckCheck} />
      </div>

      <div className="panel cv-privacy-box">
        <div className="section-heading">
          <div><h2>Privacy and responsible communication</h2></div>
          <ShieldCheck size={18} />
        </div>
        <ul>
          <li>Keep personal data to the minimum required for the task.</li>
          <li>Only authorized responders should view sensitive complaints.</li>
          <li>Use respectful language and avoid public blame or harassment.</li>
          <li>If an anonymous submission limits direct follow-up, explain the limitation clearly.</li>
        </ul>
      </div>
    </>
  );

  const renderAdmin = () => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'faculty') {
      return <EmptyState title="Access restricted" text="This response desk is for authorized faculty or administrator roles." action={() => setPage('home')} actionLabel="Return home" />;
    }

    return (
      <div className="cv-admin-layout">
        <div className="panel cv-admin-list-panel">
          <div className="section-heading">
            <div>
              <h2>Feedback queue</h2>
              <p>Review submissions and move them to the next stage.</p>
            </div>
          </div>
          <div className="cv-admin-filters">
            <select value={adminStatusFilter} onChange={(e) => setAdminStatusFilter(e.target.value)}>{['All', ...statusOptions].map((status) => <option key={status}>{status}</option>)}</select>
            <select value={adminCategoryFilter} onChange={(e) => setAdminCategoryFilter(e.target.value)}>{['All', ...['Academic', 'Facilities', 'Events', 'Other']].map((category) => <option key={category}>{category}</option>)}</select>
          </div>
          <div className="cv-admin-items">
            {adminQueue.length ? adminQueue.map((item) => (
              <button key={item.id} className={`cv-admin-item ${selectedFeedback?.id === item.id ? 'active' : ''}`} onClick={() => setSelectedFeedbackId(item.id)}>
                <div className="cv-item-header">
                  <span className="cv-ref">{item.id}</span>
                  <StatusBadge status={item.status} />
                </div>
                <h3>{item.subject}</h3>
                <small>{item.category} · {dateLabel(item.created)}</small>
              </button>
            )) : <p className="cv-empty-inline">No feedback matches the selected filters.</p>}
          </div>
        </div>

        {selectedFeedback && (
          <div className="panel cv-admin-detail">
            <div className="section-heading">
              <div>
                <h2>{selectedFeedback.subject}</h2>
                <p>{selectedFeedback.id} · {selectedFeedback.category}</p>
              </div>
            </div>

            <div className="cv-detail-stack">
              <div className="cv-detail-box">
                <strong>Submission</strong>
                <p>{selectedFeedback.description}</p>
                {selectedFeedback.suggestion && <p><em>Suggested solution:</em> {selectedFeedback.suggestion}</p>}
              </div>

              <div className="cv-detail-box">
                <strong>Current status</strong>
                <div className="cv-status-wrap">
                  <select value={selectedFeedback.status} onChange={(e) => updateFeedbackState(selectedFeedback.id, e.target.value, adminResponseInput || selectedFeedback.response || 'Status updated by administrator.') }>
                    {statusOptions.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </div>
              </div>

              <div className="cv-detail-box">
                <strong>Response</strong>
                <textarea value={adminResponseInput} onChange={(e) => setAdminResponseInput(e.target.value)} rows="4" placeholder="Write a clear and respectful reply to the sender." />
              </div>

              <div className="cv-detail-box">
                <strong>History</strong>
                {selectedFeedback.history?.slice(-4).map((entry, index) => (
                  <div className="cv-history-item" key={`${entry.status}-${index}`}>
                    <span>{entry.status}</span>
                    <small>{new Date(entry.timestamp).toLocaleString('en-IN')}</small>
                    <p>{entry.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="button primary" onClick={() => {
              if (!adminResponseInput.trim()) {
                setToast('Please add a response before saving the update.');
                return;
              }
              updateFeedbackState(selectedFeedback.id, selectedFeedback.status, adminResponseInput);
              setAdminResponseInput('');
              setToast(`Response saved for ${selectedFeedback.id}.`);
            }}><CheckCheck size={16} /> Save update</button>
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return renderLogin();
  }

  return (
    <div className="app-shell cv-app">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <img className="brand-logo sidebar-brand-logo" src={`${import.meta.env.BASE_URL}campusvoice-logo.png`} alt="CampusVoice logo" />
          <div>
            <strong>CampusVoice</strong>
            <span>EVERY VOICE MATTERS</span>
          </div>
          <button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={19} /></button>
        </div>

        <div className="cv-campus-label">{currentUser.role.toUpperCase()} COMMUNICATION</div>

        <nav>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => openPage(item.id)}>
                <Icon size={18} />
                <span>{item.label}</span>
                {item.id === 'my-feedback' && totalOpen > 0 && <span className="nav-count">{totalOpen}</span>}
                {page === item.id && <span className="nav-dot" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-card"><Sparkles size={16} /><div><strong>Close the loop</strong><p>Communicate → Acknowledge → Respond → Close the Loop.</p></div></div>

        <div className="sidebar-footer">
          <div className="mini-avatar">{(currentUser.name || 'CM').slice(0, 2).toUpperCase()}</div>
          <div>
            <strong>{currentUser.name || 'Campus member'}</strong>
            <span>{roleDescriptions[currentUser.role] || 'Student view'} · Demo</span>
          </div>
          <button className="profile-button" title="View profile" aria-label="View profile" onClick={() => openPage('profile')}><Settings2 size={16} /></button>
        </div>
      </aside>

      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="mobile-brand"><img className="brand-logo mobile-brand-logo" src={`${import.meta.env.BASE_URL}campusvoice-logo.png`} alt="" /><strong>CampusVoice</strong></div>

          <div className="topbar-actions">
            <span className="cv-demo-pill"><span /> DEMO MODE</span>
            <button className="cv-icon-button" title="Notifications are a prototype feature" onClick={() => {
              setShowAccountMenu(false);
              setShowNotifications((prev) => !prev);
            }}><Bell size={18} /><i /></button>
            <div className="account-menu-wrap" ref={accountMenuRef}>
              <button
                className="avatar-button cv-avatar-trigger"
                aria-label="Open profile and account options"
                aria-haspopup="menu"
                aria-expanded={showAccountMenu}
                onClick={() => {
                  setShowNotifications(false);
                  setShowAccountMenu((prev) => !prev);
                }}
              >
                {(currentUser.name || 'CM').slice(0, 2).toUpperCase()}
              </button>
              {showAccountMenu && (
                <div className="account-menu panel" role="menu">
                  <div className="account-menu-heading">
                    <strong>{currentUser.name || 'Campus member'}</strong>
                    <span>{roleDescriptions[currentUser.role] || 'Campus member'}</span>
                  </div>
                  <button role="menuitem" onClick={() => {
                    setShowAccountMenu(false);
                    openPage('profile');
                  }}>View profile</button>
                  <button role="menuitem" onClick={switchAccount}>Switch role / account</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {showNotifications && (
          <div className="notification-panel panel">
            <div className="section-heading">
              <div><h2>Notifications</h2></div>
              <button className="cv-icon-button" onClick={() => setShowNotifications(false)}><X size={18} /></button>
            </div>
            {notifications.map((item) => (
              <div key={item.title} className="notification-item">
                <strong>{item.title}</strong>
                <p>{item.text}</p>
                <small>{item.time}</small>
              </div>
            ))}
          </div>
        )}

        <div className="page-wrap">
          <div className="page-header">
            <div>
              <span className="eyebrow">{meta[0]}</span>
              <h1>{meta[1]}</h1>
              <p>{meta[2]}</p>
            </div>
            {page === 'announcements' && canManageCampus && <button className="button primary" onClick={() => setShowCompose((value) => !value)}><Plus size={16} /> Add sample notice</button>}
            {page === 'calendar' && canManageCampus && <button className="button primary" onClick={() => setShowEventForm((value) => !value)}><Plus size={16} /> Add event</button>}
          </div>

          <div className="cv-prototype-notice">
            <Info size={16} />
            <span><strong>Student project prototype.</strong> CampusVoice is not an official college service. Sample notices, events and responses are illustrative; verify real information with the college.</span>
          </div>

          {page === 'home' && renderHome()}
          {page === 'announcements' && renderAnnouncements()}
          {page === 'new-feedback' && currentUser.role === 'student' && renderFeedbackForm()}
          {page === 'my-feedback' && currentUser.role === 'student' && renderMyFeedback()}
          {page === 'calendar' && renderCalendar()}
          {page === 'guidelines' && renderGuidelines()}
          {page === 'admin' && renderAdmin()}
          {page === 'profile' && renderProfile()}
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function NoticeCard({ item, onOpen }) {
  return (
    <article className="panel cv-notice-card">
      <div className={`cv-notice-icon large ${item.category === 'Deadlines' ? 'gold' : item.category === 'Events' ? 'blue' : ''}`}><Megaphone size={19} /></div>
      <div className="cv-notice-content">
        <div className="cv-card-kicker">
          {item.category}
          {item.pinned && <span className="cv-featured-tag">FEATURED</span>}
          <span className="cv-priority-badge">{item.priority || 'Medium'}</span>
        </div>
        <h2>{item.title}</h2>
        <p>{item.summary}</p>
        <div className="cv-meta-line">
          <span><CalendarDays size={14} />{dateLabel(item.date)}</span>
          <span><Users size={14} />{item.audience || 'All students'}</span>
        </div>
      </div>
      <button className="button cv-outline-button" onClick={onOpen}>Read notice <ChevronRight size={15} /></button>
    </article>
  );
}

function FeedbackCard({ item }) {
  return (
    <article className="panel cv-feedback-card">
      <div className="cv-feedback-top">
        <div>
          <span className="cv-ref">REFERENCE {item.id}</span>
          <h2>{item.subject}</h2>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="cv-feedback-meta">
        <span>{item.category}</span>
        <span>Submitted {dateLabel(item.created)}</span>
        {item.anonymous && <span>Anonymous</span>}
        {item.attachment && <span>Attachment: {item.attachment}</span>}
      </div>
      <p>{item.description}</p>
      {item.suggestion && (
        <div className="cv-suggestion">
          <strong>Your suggested solution</strong>
          <p>{item.suggestion}</p>
        </div>
      )}

      <div className="cv-timeline">
        {['Received', 'Under Review', 'Responded', 'Closed'].map((status, index) => {
          const done = ['Received', 'Under Review', 'Responded', 'Closed'].indexOf(item.status) >= index;
          return (
            <div className={`cv-timeline-step ${done ? 'done' : ''}`} key={status}>
              <span>{done ? <Check size={12} /> : <span className="cv-step-dot" />}</span>
              <small>{status}</small>
            </div>
          );
        })}
      </div>

      {item.response && (
        <div className="cv-response-box">
          <MessageSquareText size={16} />
          <div>
            <strong>Response</strong>
            <p>{item.response}</p>
          </div>
        </div>
      )}
    </article>
  );
}

function StatusBadge({ status }) {
  const cls = status.toLowerCase().replaceAll(' ', '-');
  return <span className={`cv-status ${cls}`}><span />{status}</span>;
}

function MiniStat({ icon: Icon, label, value, hint }) {
  return (
    <div className="cv-stat-card">
      <div className="cv-stat-icon"><Icon size={18} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {hint && <small>{hint}</small>}
      </div>
    </div>
  );
}

function LoopSteps() {
  return (
    <div className="cv-loop-steps">{
      [
        ['1', 'Communicate', 'Share a concern or update'],
        ['2', 'Acknowledge', 'Confirm it was received'],
        ['3', 'Respond', 'Provide an answer or action'],
        ['4', 'Close the loop', 'Explain the outcome'],
      ].map(([number, title, desc]) => (
        <div className="cv-loop-step" key={number}>
          <span className="cv-loop-number">{number}</span>
          <div><strong>{title}</strong><small>{desc}</small></div>
          <ChevronRight size={15} />
        </div>
      ))
    }</div>
  );
}

function GuideCard({ number, title, text, icon: Icon }) {
  return (
    <article className="panel cv-guide-card">
      <div className="cv-guide-card-top">
        <span>{number}</span>
        <div className="cv-round-icon"><Icon size={19} /></div>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function EmptyState({ title, text, action, actionLabel }) {
  return (
    <div className="panel cv-empty-state">
      <div className="cv-round-icon"><Search size={21} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && <button className="button primary" onClick={action}>{actionLabel}</button>}
    </div>
  );
}

export default App;

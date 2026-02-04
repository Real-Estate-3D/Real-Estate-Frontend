import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileText,
  FolderKanban,
  LineChart,
} from 'lucide-react';

export const dashboardTabs = ['Overview', 'Reports', 'Map Insights'];

export const kpiCards = [
  {
    title: 'Projects Under Review',
    value: '7',
    icon: FolderKanban,
    tone: 'amber',
  },
  {
    title: 'Submissions Awaiting Approval',
    value: '22',
    icon: FileText,
    tone: 'orange',
  },
  {
    title: 'New Posts in Municipal Hub',
    value: '31',
    icon: LineChart,
    tone: 'blue',
  },
  {
    title: 'Risk of Delay',
    value: '70%',
    icon: AlertTriangle,
    tone: 'red',
  },
  {
    title: 'Permit Approval Progress',
    value: '85%',
    icon: CheckCircle2,
    tone: 'emerald',
  },
  {
    title: 'Housing Supply Gap',
    value: '120 Units',
    icon: BarChart3,
    tone: 'slate',
  },
];

export const notifications = [
  { title: 'New Submission Awaiting Approval', time: '2 hours ago', tone: 'amber' },
  { title: 'Planning Act Update Effective Next Month', time: '1 day ago', tone: 'orange' },
  { title: 'Council Meeting Rescheduled to May 5', time: '3 days ago', tone: 'blue' },
  { title: 'Planning Act Update Effective Next Month', time: '5 days ago', tone: 'orange' },
  { title: 'New Submission Awaiting Approval', time: '7 days ago', tone: 'amber' },
];

export const complianceAlerts = [
  { title: 'Project X', subtitle: 'Non-compliant with Greenbelt Act' },
  { title: 'Project Y', subtitle: 'Missing environmental assessment' },
  { title: 'Project Y', subtitle: 'Non-compliant with Greenbelt Act' },
  { title: 'Project ANC', subtitle: 'Missing environmental assessment' },
  { title: 'Project XYZ', subtitle: 'Non-compliant with Greenbelt Act' },
];

export const budgetBars = [
  { label: 'Housing', value: 5.3, color: 'from-blue-500 to-blue-700' },
  { label: 'Transport', value: 9.9, color: 'from-blue-400 to-blue-600' },
  { label: 'Public Facilities', value: 8.2, color: 'from-blue-500 to-blue-800' },
  { label: 'Green Spaces', value: 5.1, color: 'from-blue-300 to-blue-600' },
  { label: 'Maintenance', value: 11.7, color: 'from-blue-600 to-blue-900' },
];

export const permitBreakdown = [
  { label: 'Construction', value: 45, color: '#3B82F6' },
  { label: 'Renovation', value: 25, color: '#F59E0B' },
  { label: 'Demolition', value: 10, color: '#10B981' },
  { label: 'Other', value: 20, color: '#F97316' },
];

import { BookOpen, FileText, HelpCircle, Download, TrendingUp, Users } from "lucide-react";
import { materials } from "@/lib/data";
import { motion } from "framer-motion";

const stats = [
  {
    label: "Total Materials",
    value: materials.length.toString(),
    icon: FileText,
    color: "text-primary bg-primary/10",
  },
  {
    label: "Total Downloads",
    value: materials.reduce((a, m) => a + m.downloadCount, 0).toLocaleString(),
    icon: Download,
    color: "text-accent bg-accent/10",
  },
  {
    label: "Courses",
    value: "6",
    icon: BookOpen,
    color: "text-success bg-success/10",
  },
  {
    label: "Active Users",
    value: "2.4K",
    icon: Users,
    color: "text-primary bg-primary/10",
  },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
          className="glass-card rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-md ${stat.color}`}>
              <stat.icon className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="font-heading font-bold text-xl text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

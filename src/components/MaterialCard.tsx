import { FileText, BookOpen, HelpCircle, Download, Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { StudyMaterial } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const typeConfig = {
  notes: { label: 'Notes', icon: FileText, className: 'bg-primary/10 text-primary border-primary/20' },
  syllabus: { label: 'Syllabus', icon: BookOpen, className: 'bg-accent/10 text-accent border-accent/20' },
  'question-paper': { label: 'Question Paper', icon: HelpCircle, className: 'bg-success/10 text-success border-success/20' },
};

interface MaterialCardProps {
  material: StudyMaterial;
  index?: number;
}

export function MaterialCard({ material, index = 0 }: MaterialCardProps) {
  const [bookmarked, setBookmarked] = useState(material.isBookmarked ?? false);
  const config = typeConfig[material.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="glass-card rounded-lg p-4 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`p-2 rounded-lg shrink-0 ${config.className}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-semibold text-sm text-foreground truncate">{material.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {material.subject} • Sem {material.semester}
              {material.uploadedBy && <span> • by {material.uploadedBy}</span>}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-[10px] font-body">{config.label}</Badge>
              <span className="text-[10px] text-muted-foreground">{material.fileSize}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Download className="h-3 w-3" /> {material.downloadCount}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setBookmarked(!bookmarked)}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-accent" />
            ) : (
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (material.fileUrl) {
                window.open(material.fileUrl, "_blank");
              } else {
                import("sonner").then(({ toast }) => toast.error("No file available for download"));
              }
            }}
          >
            <Download className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

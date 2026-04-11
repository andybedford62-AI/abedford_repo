"use client";

import Link from "next/link";
import { ChevronRight, FolderKanban, Settings, Users, BarChart3 } from "lucide-react";

interface ProjectHeaderProps {
  project: {
    id: string;
    name: string;
    color: string;
    status: string;
    description?: string | null;
    dueDate?: Date | null;
  };
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="flex-shrink-0 mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
        <Link href="/projects" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          Projects
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">{project.name}</span>
      </div>

      {/* Project header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: project.color + "20" }}
          >
            <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">{project.name}</h1>
            {project.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-lg">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Users className="w-3.5 h-3.5" />
            Members
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <BarChart3 className="w-3.5 h-3.5" />
            Stats
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}

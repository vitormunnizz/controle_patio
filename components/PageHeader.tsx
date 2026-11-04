import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  rightContent?: ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Voltar",
  className,
  leftContent,
  centerContent,
  rightContent,
}: PageHeaderProps) {
  return (
    <header className={`page-header${className ? ` ${className}` : ""}`}>
      <div className="page-header-main">
        {backHref && (
          <Link href={backHref} aria-label={backLabel} className="page-header-back">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </Link>
        )}
        {leftContent}
        {(title || subtitle) && (
          <div className="page-header-copy">
            {title && <h1 className="page-header-title">{title}</h1>}
            {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
          </div>
        )}
      </div>
      {centerContent && <div className="page-header-center">{centerContent}</div>}
      {rightContent && <div className="page-header-actions">{rightContent}</div>}
    </header>
  );
}

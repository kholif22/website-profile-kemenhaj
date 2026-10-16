import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="accordion-item">
          <button
            className={`accordion-trigger${open === i ? ' open' : ''}`}
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="pr-4 text-left">{item.question}</span>
            {open === i ? <ChevronUp size={18} className="flex-shrink-0" /> : <ChevronDown size={18} className="flex-shrink-0" />}
          </button>
          {open === i && (
            <div className="accordion-content">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function Badge({ children, variant = 'gold', className = '' }) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

export function LoadingSpinner({ size = 'md', text = 'Memuat...' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className={`${sizes[size]} border-[3px] border-t-transparent rounded-full animate-spin`} style={{ borderColor: 'rgba(212,175,55,0.3)', borderTopColor: '#D4AF37', borderWidth: '3px' }} />
      {text && <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{text}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title = 'Tidak ada data', description = '', action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={56} className="empty-state-icon" style={{ color: 'var(--color-gold)', opacity: 0.35 }} />}
      <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
      {description && <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>}
      {action && action}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className={`w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="font-bold text-base" style={{ color: 'var(--color-black)' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Tutup">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onConfirm, onCancel, title = 'Konfirmasi', message, confirmText = 'Ya, Hapus', cancelText = 'Batal', variant = 'danger' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: variant === 'danger' ? '#fef2f2' : '#fffbeb' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={variant === 'danger' ? '#dc2626' : '#d97706'} strokeWidth="2"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
          </div>
          <h4 className="font-bold text-base mb-2" style={{ color: 'var(--color-black)' }}>{title}</h4>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
            {cancelText}
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors" style={{ background: variant === 'danger' ? 'var(--color-error)' : 'var(--color-gold)' }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-2 rounded-lg text-sm disabled:opacity-40 transition-colors hover:bg-gray-100"
      >
        ← Sebelumnya
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'text-black font-bold' : 'hover:bg-gray-100'}`}
          style={p === page ? { background: 'var(--color-gold)' } : {}}
        >
          {p}
        </button>
      ))}
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-2 rounded-lg text-sm disabled:opacity-40 transition-colors hover:bg-gray-100"
      >
        Selanjutnya →
      </button>
    </div>
  );
}

export function SectionHeader({ title, subtitle, center = true }) {
  return (
    <div className={center ? 'text-center mb-10' : 'mb-8'}>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      <div className={`mt-4 flex ${center ? 'justify-center' : ''}`}>
        <div className="h-0.5 w-16 rounded-full" style={{ background: 'var(--color-gold)' }} />
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, breadcrumbs }) {
  return (
    <div className="page-header">
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        {breadcrumbs && (
          <nav className="flex justify-center mb-4 text-xs text-white/60">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                <span className={i === breadcrumbs.length - 1 ? 'text-white/90' : ''}>{b}</span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">{title}</h1>
        {subtitle && <p className="text-sm md:text-base text-white/75 max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </div>
  );
}

export function FormGroup({ label, required, error, children, hint }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="input-label">
          {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{hint}</p>}
      {error && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{error}</p>}
    </div>
  );
}

export function InfoAlert({ type = 'info', children }) {
  const styles = {
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', icon: 'ℹ️' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '⚠️' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', icon: '✅' },
    error: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '🚫' },
  };
  const s = styles[type];
  return (
    <div className="flex gap-3 p-4 rounded-xl text-sm mb-4" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      <span>{s.icon}</span>
      <div>{children}</div>
    </div>
  );
}

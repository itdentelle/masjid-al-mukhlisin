'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  group?: string;
  description?: string | null;
  badge?: {
    text: string;
    variant?: 'emerald' | 'rose' | 'amber' | 'slate' | 'blue';
  };
  icon?: React.ReactNode;
}

export interface CustomDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (DropdownOption | string)[];
  placeholder?: string;
  searchable?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export default function CustomDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Pilih salah satu...',
  searchable = false,
  required = false,
  disabled = false,
  className = '',
  theme = 'light',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options into DropdownOption array
  const normalizedOptions: DropdownOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Selected Option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value);
  }, [normalizedOptions, value]);

  // Filtered Options if searchable
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.badge?.text && opt.badge.text.toLowerCase().includes(q))
    );
  }, [normalizedOptions, searchQuery]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'Enter' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const getBadgeClass = (variant?: 'emerald' | 'rose' | 'amber' | 'slate' | 'blue') => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200/80';
    }
  };

  const showSearch = searchable || normalizedOptions.length > 6;

  return (
    <div className={`relative ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label
          className={`text-[10px] font-black tracking-widest uppercase block mb-1.5 ${
            theme === 'dark' ? 'text-slate-200' : 'text-slate-400'
          }`}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (isOpen) setSearchQuery('');
          }
        }}
        className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border text-xs font-bold transition-all text-left shadow-2xs select-none ${
          disabled
            ? theme === 'dark'
              ? 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : isOpen
            ? theme === 'dark'
              ? 'bg-[#0a231b] border-emerald-400 ring-3 ring-emerald-500/25 text-white shadow-md'
              : 'bg-white border-emerald-500 ring-3 ring-emerald-500/15 text-slate-900 shadow-md'
            : theme === 'dark'
            ? 'bg-white/5 hover:bg-white/10 border-white/15 hover:border-emerald-400 text-white'
            : 'bg-slate-50 hover:bg-white border-slate-200/90 hover:border-emerald-500 text-slate-800'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className={`shrink-0 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {selectedOption.icon}
            </span>
          )}
          <span
            className={`truncate ${
              !selectedOption
                ? theme === 'dark'
                  ? 'text-white/40 font-medium'
                  : 'text-slate-400 font-medium'
                : theme === 'dark'
                ? 'text-white font-bold'
                : 'text-slate-900'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`shrink-0 text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full border ${getBadgeClass(
                selectedOption.badge.variant
              )}`}
            >
              {selectedOption.badge.text}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isOpen
                ? 'rotate-180 text-emerald-400'
                : theme === 'dark'
                ? 'text-slate-400'
                : 'text-slate-400'
            }`}
          />
        </div>
      </button>

      {/* Dropdown Popup Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            theme === 'dark'
              ? 'border-emerald-800/60 bg-[#071e16] shadow-black/40 text-white'
              : 'border-slate-200/90 bg-white shadow-slate-900/15'
          }`}
        >
          {/* Optional Search Input */}
          {showSearch && (
            <div
              className={`p-2.5 border-b ${
                theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50/70'
              }`}
            >
              <div className="relative">
                <Search
                  size={14}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Cari pilihan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-7 py-2 rounded-xl border text-xs font-bold outline-none transition-all placeholder:font-normal ${
                    theme === 'dark'
                      ? 'bg-[#04120e] border-white/15 text-white placeholder:text-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* List of Options */}
          <div
            className={`p-1.5 max-h-56 overflow-y-auto space-y-1 scrollbar-thin ${
              theme === 'dark' ? 'scrollbar-thumb-emerald-900' : 'scrollbar-thumb-slate-200'
            }`}
          >
            {filteredOptions.length === 0 ? (
              <div
                className={`py-6 px-4 text-center text-xs ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                Tidak ada pilihan yang cocok
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const showGroupHeader =
                  opt.group && (index === 0 || filteredOptions[index - 1]?.group !== opt.group);

                return (
                  <React.Fragment key={`${opt.group || ''}_${opt.value}`}>
                    {showGroupHeader && (
                      <div
                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg mt-1 mb-0.5 select-none border ${
                          theme === 'dark'
                            ? 'text-emerald-400/90 bg-white/5 border-white/10'
                            : 'text-slate-400 bg-slate-50/90 border-slate-100/80'
                        }`}
                      >
                        {opt.group}
                      </div>
                    )}
                    <div
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                        isSelected
                          ? theme === 'dark'
                            ? 'bg-emerald-900/60 text-emerald-300 font-extrabold border border-emerald-500/40 shadow-2xs'
                            : 'bg-emerald-50/90 text-emerald-900 font-extrabold border border-emerald-200/60 shadow-2xs'
                          : theme === 'dark'
                          ? 'text-white/90 hover:bg-white/10 hover:text-white font-bold'
                          : 'text-slate-700 hover:bg-emerald-50/40 hover:text-emerald-950 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {opt.icon && (
                          <span
                            className={`shrink-0 ${
                              isSelected
                                ? 'text-emerald-400'
                                : theme === 'dark'
                                ? 'text-slate-400'
                                : 'text-slate-400 group-hover:text-emerald-600'
                            }`}
                          >
                            {opt.icon}
                          </span>
                        )}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="truncate">{opt.label}</span>
                          {opt.badge && (
                            <span
                              className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full border ${getBadgeClass(
                                opt.badge.variant
                              )}`}
                            >
                              {opt.badge.text}
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}


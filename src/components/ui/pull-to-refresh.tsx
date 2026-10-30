'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ArrowDown, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh?: () => Promise<void> | void;
}

export default function PullToRefresh({ onRefresh }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const isEligibleRef = useRef(false);
  const threshold = 70; // px threshold to trigger refresh

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only initiate pull-to-refresh if user is at the very top of the page
      if (window.scrollY <= 2 && !isRefreshing) {
        startYRef.current = e.touches[0].clientY;
        currentYRef.current = e.touches[0].clientY;
        isEligibleRef.current = true;
      } else {
        isEligibleRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isEligibleRef.current || isRefreshing) return;

      currentYRef.current = e.touches[0].clientY;
      const deltaY = currentYRef.current - startYRef.current;

      // Only pull downwards
      if (deltaY > 0 && window.scrollY <= 2) {
        // Elastic damping resistance
        const damped = Math.min(105, deltaY * 0.42);
        setPullDistance(damped);
        setIsPulling(true);

        // Haptic feedback once threshold passed
        if (damped >= threshold && pullDistance < threshold) {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(12);
            } catch {}
          }
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isEligibleRef.current || isRefreshing) {
        setIsPulling(false);
        setPullDistance(0);
        return;
      }

      isEligibleRef.current = false;

      if (pullDistance >= threshold) {
        // Trigger Refresh!
        setIsRefreshing(true);
        setIsPulling(false);
        setPullDistance(threshold);

        // Haptic on release
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(20);
          } catch {}
        }

        try {
          // 1. Dispatch custom event so current page can re-fetch
          window.dispatchEvent(new CustomEvent('masjid_refresh_requested'));

          // 2. Call callback if provided
          if (onRefresh) {
            await onRefresh();
          }

          // Small pause for smooth visual feedback
          await new Promise((resolve) => setTimeout(resolve, 800));

          setShowSuccess(true);
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
          console.warn('Pull-to-refresh failed:', err);
        } finally {
          setShowSuccess(false);
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Did not meet threshold, snap back
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing, pullDistance, onRefresh]);

  if (!isPulling && !isRefreshing && !showSuccess) {
    return null;
  }

  const reached = pullDistance >= threshold;
  const progressPercent = Math.min(100, Math.round((pullDistance / threshold) * 100));

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-200"
      style={{
        top: isRefreshing || showSuccess ? '20px' : `${Math.max(12, pullDistance * 0.8)}px`,
      }}
    >
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0a1f18]/95 text-white border border-emerald-500/40 shadow-2xl backdrop-blur-md text-xs font-bold transition-all">
        {showSuccess ? (
          <>
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span className="text-emerald-200 text-[11px]">Data Terkini Diperbarui</span>
          </>
        ) : isRefreshing ? (
          <>
            <RefreshCw size={14} className="text-emerald-400 animate-spin shrink-0" />
            <span className="text-emerald-100 text-[11px]">Memperbarui data...</span>
          </>
        ) : (
          <>
            <div
              className="p-1 rounded-full bg-emerald-500/20 text-emerald-300 transition-transform duration-200 shrink-0"
              style={{
                transform: `rotate(${reached ? 180 : (progressPercent / 100) * 180}deg)`,
              }}
            >
              <ArrowDown size={14} />
            </div>
            <span
              className={`text-[11px] transition-colors ${
                reached ? 'text-amber-300 font-extrabold' : 'text-slate-300'
              }`}
            >
              {reached ? 'Lepaskan untuk memuat ulang' : 'Tarik ke bawah...'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}


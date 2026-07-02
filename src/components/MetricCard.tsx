/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { MetierStats } from '../types';

interface MetricCardProps {
  stats: MetierStats;
  onSelect: () => void;
  isSelected: boolean;
  onOpenDpsRegistry?: () => void;
  onOpenDtDirect?: () => void;
  onOpenReseauRegistry?: () => void;
  onOpenUrgenceRegistry?: () => void;
  onOpenFormationRegistry?: () => void;
  compareYtd?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  stats, 
  onSelect, 
  isSelected, 
  onOpenDpsRegistry, 
  onOpenDtDirect,
  onOpenReseauRegistry,
  onOpenUrgenceRegistry,
  onOpenFormationRegistry,
  compareYtd = true
}) => {
  // Safe dynamic lucide icons
  const getIcon = (name: string) => {
    switch (name) {
      case 'ShieldAlert':
        return <Icons.ShieldAlert className="w-6 h-6 text-red-600" />;
      case 'FlameKindling':
        return <Icons.FlameKindling className="w-6 h-6 text-amber-600" />;
      case 'GraduationCap':
        return <Icons.GraduationCap className="w-6 h-6 text-blue-600" />;
      default:
        return <Icons.Activity className="w-6 h-6 text-red-600" />;
    }
  };

  // Calculate comparisons (2026 vs 2025)
  const currentYearData = stats.history.find(h => h.year === 2026) || stats.history[stats.history.length - 1];
  const previousYearData = stats.history.find(h => h.year === 2025) || stats.history[stats.history.length - 2];
  const baselineYearData = stats.history.find(h => h.year === 2024) || stats.history[0];

  const currentActivities = currentYearData?.activitiesCount || 0;
  const currentHours = currentYearData?.volunteerHours || 0;

  const prevActivities = previousYearData?.activitiesCount || 0;
  const prevHours = previousYearData?.volunteerHours || 0;

  const baseActivities = baselineYearData?.activitiesCount || 0;

  // Calcul d'évolution par rapport à la référence (2024 ou 2025)
  const getGrowthRatio = (current: number, past: number) => {
    if (!past) return 0;
    return Math.round(((current - past) / past) * 100);
  };

  const actGrowth = getGrowthRatio(currentActivities, prevActivities);
  const hoursGrowth = getGrowthRatio(currentHours, prevHours);
  const trendVsPrevYear = getGrowthRatio(currentActivities, prevActivities);

  return (
    <div
      id={`metric-card-${stats.id}`}
      onClick={onSelect}
      className={`relative p-6 cursor-pointer rounded-xl border transition-all duration-300 shadow-xs ${
        isSelected
          ? 'border-rc-red bg-rc-red/5 shadow-md transform -translate-y-1 ring-1 ring-rc-red/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* Icon Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
          {getIcon(stats.iconName)}
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
            trendVsPrevYear >= 0
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}
        >
          {compareYtd ? 'Tendance vs 2025 (Même période)' : 'Tendance vs 2025'} : {trendVsPrevYear >= 0 ? '+' : ''}
          {trendVsPrevYear}%
        </span>
      </div>

      {/* Text Info */}
      <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? 'var(--rc-red)' : '#94A3B8' }}></span>
        {stats.title}
      </h3>
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-5">{stats.description}</p>

      {/* Grid containing key quick stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
          <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Activités (2026)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {currentActivities.toLocaleString('fr-FR')}
            </span>
            <span
              className={`text-[11px] font-semibold flex items-center ${
                actGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
              title="Évolution vs 2025"
            >
              {actGrowth >= 0 ? '↑' : '↓'} {Math.abs(actGrowth)}%
            </span>
          </div>
          <p className="text-[9px] text-slate-400 mt-0.5">Cible/An : ~{(currentActivities * 1.05).toFixed(0)}</p>
        </div>

        <div className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
          <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Bénévolat 2026
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {currentHours.toLocaleString('fr-FR')} h
            </span>
            <span
              className={`text-[11px] font-semibold flex items-center ${
                hoursGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
              title="Évolution vs 2025"
            >
              {hoursGrowth >= 0 ? '↑' : '↓'} {Math.abs(hoursGrowth)}%
            </span>
          </div>
          <p className="text-[9px] text-slate-400 mt-0.5">
            Moy : {Math.round(currentHours / (currentActivities || 1))} h/act
          </p>
        </div>
      </div>

      {stats.id === 'secourisme' && (onOpenDpsRegistry || onOpenDtDirect || onOpenReseauRegistry) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            {onOpenDpsRegistry && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDpsRegistry();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-bold text-rc-red bg-rc-red/10 hover:bg-rc-red/15 rounded-md border border-rc-red/20 transition cursor-pointer"
              >
                <Icons.Eye className="w-3.5 h-3.5" />
                Registre DPS
              </button>
            )}

            {onOpenDtDirect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDtDirect();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition cursor-pointer"
              >
                <Icons.Flame className="w-3.5 h-3.5" />
                Postes Directs DT
              </button>
            )}
          </div>

          {onOpenReseauRegistry && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenReseauRegistry();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-250 transition cursor-pointer w-full"
            >
              <Icons.Shield className="w-3.5 h-3.5 text-emerald-600" />
              Gardes SDIS
            </button>
          )}
        </div>
      )}

      {stats.id === 'urgence' && onOpenUrgenceRegistry && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenUrgenceRegistry();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-250 transition cursor-pointer w-full"
          >
            <Icons.Eye className="w-3.5 h-3.5 text-amber-600" />
            Registre Urgences
          </button>
        </div>
      )}

      {stats.id === 'formation' && onOpenFormationRegistry && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFormationRegistry();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-bold text-blue-750 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition cursor-pointer w-full"
          >
            <Icons.Eye className="w-3.5 h-3.5 text-blue-600" />
            Registre Formations
          </button>
        </div>
      )}

      {/* IsSelected Overlay badge */}
      {isSelected && (
        <div className="absolute top-0 right-0 w-4 h-4 bg-rc-red rounded-tr-lg rounded-bl-lg flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
        </div>
      )}
    </div>
  );
};

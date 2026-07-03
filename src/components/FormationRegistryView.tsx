/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Filter, 
  Search, 
  Calendar, 
  Info,
  RotateCcw,
  Users,
  Trash2,
  PlusCircle,
  MapPin,
  GraduationCap,
  Play,
  Calculator,
  Award,
  BookOpen
} from 'lucide-react';
import { ParsedFormationPublicRow, MetierStats } from '../types';

interface FormationRegistryViewProps {
  isOpen: boolean;
  onClose: () => void;
  formationRows: ParsedFormationPublicRow[] | null;
  setFormationRows: (rows: ParsedFormationPublicRow[] | null) => void;
  fileName: string;
  setFileName: (name: string) => void;
  onDataImported: (newStats: MetierStats[]) => void;
  currentStats: MetierStats[];
}

const DEFAULT_UL_OPTIONS = [
  "78 - Chevreuse",
  "78 - Saint Quentin en Yvelines",
  "78 - Les Mureaux",
  "78 - Poissy",
  "78 - Sartrouville",
  "78 - Versailles Grand Parc Ouest",
  "78 - Cœur de Mauldre",
  "78 - Boucle de Seine Sud",
  "78 - Viroflay-Vélizy",
  "78 - Saint Germain en Laye",
  "78 - La Celle-Saint-Cloud",
  "78 - Rambouillet",
  "78 - Mantes-la-Jolie",
  "78 - Saint-Cyr-l'École"
];

export const FormationRegistryView: React.FC<FormationRegistryViewProps> = ({
  isOpen,
  onClose,
  formationRows,
  setFormationRows,
  fileName,
  setFileName,
  onDataImported,
  currentStats
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for manual additions
  const [formUl, setFormUl] = useState(DEFAULT_UL_OPTIONS[0]);
  const [formCustomUl, setFormCustomUl] = useState('');
  const [formYear, setFormYear] = useState(2025);
  // training inputs
  const [epscSe, setEpscSe] = useState(0);
  const [epscSt, setEpscSt] = useState(0);
  const [epscHe, setEpscHe] = useState(0);
  const [pscSe, setPscSe] = useState(0);
  const [pscSt, setPscSt] = useState(0);
  const [pscHe, setPscHe] = useState(0);
  const [ipsenSe, setIpsenSe] = useState(0);
  const [ipsenSt, setIpsenSt] = useState(0);
  const [ipsenHe, setIpsenHe] = useState(0);
  const [gqsSe, setGqsSe] = useState(0);
  const [gqsSt, setGqsSt] = useState(0);
  const [gqsHe, setGqsHe] = useState(0);
  const [recyclageSe, setRecyclageSe] = useState(0);
  const [recyclageSt, setRecyclageSt] = useState(0);
  const [recyclageHe, setRecyclageHe] = useState(0);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUlName = formUl === 'Autre (Saisir...) Web' || formUl === 'Autre' 
      ? formCustomUl.trim() || "Structure Locale Inconnue"
      : formUl;

    const newRow: ParsedFormationPublicRow = {
      ul: finalUlName,
      year: formYear,
      epscSessions: epscSe,
      epscStagiaires: epscSt,
      epscHeures: epscHe,
      pscSessions: pscSe,
      pscStagiaires: pscSt,
      pscHeures: pscHe,
      ipsenSessions: ipsenSe,
      ipsenStagiaires: ipsenSt,
      ipsenHeures: ipsenHe,
      gqsSessions: gqsSe,
      gqsStagiaires: gqsSt,
      gqsHeures: gqsHe,
      recyclageSessions: recyclageSe,
      recyclageStagiaires: recyclageSt,
      recyclageHeures: recyclageHe,
      isAlreadyKnown: false
    };

    let updatedRows: ParsedFormationPublicRow[] = [];
    if (formationRows) {
      // If UL & Year matches already, overwrite or consolidate
      const duplicateIdx = formationRows.findIndex(r => r.ul.toLowerCase() === finalUlName.toLowerCase() && r.year === formYear);
      if (duplicateIdx !== -1) {
        const copy = [...formationRows];
        copy[duplicateIdx] = newRow;
        updatedRows = copy;
      } else {
        updatedRows = [newRow, ...formationRows];
      }
    } else {
      updatedRows = [newRow];
    }

    setFormationRows(updatedRows);
    if (!fileName) {
      setFileName("Saisie_Manuelle_Formations.xlsx");
    }

    // Reset Form fields
    setEpscSe(0); setEpscSt(0); setEpscHe(0);
    setPscSe(0); setPscSt(0); setPscHe(0);
    setIpsenSe(0); setIpsenSt(0); setIpsenHe(0);
    setGqsSe(0); setGqsSt(0); setGqsHe(0);
    setRecyclageSe(0); setRecyclageSt(0); setRecyclageHe(0);
    setFormCustomUl('');
    setShowAddForm(false);
  };

  const handleDeleteRow = (indexToDelete: number) => {
    if (!formationRows) return;
    const filtered = formationRows.filter((_, idx) => idx !== indexToDelete);
    setFormationRows(filtered.length > 0 ? filtered : null);
  };

  const handleClearAll = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider le registre des formations locales ?")) {
      setFormationRows(null);
      setFileName('');
    }
  };

  // Extract list of active years
  const activeYears = useMemo(() => {
    if (!formationRows) return [2025];
    const set = new Set(formationRows.map(r => r.year));
    return Array.from(set).map(Number).sort((a, b) => b - a);
  }, [formationRows]);

  const filteredRows = useMemo(() => {
    if (!formationRows) return [];
    return formationRows.filter(row => {
      const safeUl = (row.ul || '').toLowerCase();
      const matchesSearch = safeUl.includes(searchTerm.toLowerCase());
      const matchesYear = selectedYearFilter === 'all' || row.year.toString() === selectedYearFilter;
      return matchesSearch && matchesYear;
    });
  }, [formationRows, searchTerm, selectedYearFilter]);

  // Aggregate stats
  const aggSessions = filteredRows.reduce((sum, r) => sum + r.epscSessions + r.pscSessions + r.ipsenSessions + r.gqsSessions + r.recyclageSessions, 0);
  const aggStagiaires = filteredRows.reduce((sum, r) => sum + r.epscStagiaires + r.pscStagiaires + r.ipsenStagiaires + r.gqsStagiaires + r.recyclageStagiaires, 0);
  const aggHeures = filteredRows.reduce((sum, r) => sum + r.epscHeures + r.pscHeures + r.ipsenHeures + r.gqsHeures + r.recyclageHeures, 0);

  if (!isOpen) return null;

  return (
    <div id="formation-registry-modal-overlay" className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div id="formation-registry-modal" className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 px-6 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Registre des Formations locales</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Saisie, vérification et consolidation du volume de formations Grand Public des Yvelines
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Information Row */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source active :</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-800 bg-white border border-slate-250 rounded font-mono shadow-3xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              {fileName || "Aucune source externe (Données simulées)"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition font-bold cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              {showAddForm ? "Annuler la saisie" : "Saisir une structure"}
            </button>
            {formationRows && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition font-bold cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                Vider le registre
              </button>
            )}
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Form manual addition snippet */}
          {showAddForm && (
            <form onSubmit={handleManualAdd} className="bg-blue-50/50 p-5 rounded-xl border border-blue-150 space-y-4 animate-in slide-in-from-top-3 duration-200">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs pb-1.5 border-b border-blue-100">
                <PlusCircle className="w-4 h-4 text-blue-600" />
                Saisie Manuelle d'un bilan d'UL
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-650 uppercase mb-1">Structure / Unité Locale</label>
                  <select
                    value={formUl}
                    onChange={(e) => setFormUl(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-350 rounded-md focus:ring-1 focus:ring-blue-500"
                  >
                    {DEFAULT_UL_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    <option value="Autre">Autre (Saisir...)</option>
                  </select>
                  {formUl === 'Autre' && (
                    <input
                      type="text"
                      placeholder="Saisissez le nom complet..."
                      required
                      value={formCustomUl}
                      onChange={(e) => setFormCustomUl(e.target.value)}
                      className="mt-1.5 w-full text-xs p-2 bg-white border border-slate-350 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-650 uppercase mb-1">Année fiscale d'exercice</label>
                  <input
                    type="number"
                    min={2024}
                    max={2030}
                    value={formYear}
                    required
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-350 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {/* ePSC */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded text-center mb-2">ePSC (Mixte)</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div>Sessions: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} value={epscSe} onChange={e => setEpscSe(Number(e.target.value))} /></div>
                    <div>Stagiaires: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} value={epscSt} onChange={e => setEpscSt(Number(e.target.value))} /></div>
                    <div>Heures: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} step="0.5" value={epscHe} onChange={e => setEpscHe(Number(e.target.value))} /></div>
                  </div>
                </div>

                {/* PSC */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded text-center mb-2">PSC (Présentiel)</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div>Sessions: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} value={pscSe} onChange={e => setPscSe(Number(e.target.value))} /></div>
                    <div>Stagiaires: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} value={pscSt} onChange={e => setPscSt(Number(e.target.value))} /></div>
                    <div>Heures: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} step="0.5" value={pscHe} onChange={e => setPscHe(Number(e.target.value))} /></div>
                  </div>
                </div>

                {/* IPSEN */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] font-bold text-purple-705 bg-purple-50 px-1 py-0.5 rounded text-center mb-2">IPS & IPSEN</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div>Sessions: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} value={ipsenSe} onChange={e => setIpsenSe(Number(e.target.value))} /></div>
                    <div>Stagiaires: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} value={ipsenSt} onChange={e => setIpsenSt(Number(e.target.value))} /></div>
                    <div>Heures: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} step="0.5" value={ipsenHe} onChange={e => setIpsenHe(Number(e.target.value))} /></div>
                  </div>
                </div>

                {/* GQS */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded text-center mb-2">GQS</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div>Sessions: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} value={gqsSe} onChange={e => setGqsSe(Number(e.target.value))} /></div>
                    <div>Stagiaires: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} value={gqsSt} onChange={e => setGqsSt(Number(e.target.value))} /></div>
                    <div>Heures: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} step="0.5" value={gqsHe} onChange={e => setGqsHe(Number(e.target.value))} /></div>
                  </div>
                </div>

                {/* Recyclage */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded text-center mb-2">Recyclage PSC</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div>Sessions: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} value={recyclageSe} onChange={e => setRecyclageSe(Number(e.target.value))} /></div>
                    <div>Stagiaires: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} value={recyclageSt} onChange={e => setRecyclageSt(Number(e.target.value))} /></div>
                    <div>Heures: <input className="w-full p-1 border border-slate-200 rounded font-mono text-[11px]" type="number" min={0} step="0.5" value={recyclageHe} onChange={e => setRecyclageHe(Number(e.target.value))} /></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-655 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md hover:shadow transition font-bold"
                >
                  Enregistrer et publier
                </button>
              </div>
            </form>
          )}

          {/* Search bar & filter selection Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute top-2.5 left-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Rechercher une Unité Locale (ex: Chevreuse, Poissy, Versailles...)"
                className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-4 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={selectedYearFilter}
                onChange={e => setSelectedYearFilter(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Toutes les années ({activeYears.length})</option>
                {activeYears.map(yr => (
                  <option key={yr} value={yr.toString()}>{yr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics of filtered selection */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-600">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-405 font-bold uppercase tracking-wider">Sessions cumulées</span>
                <span className="text-xl font-black text-slate-800">{aggSessions}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-405 font-bold uppercase tracking-wider">Stagiaires certifiés</span>
                <span className="text-xl font-black text-slate-800">{aggStagiaires.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg text-purple-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-405 font-bold uppercase tracking-wider">Heures dispensées</span>
                <span className="text-xl font-black text-slate-800">{aggHeures.toLocaleString()} h</span>
              </div>
            </div>
          </div>

          {/* List Table of rows */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            {filteredRows.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <Info className="w-8 h-8 text-slate-350 mx-auto" />
                <h6 className="font-bold text-sm">Aucun enregistrement local à afficher</h6>
                <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
                  Importez un fichier d'exercices locaux ou cliquez sur "Saisir une structure" pour commencer.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3 pl-4 border-r border-slate-200">Localité</th>
                      <th className="p-3 text-center border-r border-slate-200">Année</th>
                      <th className="p-3 text-center bg-blue-50/20 border-r border-slate-200" colSpan={3}>ePSC</th>
                      <th className="p-3 text-center bg-indigo-50/20 border-r border-slate-200" colSpan={3}>PSC (Classique)</th>
                      <th className="p-3 text-center bg-purple-50/20 border-r border-slate-200" colSpan={3}>IPS & IPSEN</th>
                      <th className="p-3 text-center bg-amber-50/20 border-r border-slate-200" colSpan={3}>GQS</th>
                      <th className="p-3 text-center bg-emerald-50/20 border-r border-slate-200" colSpan={3}>Recyclage</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[9px] bg-slate-50">
                      <th className="p-2 border-r border-slate-200"></th>
                      <th className="p-2 text-center border-r border-slate-200"></th>
                      {/* ePSC */}
                      <th className="p-2 text-center bg-blue-50/10">Se</th><th className="p-2 text-center bg-blue-50/10">St</th><th className="p-2 text-center bg-blue-50/10 border-r border-slate-200">He</th>
                      {/* PSC */}
                      <th className="p-2 text-center bg-indigo-50/10">Se</th><th className="p-2 text-center bg-indigo-50/10">St</th><th className="p-2 text-center bg-indigo-50/10 border-r border-slate-200">He</th>
                      {/* IPSEN */}
                      <th className="p-2 text-center bg-purple-50/10">Se</th><th className="p-2 text-center bg-purple-50/10">St</th><th className="p-2 text-center bg-purple-50/10 border-r border-slate-200">He</th>
                      {/* GQS */}
                      <th className="p-2 text-center bg-amber-50/10">Se</th><th className="p-2 text-center bg-amber-50/10">St</th><th className="p-2 text-center bg-amber-50/10 border-r border-slate-200">He</th>
                      {/* recyclage */}
                      <th className="p-2 text-center bg-emerald-50/10">Se</th><th className="p-2 text-center bg-emerald-50/10">St</th><th className="p-2 text-center bg-emerald-50/10 border-r border-slate-200">He</th>
                      <th className="p-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredRows.map((row, i) => {
                      const absoluteIndex = formationRows ? formationRows.findIndex(orig => orig.ul === row.ul && orig.year === row.year) : -1;
                      const globalSe = row.epscSessions + row.pscSessions + row.ipsenSessions + row.gqsSessions + row.recyclageSessions;
                      const globalSt = row.epscStagiaires + row.pscStagiaires + row.ipsenStagiaires + row.gqsStagiaires + row.recyclageStagiaires;
                      const globalHe = row.epscHeures + row.pscHeures + row.ipsenHeures + row.gqsHeures + row.recyclageHeures;

                      return (
                        <tr key={i} className="hover:bg-slate-50 transition group">
                          <td className="p-3 pl-4 font-bold text-slate-800 border-r border-slate-200">{row.ul}</td>
                          <td className="p-3 text-center text-slate-500 font-bold border-r border-slate-200 font-mono bg-slate-50/40">{row.year}</td>
                          
                          {/* ePSC */}
                          <td className="p-2 text-center font-semibold text-slate-804">{row.epscSessions || '-'}</td>
                          <td className="p-2 text-center text-slate-600">{row.epscStagiaires || '-'}</td>
                          <td className="p-2 text-center text-slate-500 font-mono border-r border-slate-200">{row.epscHeures ? `${row.epscHeures}h` : '-'}</td>
                          
                          {/* PSC */}
                          <td className="p-2 text-center font-semibold text-slate-804">{row.pscSessions || '-'}</td>
                          <td className="p-2 text-center text-slate-600">{row.pscStagiaires || '-'}</td>
                          <td className="p-2 text-center text-slate-500 font-mono border-r border-slate-200">{row.pscHeures ? `${row.pscHeures}h` : '-'}</td>
                          
                          {/* IPSEN */}
                          <td className="p-2 text-center font-semibold text-slate-804">{row.ipsenSessions || '-'}</td>
                          <td className="p-2 text-center text-slate-600">{row.ipsenStagiaires || '-'}</td>
                          <td className="p-2 text-center text-slate-500 font-mono border-r border-slate-200">{row.ipsenHeures ? `${row.ipsenHeures}h` : '-'}</td>
                          
                          {/* GQS */}
                          <td className="p-2 text-center font-semibold text-slate-804">{row.gqsSessions || '-'}</td>
                          <td className="p-2 text-center text-slate-600">{row.gqsStagiaires || '-'}</td>
                          <td className="p-2 text-center text-slate-500 font-mono border-r border-slate-200">{row.gqsHeures ? `${row.gqsHeures}h` : '-'}</td>
                          
                          {/* Recyclage */}
                          <td className="p-2 text-center font-semibold text-slate-804">{row.recyclageSessions || '-'}</td>
                          <td className="p-2 text-center text-slate-600">{row.recyclageStagiaires || '-'}</td>
                          <td className="p-2 text-center text-slate-500 font-mono border-r border-slate-200">{row.recyclageHeures ? `${row.recyclageHeures}h` : '-'}</td>
                          
                          {/* Delete */}
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (absoluteIndex !== -1) {
                                  handleDeleteRow(absoluteIndex);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer"
                              title="Retirer cette structure du registre"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between rounded-b-xl text-xs text-slate-500">
          <span className="font-mono">Registre Formation Grand Public — 78</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md cursor-pointer transition shadow-3xs"
          >
            Fermer le Registre
          </button>
        </div>

      </div>
    </div>
  );
};

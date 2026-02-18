"use client";
import { useState, useEffect, useCallback } from "react";

const DB = {
  pipeline: "collection://785349e4-fdba-4e0c-8281-720da2e0a6b2",
  ads: "collection://548cd1a2-3cfc-44a1-aff7-9f8f186e223c",
  ideas: "collection://acfa6e49-262d-4752-9c22-905cab51b430",
};

const PIPE = [
  { key: "📝 Briefing", label: "Briefing", color: "#64748b", icon: "📝" },
  { key: "🎥 Opname", label: "Opname", color: "#3b82f6", icon: "🎥" },
  { key: "✂️ Editing (CapCut)", label: "Editing", color: "#8b5cf6", icon: "✂️" },
  { key: "👁️ Review", label: "Review", color: "#eab308", icon: "👁️" },
  { key: "✅ Klaar voor Ads", label: "Klaar", color: "#22c55e", icon: "✅" },
  { key: "🚀 Live", label: "Live", color: "#ef4444", icon: "🚀" },
];

const ADST = [
  { key: "🟢 Actief", label: "Actief", color: "#22c55e" },
  { key: "🟡 Gepauzeerd", label: "Gepauzeerd", color: "#eab308" },
  { key: "🔴 Gestopt", label: "Gestopt", color: "#ef4444" },
  { key: "🧪 Test", label: "Test", color: "#3b82f6" },
];

async function ask(prompt) {
  try {
    const r = await fetch("/api/notion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const d = await r.json();
    return d.text || "";
  } catch {
    return "";
  }
}

function pj(t) {
  try {
    const m = t.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch {
    return null;
  }
}

function Glow({ color, top, left, size = 300 }) {
  return (
    <div style={{ position: "absolute", top, left, width: size, height: size, background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, borderRadius: "50%", pointerEvents: "none", filter: "blur(40px)" }} />
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28, position: "relative", overflow: "hidden", backdropFilter: "blur(10px)", ...style }}>
      {children}
    </div>
  );
}

function Accent({ color }) {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent 80%)` }} />
  );
}

function StatCard({ label, value, sub, color, icon, trend }) {
  return (
    <Card>
      <Accent color={color} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.8 }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1 }}>{value}</span>
          {trend !== undefined && trend !== null && (
            <span style={{ fontSize: 13, fontWeight: 700, color: trend > 0 ? "#22c55e" : trend < 0 ? "#ef4444" : "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 3 }}>
              {trend > 0 ? "▲" : trend < 0 ? "▼" : "–"} {Math.abs(trend)}
            </span>
          )}
        </div>
        {sub && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{sub}</span>}
      </div>
    </Card>
  );
}

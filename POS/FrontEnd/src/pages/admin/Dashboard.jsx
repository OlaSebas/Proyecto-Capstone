import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Expand, Minimize2, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";

function buildPowerBIUrl(base, { filters = [], page, theme, extraParams = {} } = {}) {
  if (!base) return "";
  const u = new URL(base);
  if (page) u.searchParams.set("pageName", page);
  if (theme) u.searchParams.set("theme", theme);
  filters.forEach((f) => {
    const op = f.op ?? "eq";
    const v = typeof f.value === "number" ? f.value : `'${String(f.value).replace(/'/g, "''")}'`;
    u.searchParams.append("filter", `${f.table}/${f.field} ${op} ${v}`);
  });
  Object.entries(extraParams).forEach(([k, v]) => u.searchParams.set(k, String(v)));
  return u.toString();
}

export default function Dashboard({
  embedUrl = "https://app.fabric.microsoft.com/view?r=eyJrIjoiNzU0ZWVlMTMtZTY3ZC00OTZlLWE0NTctM2Y1OGVlM2Y3MDMxIiwidCI6IjUzMGM3NTRkLThlNTItNDkyMi1iY2I5LTRkYTQ4N2Y4ZDQ3NSIsImMiOjR9",
  filters,
  page,
  theme = "light",
  extraParams,
}) {
  const outlet = useOutletContext?.();
  const { sidebarOpen = false, setSidebarOpen = () => {} } = outlet ?? {};

  const [hora, setHora] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [autoRefreshMin, setAutoRefreshMin] = useState(0); // 0 = off

  // Reloj header
  useEffect(() => {
    const tick = () =>
      setHora(
        new Date().toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Forzar fullscreen en móviles/tablets
  useEffect(() => {
    const apply = () => setFullscreen(window.innerWidth < 1024);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  // URL final con cache-buster
  const src = useMemo(() => {
    const base = buildPowerBIUrl(embedUrl, { filters, page, theme, extraParams });
    if (!base) return "";
    const u = new URL(base);
    u.searchParams.set("_rk", String(reloadKey));     // cambia siempre al refrescar
    u.searchParams.set("_t", String(Date.now()));     // evita cache agresivo de CDN
    return u.toString();
  }, [embedUrl, JSON.stringify(filters), page, theme, JSON.stringify(extraParams), reloadKey]);

  // Reset estados cuando cambia src
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [src]);

  // Timeout de carga
  useEffect(() => {
    if (!src) return;
    const id = setTimeout(() => {
      if (!loaded) setErrored(true);
    }, 20000);
    return () => clearTimeout(id);
  }, [src, loaded]);

  // ➊ Refrescar al volver a la pestaña (cambia el _rk)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") setReloadKey((k) => k + 1);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  // ➋ Auto-refresh cada X minutos (opcional)
  useEffect(() => {
    if (!autoRefreshMin) return;
    const id = setInterval(() => setReloadKey((k) => k + 1), autoRefreshMin * 60 * 1000);
    return () => clearInterval(id);
  }, [autoRefreshMin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200 text-neutral-900">
      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          {/* Móvil */}
          <div className="block md:hidden py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="w-full h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>
            <div className="mt-3 text-center">
              <h1 className="text-2xl font-extrabold text-gray-900">Ventas Sistema POS (BI)</h1>
              <p className="mt-1 text-gray-600 font-medium">{hora}</p>
            </div>
          </div>

          {/* Desktop/Tablet */}
          <div className="hidden md:flex items-center justify-between py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <h1 className="flex-1 px-3 text-center text-3xl font-extrabold text-gray-900">
              Ventas Sistema POS (BI)
            </h1>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block min-w-[120px] text-right text-gray-600 font-medium">
                {hora}
              </span>
              <button
                onClick={() => setFullscreen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200"
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
                {fullscreen ? "Salir" : "Agrandar"}
              </button>
              {src ? (
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir en Power BI
                </a>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400 shadow-sm"
                >
                  Abrir en Power BI
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ACCIONES */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="text-sm text-gray-700">
            {src ? "Reporte conectado a Power BI" : "No hay URL de Power BI configurada"}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              Auto-actualizar
              <select
                className="border border-gray-300 rounded-md px-2 py-1"
                value={autoRefreshMin}
                onChange={(e) => setAutoRefreshMin(Number(e.target.value))}
              >
                <option value={0}>Off</option>
                <option value={1}>1 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
              </select>
            </label>

            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        </div>
      </div>

      {/* IFRAME */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-8">
        {!src ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-10 text-center text-gray-600">
            No hay reporte para mostrar.
          </div>
        ) : (
          <div className={`relative w-full ${fullscreen ? "h-[calc(100vh-9.5rem)]" : "pt-[56.25%]"}`}>
            {!loaded && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="rounded-xl border border-gray-200 bg-white/90 backdrop-blur px-6 py-4 shadow">
                  {errored ? (
                    <div className="text-center">
                      <p className="font-semibold text-red-600">No se pudo cargar el reporte</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Verifica permisos o disponibilidad de Power BI y vuelve a intentar.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">Cargando Power BI…</p>
                  )}
                </div>
              </div>
            )}

            <iframe
              key={reloadKey}
              title="DashboardDannyP"
              src={src}
              className="absolute inset-0 h-full w-full rounded-2xl border border-neutral-200 bg-white"
              frameBorder="0"
              allowFullScreen
              allow="fullscreen"
              onLoad={() => {
                setLoaded(true);
                setErrored(false);
              }}
              onError={() => setErrored(true)}
            />
          </div>
        )}
      </main>
    </div>
  );
}

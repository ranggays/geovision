"use client";

import { useState, useRef, ChangeEvent } from "react";

export default function SmartCityAI() {
  // State untuk Preview UI
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<string | null>(null);
  
  // State untuk File Asli
  const [fileLama, setFileLama] = useState<File | null>(null);
  const [fileBaru, setFileBaru] = useState<File | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // State untuk menampung hasil analisis 6-kelas
  const [hasilAnalisis, setHasilAnalisis] = useState<{
    mask_lama: string | null;
    mask_baru: string | null;
    stats_lama: any | null;
    stats_baru: any | null;
  }>({
    mask_lama: null,
    mask_baru: null,
    stats_lama: null,
    stats_baru: null
  });

  const resultsRef = useRef<HTMLDivElement>(null);
  const oldInputRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

  const handleOldUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOldImage(URL.createObjectURL(file));
      setFileLama(file);
    }
  };

  const handleNewUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(URL.createObjectURL(file));
      setFileBaru(file);
    }
  };

  const handleAnalyze = async () => {
    if (!fileLama || !fileBaru) {
      alert("Harap upload Citra Referensi dan Citra Terkini terlebih dahulu!");
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);

    try {
      const fetchAnalisis = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("http://localhost:8000/predict/", { method: "POST", body: formData });
        return await res.json();
      };

      const [resLama, resBaru] = await Promise.all([
        fetchAnalisis(fileLama),
        fetchAnalisis(fileBaru)
      ]);

      if (resLama.status === "success" && resBaru.status === "success") {
        setHasilAnalisis({
          mask_lama: resLama.mask_base64,
          mask_baru: resBaru.mask_base64,
          stats_lama: resLama.statistik_kota,
          stats_baru: resBaru.statistik_kota
        });
        setShowResults(true);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi ke FastAPI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue-deep:   #1a1fd4;
          --blue-vivid:  #2d35e8;
          --blue-bright: #4a54ff;
          --blue-light:  #6c74ff;
          --blue-pale:   #e8eaff;
          --blue-muted:  #c5c9ff;
          --bg:          #f5f6ff;
          --surface:     #ffffff;
          --border:      #e4e6f4;
          --border-dark: #d0d3ef;
          --text:        #0f1035;
          --text-2:      #3d4068;
          --text-3:      #7b7fa8;
          --text-4:      #a8acd0;
          --green:       #0eb87a;
          --green-bg:    #e6faf3;
          --amber:       #f59e0b;
          --amber-bg:    #fffbeb;
          --red:         #ef4444;
          --red-bg:      #fef2f2;
        }

        body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .app-shell { display: flex; min-height: 100vh; }

        .sidebar {
          width: 300px; flex-shrink: 0; background: var(--blue-vivid);
          background-image: radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.12) 0%, transparent 60%);
          position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 36px 28px;
        }

        .logo-mark { width: 38px; height: 38px; background: rgba(255,255,255,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
        .sidebar-stat-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; }

        .main-content { flex: 1; overflow-y: auto; background: var(--bg); }
        .topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 40px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 40; }
        .page-body { padding: 40px; max-width: 900px; display: flex; flex-direction: column; gap: 28px; }

        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
        .card-sm { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }

        .upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .upload-zone { border: 1.5px dashed var(--border-dark); background: var(--bg); border-radius: 12px; height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
        .upload-zone:hover { border-color: var(--blue-bright); background: var(--blue-pale); }
        .preview-zone { border: 1px solid var(--border); border-radius: 12px; height: 220px; overflow: hidden; position: relative; cursor: pointer; }

        .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 99px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .badge-blue { background: var(--blue-pale); color: var(--blue-vivid); }
        .badge-green { background: var(--green-bg); color: var(--green); }

        .btn-primary { background: var(--blue-vivid); color: #fff; font-weight: 700; padding: 13px 36px; border-radius: 10px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 16px rgba(45,53,232,0.35); }
        .btn-primary:disabled { opacity: 0.5; }

        .viz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .viz-img { aspect-ratio: 1/1; border-radius: 10px; overflow: hidden; position: relative; background: #000; border: 1px solid var(--border); }

        .meta-row { display: flex; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        .meta-item { flex: 1; padding: 12px 18px; border-right: 1px solid var(--border); }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 20px; height: 20px; border: 2px solid var(--blue-pale); border-top-color: var(--blue-vivid); border-radius: 50%; animation: spin 0.7s linear infinite; }

        /* Custom Legend Styles */
        .legend-dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; margin-right: 6px; }
      `}</style>

      <div className="app-shell">
        <aside className="sidebar">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "auto" }}>
            <div className="logo-mark">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.5"/><circle cx="10" cy="10" r="2" fill="white"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>GeoVision AI</span>
          </div>

          <div style={{ paddingTop: 48 }}>
            <h2 style={{ fontWeight: 800, fontSize: 28, color: "#fff", lineHeight: 1.2, marginBottom: 14 }}>
              Analisis<br/>Tata Kota<br/>Otomatis
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
              Segmentasi semantik citra satelit untuk klasifikasi infrastruktur dan vegetasi menggunakan model U-Net.
            </p>
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Pixel Accuracy", val: "83.89%" },
                { label: "mIoU Score", val: "56.21%" },
                { label: "Target Kelas", val: "6 Classes" },
              ].map((s, i) => (
                <div className="sidebar-stat-row" key={i}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{s.label}</span>
                  <span className="mono" style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 16, marginTop: 32 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>© 2026</span>
          </div>
        </aside>

        <div className="main-content">
          <header className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Klasifikasi Land Use</span>
              <span className="badge badge-blue">Multi-Class</span>
            </div>
            <span className="mono" style={{ fontSize: 10, color: "var(--text-4)" }}>GeoVision v4.0</span>
          </header>

          <div className="page-body">
            <div>
              <h1 style={{ fontWeight: 800, fontSize: 26, color: "var(--text)" }}>Upload Citra Satelit</h1>
              <p style={{ color: "var(--text-3)", marginTop: 6, fontSize: 14 }}>
                Bandingkan dua periode citra untuk melihat perubahan komposisi tata kota secara mendalam.
              </p>
            </div>

            <div className="card">
              <div className="upload-grid">
                {/* OLD UPLOAD */}
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Citra Referensi (Lama)</p>
                  {oldImage ? (
                    <div className="preview-zone" onClick={() => oldInputRef.current?.click()}>
                      <img src={oldImage} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                    </div>
                  ) : (
                    <div className="upload-zone" onClick={() => oldInputRef.current?.click()}>
                      <p style={{ fontSize: 12, color: "var(--text-4)" }}>Upload Image 1</p>
                    </div>
                  )}
                  <input ref={oldInputRef} type="file" hidden onChange={handleOldUpload}/>
                </div>

                {/* NEW UPLOAD */}
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Citra Terkini (Baru)</p>
                  {newImage ? (
                    <div className="preview-zone" onClick={() => newInputRef.current?.click()}>
                      <img src={newImage} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                    </div>
                  ) : (
                    <div className="upload-zone" onClick={() => newInputRef.current?.click()}>
                      <p style={{ fontSize: 12, color: "var(--text-4)" }}>Upload Image 2</p>
                    </div>
                  )}
                  <input ref={newInputRef} type="file" hidden onChange={handleNewUpload}/>
                </div>
              </div>
            </div>

            {/* Meta Row */}
            <div className="meta-row">
              {[
                { k: "Dataset", v: "Dubai Segmentation" },
                { k: "Encoder", v: "ResNet34" },
                { k: "Output", v: "6 Channels" },
                { k: "Backend", v: "FastAPI" },
              ].map((m, i) => (
                <div className="meta-item" key={i}>
                  <p className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>{m.k}</p>
                  <p className="mono" style={{ fontSize: 11, fontWeight: 600 }}>{m.v}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={isAnalyzing || !fileLama || !fileBaru}>
                {isAnalyzing ? "Memproses..." : "Jalankan Segmentasi Smart City"}
              </button>
            </div>

            {showResults && (
              <div ref={resultsRef} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                
                {/* Visualisasi Gambar (Dual View Seperti Semula) */}
                <div className="viz-grid">
                  {[
                    { title: "Analisis Referensi", src: hasilAnalisis.mask_lama, stats: hasilAnalisis.stats_lama },
                    { title: "Analisis Terkini", src: hasilAnalisis.mask_baru, stats: hasilAnalisis.stats_baru }
                  ].map((res, i) => (
                    <div className="card-sm" key={i}>
                      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>{res.title}</p>
                      <div className="viz-img">
                        <img src={res.src!} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                      </div>
                      
                      {/* Mini Legend di bawah tiap gambar */}
                      <div style={{ marginTop: 15, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {Object.entries(res.stats).map(([label, val]: any) => {
                          const colors: any = { "Bangunan": "#3C1098", "Vegetasi": "#FEDD3A", "Jalanan": "#6EC1E4", "Perairan": "#E2A929", "Tanah": "#8429F6" };
                          if (label === "Lainnya") return null;
                          return (
                            <div key={label} style={{ fontSize: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span><span className="legend-dot" style={{ background: colors[label] }}/>{label}</span>
                              <span className="mono" style={{ fontWeight: 700 }}>{val}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ background: "var(--blue-deep)", color: "white" }}>
                  <h4 style={{ marginBottom: 12 }}>Summary Perubahan Tata Kota</h4>
                  <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>
                    Berdasarkan perbandingan dua periode, terjadi 
                    <strong> {hasilAnalisis.stats_baru.Bangunan > hasilAnalisis.stats_lama.Bangunan ? "Peningkatan" : "Penurunan"} </strong> 
                    area bangunan sebesar {Math.abs(hasilAnalisis.stats_baru.Bangunan - hasilAnalisis.stats_lama.Bangunan).toFixed(2)}%. 
                    Sementara area hijau (vegetasi) mengalami perubahan sebesar 
                     { (hasilAnalisis.stats_baru.Vegetasi - hasilAnalisis.stats_lama.Vegetasi).toFixed(2) }%.
                  </p>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
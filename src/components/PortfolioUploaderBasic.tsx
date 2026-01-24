import React from "react";

export function PortfolioUploaderBasic({ onFile }: { onFile: (f: File) => void }) {
  const inputId = "portfolio-upload-input";

  return (
    <div>
      {/* Label hace click nativo en el input */}
      <label
        htmlFor={inputId}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 18px",
          borderRadius: 12,
          cursor: "pointer",
          userSelect: "none",
          background: "#14b8a6",
          color: "white",
          fontWeight: 600,
        }}
      >
        Seleccionar Foto
      </label>

      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          onFile(f);

          // clave: permitir seleccionar la MISMA foto de nuevo
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}

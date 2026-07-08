import { forwardRef } from "react";
import type { Mensagem } from "@/lib/data";
import { FORMATS, THEMES, type ShareOptions } from "./themes";

interface Props {
  mensagem: Mensagem;
  options: ShareOptions;
}

// Renderiza o conteúdo da imagem de compartilhamento no tamanho nativo do formato.
// Mantém o layout original (story branca) como padrão; só muda quando o usuário
// altera tema/formato/toggles/extras.
export const ShareCanvas = forwardRef<HTMLDivElement, Props>(function ShareCanvas(
  { mensagem, options },
  ref,
) {
  const { width, height } = FORMATS[options.format];
  const c = THEMES[options.theme];
  const isHorizontal = options.format === "horizontal";
  const isSquare = options.format === "quadrado";
  const isPost = options.format === "post";

  // Escala de fonte por formato (story = base)
  const scale = isHorizontal ? 0.85 : isSquare ? 0.78 : isPost ? 0.9 : 1;

  const topPad = isHorizontal ? 80 : isSquare ? 80 : isPost ? 100 : 140;
  const bottomPad = isHorizontal ? 70 : isSquare ? 70 : isPost ? 80 : 100;
  const sidePad = isHorizontal ? 140 : 80;

  const textScaleFactor = 1 - (options.textScale ?? 0) * 0.12;
  const textSize = Math.round(72 * scale * textScaleFactor);
  const refSize = Math.round(32 * scale);
  const resumoSize = Math.round(
    (mensagem.resumo && mensagem.resumo.length > 600
      ? 24
      : mensagem.resumo && mensagem.resumo.length > 400
      ? 28
      : mensagem.resumo && mensagem.resumo.length > 250
      ? 32
      : 34) * scale,
  );
  const resumoClamp =
    mensagem.resumo && mensagem.resumo.length > 600 ? 14 : 12;

  return (
    <div
      ref={ref}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: c.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      {/* Topo: CHOSEN */}
      <div style={{ paddingTop: `${topPad}px`, display: "flex", justifyContent: "center" }}>
        <p
          style={{
            fontSize: `${Math.round(28 * scale)}px`,
            fontWeight: 300,
            letterSpacing: "0.4em",
            color: c.muted,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Chosen
        </p>
      </div>

      {/* Conteúdo central */}
      <div
        style={{
          padding: `0 ${sidePad}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: `${Math.round(60 * scale)}px`,
          width: "100%",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontSize: `${textSize}px`,
            fontWeight: 300,
            lineHeight: 1.2,
            color: c.fg,
            margin: 0,
          }}
        >
          "{mensagem.texto}"
        </p>
        {options.showRef && (
          <p
            style={{
              fontSize: `${refSize}px`,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: c.fg,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {mensagem.referencia}
          </p>
        )}
        {options.showResumo && mensagem.resumo && (
          <p
            style={{
              marginTop: `${Math.round(40 * scale)}px`,
              fontSize: `${resumoSize}px`,
              fontWeight: 300,
              color: c.sub,
              padding: "0 40px",
              lineHeight: 1.5,
              maxWidth: "900px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: resumoClamp,
            }}
          >
            {mensagem.resumo}
          </p>
        )}
      </div>

      {/* Mascote (canto inferior esquerdo) */}
      {options.mascoteUrl && (
        <img
          src={options.mascoteUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            left: `${Math.round(60 * scale)}px`,
            bottom: `${bottomPad + 20}px`,
            width: `${Math.round(180 * scale)}px`,
            height: `${Math.round(180 * scale)}px`,
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Rodapé */}
      {options.showFooter && (
        <div
          style={{
            paddingBottom: `${bottomPad}px`,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <p
            style={{
              fontSize: `${Math.round(20 * scale)}px`,
              fontWeight: 300,
              color: c.muted,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            {options.signature
              ? `Enviado por ${options.signature}`
              : "Essa foi escolhida especialmente para mim"}
          </p>
          <p
            style={{
              fontSize: `${Math.round(24 * scale)}px`,
              fontWeight: 500,
              color: c.accent,
              margin: 0,
            }}
          >
            chosen.oonn.com.br
          </p>
        </div>
      )}
    </div>
  );
});
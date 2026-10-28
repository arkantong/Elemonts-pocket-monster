import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import { MusicProvider } from "./components/Music";
import { t } from "./i18n";
import React, { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/bricolage-grotesque/600.css";
import "@fontsource/bricolage-grotesque/700.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "./styles.css";
import "./pocket-pals.css";
import App from "./App";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { GameProvider } from "./game/context";
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty">
        <h1>{t("Rumah sedang dirapikan.")}</h1>
        <p>
          {t(
            "Tampilan mengalami masalah. Progres yang sudah tersimpan tetap ada.",
          )}
        </p>
        <button className="button primary" onClick={() => location.reload()}>
          {t("Muat ulang")}
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ErrorBoundary>
        <GameProvider>
          <MusicProvider>
            <App />
          </MusicProvider>
        </GameProvider>
      </ErrorBoundary>
    </LanguageProvider>
  </React.StrictMode>,
);

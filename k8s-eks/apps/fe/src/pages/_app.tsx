import "@/styles/normalize.min.css";
import "@/styles/milligram.min.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="container" style={{ marginTop: "150px" }}>
      <div className="row">
        <div className="column column-100 text-center">
          <Component {...pageProps} />
        </div>
      </div>
    </div>
  );
}

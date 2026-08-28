import { useEffect, useRef } from "react";

const AD_CONTAINER_ID = "container-08cf38b72b8e6b3ab8b2a8dd1ba46b10";
const AD_SCRIPT_SRC =
  "https://pl31064836.profitableratecpmnetwork.com/08cf38b72b8e6b3ab8b2a8dd1ba46b10/invoke.js";

export function AdBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = AD_SCRIPT_SRC;
    containerRef.current.appendChild(script);
    scriptLoaded.current = true;
  }, []);

  return (
    <div className="w-full py-4">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <div ref={containerRef} id={AD_CONTAINER_ID} />
      </div>
    </div>
  );
}

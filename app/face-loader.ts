type FaceMeshConstructor = typeof import("@mediapipe/face_mesh").FaceMesh;

declare global {
  interface Window {
    FaceMesh?: FaceMeshConstructor;
  }
}

let faceMeshScriptPromise: Promise<FaceMeshConstructor> | null = null;

export function loadBrowserFaceMesh() {
  if (window.FaceMesh) return Promise.resolve(window.FaceMesh);
  if (faceMeshScriptPromise) return faceMeshScriptPromise;

  faceMeshScriptPromise = new Promise<FaceMeshConstructor>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-fenty-face-mesh="true"]',
    );
    const finish = () => {
      if (window.FaceMesh) resolve(window.FaceMesh);
      else reject(new Error("实时面部追踪器加载失败。"));
    };
    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("实时面部追踪器加载失败。")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "/mediapipe/face_mesh.js";
    script.async = true;
    script.dataset.fentyFaceMesh = "true";
    script.addEventListener("load", finish, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("实时面部追踪器加载失败。")),
      { once: true },
    );
    document.head.appendChild(script);
  }).catch((error) => {
    document.querySelector('script[data-fenty-face-mesh="true"]')?.remove();
    faceMeshScriptPromise = null;
    throw error;
  });

  return faceMeshScriptPromise;
}


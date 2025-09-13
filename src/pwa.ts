export const setupPWAInstallPrompt = () => {
  let deferredPrompt: any;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("PWA pronto para instalação");
  });

  const installButton = document.getElementById("installBtn");
  installButton?.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    console.log("Usuário escolheu:", choice.outcome);
    deferredPrompt = null;
  });
};
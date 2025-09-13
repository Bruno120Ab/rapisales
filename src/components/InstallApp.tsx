import usePWAInstall from "@/lib/InstallPwa";
import { ArrowDownToLine } from "lucide-react";

export default function InstallPWAButton() {
  const { isInstallable, promptInstall } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <button
      onClick={promptInstall}
      className=" right-4 h-10 text-lg text-white gap-x-1 bg-primary px-4 py-1 mx-auto rounded shadow-lg transition flex "
    >
    <ArrowDownToLine className="" />
      Instalar App
    </button>
  );
}

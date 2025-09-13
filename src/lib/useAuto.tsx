import { useEffect } from "react";
import { sendBackupToDriveAndLocal } from "./backupDrive";

// export const useAutoBackup = (intervalMinutes: number = 30) => {
//   useEffect(() => {
//     const startHour = 17; // 17:00
//     const endHour = 23;   // 23:00

//     const doBackup = async () => {
//       const now = new Date();
//       const hour = now.getHours();

//       // Só executa se estiver dentro do intervalo permitido
//       if (hour >= startHour && hour < endHour) {
//         console.log(`Iniciando backup automático às ${now.toLocaleTimeString()}...`);
//         await sendBackupToDriveAndLocal();
//       } else {
//         console.log(`Horário atual ${now.toLocaleTimeString()} fora do período de backup (${startHour}:00 - ${endHour}:00).`);
//       }
//     };

//     const scheduleNextRun = () => {
//       const now = new Date();
//       const hour = now.getHours();
//       let delay: number;

//       if (hour < startHour) {
//         // Antes das 17:00 → aguarda até 17:00
//         delay = new Date(
//           now.getFullYear(),
//           now.getMonth(),
//           now.getDate(),
//           startHour,
//           0,
//           0,
//           0
//         ).getTime() - now.getTime();
//       } else if (hour >= startHour && hour < endHour) {
//         // Durante o período → executa no intervalo definido
//         delay = intervalMinutes * 60 * 1000;
//       } else {
//         // Após 23:00 → agenda para amanhã às 17:00
//         delay = new Date(
//           now.getFullYear(),
//           now.getMonth(),
//           now.getDate() + 1,
//           startHour,
//           0,
//           0,
//           0
//         ).getTime() - now.getTime();
//       }

//       return delay;
//     };

//     const runBackupLoop = async () => {
//       await doBackup();
//       const nextDelay = scheduleNextRun();
//       console.log(`Próximo backup agendado para daqui ${Math.ceil(nextDelay / 1000 / 60)} minutos.`);
//       timeoutId = setTimeout(runBackupLoop, nextDelay);
//     };

//     let timeoutId: ReturnType<typeof setTimeout>;
//     runBackupLoop();

//     return () => clearTimeout(timeoutId);
//   }, [intervalMinutes]);
// };

export const useAutoBackup = (intervalMinutes: number = 30) => {
  useEffect(() => {
    const startHour = 17; // 17:00
    const endHour = 23;   // 23:00

    const doBackup = async () => {
      const now = new Date();
      const hour = now.getHours();

      // Só executa se estiver dentro do intervalo permitido
      if (hour >= startHour && hour < endHour) {
        console.log(`Backup automático iniciado às ${now.toLocaleTimeString()}...`);
        await sendBackupToDriveAndLocal(); // aqui já dispara Drive + Local
      } else {
        console.log(
          `⏸ Horário atual ${now.toLocaleTimeString()} fora do período de backup (${startHour}:00 - ${endHour}:00).`
        );
      }
    };

    // executa imediatamente se já estiver no horário
    doBackup();

    // agenda o intervalo fixo
    const intervalId = setInterval(doBackup, intervalMinutes * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [intervalMinutes]);
};

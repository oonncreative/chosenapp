import { useEffect } from "react";

export function useNotifications() {
  useEffect(() => {
    // Solicitar permissão ao carregar o app se ainda não foi decidida
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Configurar o intervalo de 3 horas (10800000 ms)
    const interval = setInterval(() => {
      sendMomentNotification();
    }, 3 * 60 * 60 * 1000); 

    return () => clearInterval(interval);
  }, []);
}

function sendMomentNotification() {
  if ("Notification" in window && Notification.permission === "granted") {
    const titles = [
      "Um momento para você",
      "Ressoa",
      "Pausa para a alma",
      "Uma palavra de fé"
    ];
    const messages = [
      "Como você está se sentindo agora?",
      "Tire um segundo para ler algo importante.",
      "Uma mensagem de esperança te espera.",
      "Deixe a paz preencher seu momento."
    ];

    const randomIndex = Math.floor(Math.random() * titles.length);
    
    new Notification(titles[randomIndex], {
      body: messages[randomIndex],
      icon: "https://cdn.lovable.dev/assets/favicon.ico"
    });
  }
}

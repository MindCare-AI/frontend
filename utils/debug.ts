export const debugWebSocket = (enabled: boolean = true) => {
  return {
    log: (message: string, ...args: any[]) => {
      if (enabled) {
        console.log(`[WebSocket] ${message}`, ...args);
      }
    },
    error: (message: string, ...args: any[]) => {
      if (enabled) {
        console.error(`[WebSocket Error] ${message}`, ...args);
      }
    }
  };
};

export const wsDebug = debugWebSocket();
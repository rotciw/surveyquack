import { useEffect } from "react";

export function useEventSourceWithRetry(url: string, onMessage: (data: any) => void) {
    useEffect(() => {
      let eventSource: EventSource | null = null;
      let retryCount = 0;
      let retryTimeout: NodeJS.Timeout;
      const maxRetries = 5;
      const baseDelay = 1000;
  
      function connect() {
        if (eventSource) {
          eventSource.close();
        }
  
        eventSource = new EventSource(url);
  
        eventSource.onmessage = (event) => {
          if (!event.data.startsWith(":")) {  // Ignore keepalive messages
            try {
              const data = JSON.parse(event.data);
              onMessage(data);
            } catch (error) {
              console.error('Error parsing event data:', error);
            }
          }
        };
  
        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            if (retryCount < maxRetries) {
              const delay = baseDelay * Math.pow(2, retryCount);
              retryCount++;
              retryTimeout = setTimeout(connect, delay);
            }
          }
        };
  
        eventSource.onopen = () => {
          retryCount = 0;
        };
      }
  
      // Handle visibility change
      function handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
          connect();
        } else if (eventSource) {
          eventSource.close();
        }
      }
  
      // Handle online/offline status
      function handleOnline() {
        connect();
      }
  
      function handleOffline() {
        if (eventSource) {
          eventSource.close();
        }
      }
  
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
  
      connect();
  
      return () => {
        if (eventSource) {
          eventSource.close();
        }
        clearTimeout(retryTimeout);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, [url, onMessage]);
  }
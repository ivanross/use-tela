import * as React from 'react';
import { Console, Hook, Unhook } from 'console-feed';

const LogsContainer = () => {
  const [logs, setLogs] = React.useState<any[]>([]);

  // run once!
  React.useEffect(() => {
    Hook(
      window.console,
      log => setLogs(currLogs => [...currLogs, log].slice(-10)),
      false
    );
    return () => {
      Unhook(window.console as any);
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: '#313a4e',
        height: 200,
        overflowY: 'scroll',
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Console logs={logs} variant="dark" />
    </div>
  );
};

export { LogsContainer };

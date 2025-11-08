type LogLevel = 'log' | 'warn' | 'error';

const emit = (level: LogLevel, ...args: unknown[]) => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  // eslint-disable-next-line no-console
  console[level](...args);
};

export const logDev = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  emit('log', ...args);
};

export const logWarn = (...args: unknown[]) => emit('warn', ...args);
export const logError = (...args: unknown[]) => emit('error', ...args);

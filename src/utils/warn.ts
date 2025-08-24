const warnedMessages = new Set<string>();

export function warnOnce(message: string) {
  if(!warnedMessages.has(message)){
    console.warn("⚠️ Warning:", message);
    warnedMessages.add(message);
  }
}

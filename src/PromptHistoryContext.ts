import { createContext, useContext } from 'react';

// The running list of prompts sent to the Creation Assistant. The Asset Graph's
// prompt-history node reads this to show what's been generated so far.
export const PromptHistoryContext = createContext<string[]>([]);

export const usePromptHistory = () => useContext(PromptHistoryContext);

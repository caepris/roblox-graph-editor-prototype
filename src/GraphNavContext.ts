import { createContext, useContext } from 'react';

// Lets a node inside the React Flow canvas navigate to another graph domain.
export const GraphNavContext = createContext<(domainId: string) => void>(() => {});

export const useGraphNav = () => useContext(GraphNavContext);

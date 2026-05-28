import { StartClient } from "@tanstack/react-start/client";
import { hydrateRoot } from "react-dom/client";

// The Vite plugin's virtual #tanstack-router-entry wires createRouter() from router.tsx.
// Importing router.tsx here ensures it is included in the client bundle and
// the Register interface is populated for type inference.
import "./router";

hydrateRoot(document, <StartClient />);

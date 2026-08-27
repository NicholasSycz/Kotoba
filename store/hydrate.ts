import { createAction } from "@reduxjs/toolkit";

import type { PersistedState } from "@/lib/storage";

export const hydrate = createAction<PersistedState>("app/hydrate");

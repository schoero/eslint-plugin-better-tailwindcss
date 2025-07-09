import { runAsWorker } from "synckit";

import { getCustomComponentClasses } from "./custom-component-classes.async.v3.js";


runAsWorker(getCustomComponentClasses);

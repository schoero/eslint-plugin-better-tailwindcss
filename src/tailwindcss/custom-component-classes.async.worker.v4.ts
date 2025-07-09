import { runAsWorker } from "synckit";

import { getCustomComponentClasses } from "./custom-component-classes.async.v4.js";


runAsWorker(getCustomComponentClasses);

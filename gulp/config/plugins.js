import replace from "gulp-replace";  // Search and replace
import plumber from "gulp-plumber"; // Error processing
import notify from "gulp-notify"; // Message
import browsersync from "browser-sync"; // Local server
import newer from "gulp-newer"; // Check for updates
import ifPlugin from "gulp-if"; // Conditional branch

// Export object
export const plugins = {
    replace: replace,
    plumber: plumber,
    notify: notify,
    browsersync: browsersync,
    newer: newer,
    ifPlugin: ifPlugin
}
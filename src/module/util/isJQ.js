export default function isJQuery(obj) {
    // All jQuery objects have an attribute that contains the jQuery version.
    return typeof obj === "object" && obj != null && obj.jquery != null;
}
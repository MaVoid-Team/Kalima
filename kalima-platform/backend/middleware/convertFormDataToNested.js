/**
 * Middleware to convert form-data bracket notation to nested objects
 * Converts: preferredContactTime[from] -> preferredContactTime: { from: value }
 */
module.exports = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
        return next();
    }

    const body = req.body;
    const result = {};

    for (const key in body) {
        if (body.hasOwnProperty(key)) {
            // Match bracket notation: fieldName[subKey]
            const bracketMatch = key.match(/^(\w+)\[(\w+)\]$/);

            if (bracketMatch) {
                const [, fieldName, subKey] = bracketMatch;

                // Initialize parent object if it doesn't exist
                if (!result[fieldName]) {
                    result[fieldName] = {};
                }

                // Add the sub-key to the parent object
                result[fieldName][subKey] = body[key];
            } else {
                // Not bracket notation, just copy as is
                result[key] = body[key];
            }
        }
    }

    req.body = result;
    next();
};

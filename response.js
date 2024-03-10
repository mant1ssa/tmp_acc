class ApiError extends Error {
    description = null;

    constructor(code, httpStatusCode, message) {
        super(message);
        this.code = code;
        this.statusCode = httpStatusCode;
    }

    describe(description) {
        const describedError = new ApiResponse(this.code, this.statusCode, this.message);
        describedError.description = description;
        return describedError;
    }
}

const ApiErrors = {
    
}
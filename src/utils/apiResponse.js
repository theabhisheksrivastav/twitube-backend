class apiResponse {
    constructor(statusCode, message = "Success", data) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
    }
}

export { apiResponse }
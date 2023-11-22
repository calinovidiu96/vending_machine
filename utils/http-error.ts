class HttpError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export default HttpError;

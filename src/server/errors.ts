import { ErrorMessage } from './constants';

export class ImplementsError extends Error {
	name: string = 'Implement Error';

	constructor() {
		super(ErrorMessage.IMPLEMENT);
	}
}

export class RequiredError extends Error {
	name: string = 'Required Error';

	constructor() {
		super(ErrorMessage.REQUIRED);
	}
}

export class ContentTypeValidateError extends Error {
	name: string = 'Content-Type validation error';

	constructor() {
		super(ErrorMessage.CONTENT_TYPE_VALIDATION_ERROR);
	}
}

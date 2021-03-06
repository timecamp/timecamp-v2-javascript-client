import autobind from 'class-autobind';

import ApiError from '../ApiError';

export default class ApiResponse {
    constructor(error, data) {
        autobind(this);

        this.error = error;
        this.data = data;
    }
}

ApiResponse.parseHttpResponse = async(httpResponse) => {
    let apiError;
    let httpJson;
    if (httpResponse.status < 200
        || httpResponse.status >= 300
    ) {
        apiError = new ApiError(httpResponse.status, 'REQUEST_ERROR');
        try {
            apiError.errorResponse = await httpResponse.json();
        } catch (error) {
            apiError.errorResponse = await httpResponse.text();
        }
    } else {
        httpJson = await httpResponse.json();
    }

    return new ApiResponse(apiError, httpJson);
};

ApiResponse.parseRawResponse = async(httpResponse) => {
    let apiError;
    let httpText;
    if (httpResponse.status < 200
        || httpResponse.status >= 300
    ) {
        apiError = await new ApiError(httpResponse.status, 'REQUEST_ERROR', httpResponse);
        apiError.errorResponse = await httpResponse.text();
    } else {
        httpText = await httpResponse.text();
    }


    return new ApiResponse(apiError, httpText);
};

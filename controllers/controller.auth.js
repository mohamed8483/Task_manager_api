const authservice = require('../services/service.auth');
const HTTP_STATUS = require('../constants/httpStatus');
const postcontrollerauth = async (req, res) => {
    const { username, email, password } = req.body;

    const result = await authservice.register_user(username, email,
        password);

    if (result.success) {
        return res.status(HTTP_STATUS.CREATED).json(result);
    }
    const errors = {
        INVALID_USERNAME: HTTP_STATUS.BAD_REQUEST,
        INVALID_EMAIL: HTTP_STATUS.BAD_REQUEST,
        INVALID_PASSWORD: HTTP_STATUS.BAD_REQUEST,
        USERNAME_ALREADY_EXISTS: HTTP_STATUS.CONFLICT,
        EMAIL_ALREADY_EXISTS: HTTP_STATUS.CONFLICT
    };

    return res.status(
        errors[result.error] || HTTP_STATUS.INTERNAL_SERVER_ERROR
    ).json(result);
}
const postcontrollerlogin = async (req, res) => {
    const { identifier, password } = req.body;
    const result = await authservice.login_user(identifier, password);
    const errors = {
        INVALID_IDENTIFIER: HTTP_STATUS.BAD_REQUEST,
        INVALID_PASSWORD: HTTP_STATUS.BAD_REQUEST,
        INVALID_CREDENTIALS: HTTP_STATUS.UNAUTHORIZED
    }
    if(result.success === true){
        return res.status(HTTP_STATUS.OK).json(result)
    }
    return res.status(errors[result.error] || HTTP_STATUS.INTERNAL_SERVER_ERROR ).json(result);
}
module.exports = {
    postcontrollerauth,
    postcontrollerlogin
}